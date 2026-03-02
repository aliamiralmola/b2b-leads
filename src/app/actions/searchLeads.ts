"use server";

import { ApifyClient } from "apify-client";
import { createClient } from "@/utils/supabase/server";
import { verifyOrigin } from "@/utils/security";

export interface Lead {
    name: string;
    address: string;
    phone: string;
    website: string;
    rating: number;
}

export async function searchLeads(keyword: string, city: string, countryCode: string = "us", requestedLimit: number = 10, minRating: number = 0) {
    await verifyOrigin();
    const supabase = await createClient();

    // 1. Verify Authentication & Confirmation
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized. Please log in.");
    }

    // 1.2 Rate Limiting (Prevent abuse)
    const tenMinutesAgo = new Set([new Date(Date.now() - 10 * 60 * 1000).toISOString()]);
    const { count: searchCount, error: countError } = await supabase
        .from('search_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('created_at', Array.from(tenMinutesAgo)[0]);

    if (!countError && searchCount !== null && searchCount >= 10) {
        throw new Error("Too many search requests. Please wait a few minutes.");
    }

    if (!user.email_confirmed_at) {
        throw new Error("Please verify your email first.");
    }

    // 1.5 Sanitize & Validate Inputs
    const sanitizedKeyword = keyword.trim().replace(/[<>"{}:;[\]]/g, "");
    if (!sanitizedKeyword) {
        throw new Error("Invalid search keyword.");
    }

    const cityRegex = /^[a-zA-Z\s,]+$/;
    if (!cityRegex.test(city)) {
        throw new Error("Invalid city format. Use letters and spaces only.");
    }

    // 2. Fetch User Credits
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        throw new Error("Unable to retrieve user profile or credits.");
    }

    // 3. Verify Sufficient Credits
    if (requestedLimit <= 0) {
        throw new Error("Requested limit must be greater than 0.");
    }
    if (profile.credits < requestedLimit) {
        throw new Error("Insufficient credits for this request. Please upgrade.");
    }

    // 3.5. Duplicate Cleaner: Fetch previous results from history to avoid double charging (#92)
    const { data: previousSearches } = await supabase
        .from('search_history')
        .select('results_data')
        .eq('user_id', user.id);

    const existingLeadNames = new Set(
        previousSearches?.flatMap(s => (s.results_data as any[] || []).map(l => l.name)) || []
    );

    // 4. Run Apify Scraper
    const apiKey = process.env.APIFY_API_TOKEN;
    if (!apiKey) {
        throw new Error("Apify API Token is missing from the environment.");
    }

    const client = new ApifyClient({ token: apiKey });

    const input = {
        searchStringsArray: [`${sanitizedKeyword} in ${city}`],
        maxCrawledPlacesPerSearch: requestedLimit,
        language: "en",
        countryCode: countryCode,
        allPlacesNoSearchAction: "",
    };

    try {
        const run = await client.actor("compass/crawler-google-places").call(input);
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        const formattedLeads = items
            .map((item: any) => {
                const name = item.title || "";
                const website = item.website || "";
                const address = item.address || "";

                // Heuristic-based Industry Detection
                let industry = "General Business";
                if (name.toLowerCase().includes("clinic") || name.toLowerCase().includes("dental")) industry = "Healthcare";
                else if (name.toLowerCase().includes("real estate") || name.toLowerCase().includes("realty")) industry = "Real Estate";
                else if (name.toLowerCase().includes("software") || name.toLowerCase().includes("tech")) industry = "Technology";
                else if (name.toLowerCase().includes("restaurant") || name.toLowerCase().includes("cafe")) industry = "Food & Beverage";

                // Heuristic Quality Scoring (0-100)
                let qualityScore = 30;
                if (item.totalScore > 4) qualityScore += 20;
                if (item.reviewsCount > 50) qualityScore += 20;
                if (item.phone) qualityScore += 15;
                if (item.website) qualityScore += 15;

                // Simulated AI Insight
                const ai_insight = `This ${industry.toLowerCase()} business has a ${item.totalScore > 4.5 ? 'stellar' : 'solid'} reputation with ${item.reviewsCount || 0} reviews. ${item.website ? 'Their digital presence is active.' : 'They might need help with a website.'}`;

                return {
                    name,
                    address,
                    phone: item.phoneUnformatted || item.phone,
                    website,
                    rating: item.totalScore || 0,
                    reviews: item.reviewsCount || 0,
                    industry,
                    quality_score: Math.min(100, qualityScore),
                    ai_insight,
                    lat: item.location?.lat,
                    lng: item.location?.lng,
                    is_verified: item.isClaimed || false,
                };
            })
            .filter((lead: any) => lead.rating >= minRating);

        // Filter duplicates and only keep new leads
        const initialCount = formattedLeads.length;
        const deduplicatedLeads = formattedLeads.filter(lead => !existingLeadNames.has(lead.name));
        const duplicateCount = initialCount - deduplicatedLeads.length;

        // 5. Decrement Credits upon Success based on data quality (#91)
        let totalCreditsToDeduct = 0;
        const processedLeads = deduplicatedLeads.map(lead => {
            const hasPhone = !!lead.phone;
            const hasWebsite = !!lead.website;

            let deduction = 1.0;
            if (!hasPhone && !hasWebsite) deduction = 0.2;
            else if (!hasPhone || !hasWebsite) deduction = 0.5;

            totalCreditsToDeduct += deduction;
            return { ...lead, creditCost: deduction };
        });

        // Use atomic update to prevent race conditions
        const finalDeduction = Math.ceil(totalCreditsToDeduct);

        const { data: updatedProfile, error: updateError } = await supabase
            .rpc('deduct_credits', {
                user_id: user.id,
                amount: finalDeduction
            });

        // Fallback if RPC doesn't exist yet (though we should ideally create it)
        if (updateError) {
            console.error("Failed to decrement credits via RPC:", updateError);
            // Fallback to manual update if RPC fails (e.g. not defined)
            const { data: fallbackProfile, error: fallbackError } = await supabase
                .from('profiles')
                .update({ credits: Math.max(0, profile.credits - finalDeduction) })
                .eq('id', user.id)
                .select('credits')
                .single();

            if (fallbackError) {
                console.error("Fallback credit update failed:", fallbackError);
                throw new Error("Failed to process credits. Please try again.");
            }
        }

        // 6. Record Search History
        const { error: historyError } = await supabase
            .from('search_history')
            .insert({
                user_id: user.id,
                keyword: sanitizedKeyword,
                location: city,
                results_count: processedLeads.length,
                results_data: processedLeads.map(({ creditCost, ...rest }) => rest), // Don't store cost in history data blob
            });

        if (historyError) {
            console.error("Failed to record search history:", historyError);
        }

        // Return deduplicated leads and updated credits for the frontend
        return {
            leads: deduplicatedLeads,
            creditsRemaining: updatedProfile?.credits || profile.credits - finalDeduction,
            duplicateCount: duplicateCount
        };

    } catch (error: any) {
        console.error("Error fetching leads from Apify:", error);
        throw new Error(`Apify Error: ${error.message || "Failed to search leads. Please try again later."}`);
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
        if (error.code === '42P01') {
            throw new Error("Table 'bookmarked_leads' does not exist. Please create it in Supabase.");
        }
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
