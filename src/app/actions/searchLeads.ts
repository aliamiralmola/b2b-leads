"use server";

import { ApifyClient } from "apify-client";
import { createClient } from "@/utils/supabase/server";

export interface Lead {
    name: string;
    address: string;
    phone: string;
    website: string;
    rating: number;
}

export async function searchLeads(keyword: string, city: string, countryCode: string = "us", requestedLimit: number = 10, minRating: number = 0) {
    const supabase = await createClient();

    // 1. Verify Authentication & Confirmation
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized. Please log in.");
    }

    if (!user.email_confirmed_at) {
        throw new Error("Please verify your email first.");
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
        searchStringsArray: [`${keyword} in ${city}`],
        maxCrawledPlacesPerSearch: requestedLimit,
        language: "en",
        countryCode: countryCode,
        allPlacesNoSearchAction: "",
    };

    try {
        const run = await client.actor("compass/crawler-google-places").call(input);
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        const formattedLeads = items
            .map((item: any) => ({
                name: item.title,
                address: item.address,
                phone: item.phoneUnformatted || item.phone,
                website: item.website,
                rating: item.totalScore || 0,
            }))
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

        const newCreditsBalance = Math.max(0, profile.credits - Math.ceil(totalCreditsToDeduct));

        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ credits: newCreditsBalance })
            .eq('id', user.id)
            .select('credits')
            .single();

        if (updateError) {
            console.error("Failed to decrement credits:", updateError);
        }

        // 6. Record Search History
        const { error: historyError } = await supabase
            .from('search_history')
            .insert({
                user_id: user.id,
                keyword,
                location: city,
                results_count: processedLeads.length,
                results_data: processedLeads.map(({ creditCost, ...rest }) => rest), // Don't store cost in history data blob
            });

        if (historyError) {
            console.error("Failed to record search history:", historyError);
        }

        // Return both leads and updated credits for the frontend
        return {
            leads: formattedLeads,
            creditsRemaining: updatedProfile?.credits ?? newCreditsBalance
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
