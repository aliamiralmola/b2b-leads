"use server";

import { createClient } from "@/utils/supabase/server";
import { verifyOrigin } from "@/utils/security";
import { countries } from "@/lib/countries";

export interface Lead {
    id: string;
    name: string;
    address: string;
    phone: string;
    website: string;
    rating: number;
}

export interface LinkedInFilters {
    company?: string;
    current_company?: string;
    first_name?: string;
    geocode_location?: string;
    industry?: string;
    last_name?: string;
    name?: string;
    profile_language?: string;
    school?: string;
    service_category?: string;
    title?: string;
}

function extractEmail(text: string): string | null {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    return matches ? matches[0].toLowerCase() : null;
}

function extractPhone(text: string): string | null {
    // Basic phone regex for multiple formats
    const phoneRegex = /(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g;
    const matches = text.match(phoneRegex);
    return matches ? matches[0] : null;
}

function isLikelyLead(item: any): boolean {
    const title = (item.title || "").toLowerCase();
    const snippet = (item.snippet || "").toLowerCase();
    
    // Blacklist non-lead patterns
    const blacklist = [
        "wikipedia.org", "news", "reporting", "how to", "market analysis", 
        "industry report", "market trends", "forecast", "statistics",
        "entering the market", "market size", "consumer behavior", "definition"
    ];
    
    if (blacklist.some(word => title.includes(word) || snippet.includes(word))) {
        return false;
    }

    // Must have a link and not be a major generic site unless it's the direct lead
    const link = (item.link || "").toLowerCase();
    if (!link || link.includes("google.com/search") || link.includes("youtube.com/watch")) {
        return false;
    }

    return true;
}

export async function searchLeads(
    keyword: string,
    city: string,
    countryCode: string = "us",
    requestedLimit: number = 100, // Now statically 100
    minRating: number = 0,
    minReviews: number = 0,
    maxDistance: number = 50,
    onlyOpenNow: boolean = false,
    source: string = "linkedin", // 'linkedin', 'facebook', 'instagram', 'twitter', 'google'
    linkedinFilters?: LinkedInFilters,
    isWorldwide: boolean = false
) {
    await verifyOrigin();
    const supabase = await createClient();

    // 1. Verify Authentication & Confirmation
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized. Please log in.");
    }

    // 1.2 Rate Limiting (Prevent abuse)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: searchCount, error: countError } = await supabase
        .from('search_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('created_at', tenMinutesAgo);

    if (!countError && searchCount !== null && searchCount >= 20) {
        throw new Error("Too many search requests. Please wait a few minutes.");
    }

    if (!user.email_confirmed_at) {
        throw new Error("Please verify your email first.");
    }

    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
    if (!profile || profile.credits <= 0) {
        throw new Error("عذراً، البحث المدفوع فقط. يجب عليك الاشتراك في الباقة للتمكن من البحث واستخراج البيانات.");
    }

    // 1.5 Sanitize & Validate Inputs
    const sanitizedKeyword = keyword.trim().replace(/[<>"{}()[\]]/g, "");
    if (!sanitizedKeyword) {
        throw new Error("Invalid search keyword.");
    }

    let locationQuery = "";
    if (city && !isWorldwide) {
        if (/[<>"{}:;[\]]/.test(city)) {
            throw new Error("Invalid characters in city name.");
        }
        locationQuery = city;
    } else if (!isWorldwide && countryCode) {
        locationQuery = countries.find(c => c.code === countryCode)?.name || countryCode;
    }

    // 2. Build the correct scraping query for the Apps Script
    let siteOperator = "";
    if (source === "linkedin") siteOperator = "site:linkedin.com/in/ OR site:linkedin.com/company/";
    else if (source === "facebook") siteOperator = "site:facebook.com";
    else if (source === "instagram") siteOperator = "site:instagram.com";
    else if (source === "twitter") siteOperator = "site:twitter.com";
    
    // DEEP SEARCH: Optimization for business leads (Simplified for better Apps Script compatibility)
    let queryAddon = "";
    if (source === "google") {
        queryAddon = `contact address email phone`;
    }

    const finalQuery = `${sanitizedKeyword} ${locationQuery ? `in ${locationQuery}` : ""} ${siteOperator} ${queryAddon}`.trim();

    // 3. Duplicate Cleaner: Fetch previous results from ALL history to ensure absolute uniqueness
    const { data: previousSearches } = await supabase
        .from('search_history')
        .select('results_data')
        .eq('user_id', user.id);

    const existingLeadKeys = new Set(
        previousSearches?.flatMap(s => (s.results_data as any[] || []).map(l =>
            `${l.name.toLowerCase().trim()}_${(l.website || '').toLowerCase().trim()}`
        )) || []
    );

    // 4. Fetch Results from Premium Engine (Apify)
    const debugLogs: string[] = [];
    debugLogs.push(`--- SCANNING WITH ENGINE ---`);
    debugLogs.push(`Keyword: ${sanitizedKeyword} | Source: ${source}`);
    
    try {
        const apifyToken = process.env.APIFY_API_TOKEN;
        if (!apifyToken) throw new Error("Apify API Token not configured.");
        const actorId = "compass~crawler-google-places";
        const runUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${apifyToken}`;
        
        debugLogs.push(`Calling Apify actor: ${actorId}`);
        const response = await fetch(runUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                searchStringsArray: [finalQuery],
                maxCrawledPlacesPerSearch: requestedLimit || 20,
                language: "en"
            })
        });

        if (!response.ok) {
             const errText = await response.text();
             throw new Error(`Apify responded with status: ${response.status}. Details: ${errText}`);
        }
        
        let data = await response.json();
        
        if (!Array.isArray(data)) data = [];
        
        if (data.length === 0) {
            debugLogs.push(`WARNING: Premium engine returned 0 results.`);
        }

        // 5. Smart Filtering & Professional Mapping
        const formattedLeads = data
            .map((item: any, idx: number) => {
                const title = item.title || item.name || "N/A";
                const website = item.website || item.url || "";
                const phone = item.phoneUnformatted || item.phone || "N/A";
                const email = item.email || null;
                
                let qualityScore = 40;
                if (email) qualityScore += 20;
                if (phone !== "N/A") qualityScore += 20;
                if (website && !website.includes("google.com")) qualityScore += 10;
                
                return {
                    id: `fs-${Math.random().toString(36).substr(2, 9)}-${idx}`,
                    name: title,
                    address: item.address || locationQuery || "United States",
                    phone: phone,
                    website: website,
                    email: email,
                    socials: { linkedin: null, facebook: null, instagram: null, twitter: null },
                    rating: item.totalScore || 0,
                    reviews: item.reviewsCount || 0,
                    industry: sanitizedKeyword,
                    quality_score: qualityScore,
                    ai_insight: `Verified Lead via Premium Search.`,
                    lat: item.location?.lat || null,
                    lng: item.location?.lng || null,
                    is_verified: !!(email || phone !== "N/A"),
                };
            });

        // Filter duplicates and only keep new leads using composite key
        const initialCount = formattedLeads.length;
        debugLogs.push(`Formatted Leads count (before deduplication): ${initialCount}`);
        
        const deduplicatedLeads = formattedLeads.filter(lead => {
            const key = `${lead.name.toLowerCase().trim()}_${(lead.website || '').toLowerCase().trim()}`;
            return !existingLeadKeys.has(key);
        });
        const duplicateCount = initialCount - deduplicatedLeads.length;
        debugLogs.push(`Duplicates removed: ${duplicateCount}`);
        debugLogs.push(`Final Leads to return: ${deduplicatedLeads.length}`);

        // 6. Record Search History
        const { error: historyError } = await supabase
            .from('search_history')
            .insert({
                user_id: user.id,
                keyword: sanitizedKeyword,
                location: city || 'Worldwide',
                results_count: deduplicatedLeads.length,
                results_data: deduplicatedLeads, // Save 0-cost data
            });

        if (historyError) {
            debugLogs.push(`Warning: Failed to insert history - ${historyError.message}`);
            console.error("Failed to record search history:", historyError);
        } else {
            debugLogs.push(`History recorded successfully.`);
        }

        // Deduct 1 credit for the search
        const newCredits = Math.max(0, profile.credits - 1);
        await supabase.from('profiles').update({ credits: newCredits }).eq('id', user.id);

        return {
            leads: deduplicatedLeads,
            creditsRemaining: newCredits,
            duplicateCount: duplicateCount,
            debugLogs: debugLogs
        };

    } catch (error: any) {
        debugLogs.push(`CAUGHT EXCEPTION: ${error.message}`);
        console.error("Error fetching leads from Engine:", error);
        throw new Error(`Search Engine Error: ${error.message || "Failed to search leads. Please try again later."}\n\nDEBUG LOGS:\n${debugLogs.join('\n')}`);
    }
}

export async function deleteSearchHistory(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error("Error deleting history:", error);
        throw new Error("Failed to delete search history.");
    }

    return { success: true };
}

export async function saveLead(lead: Lead) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('bookmarked_leads')
        .insert({
            user_id: user.id,
            lead_data: lead,
            business_name: lead.name
        });

    if (error) {
        console.error("Error saving lead:", error);
        throw new Error("Failed to bookmark lead.");
    }

    return { success: true };
}

export async function getBookmarks() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('bookmarked_leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching bookmarks:", error);
        return [];
    }

    return data || [];
}

export async function deleteBookmark(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('bookmarked_leads')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error("Error deleting bookmark:", error);
        throw new Error("Failed to delete bookmark.");
    }

    return { success: true };
}
