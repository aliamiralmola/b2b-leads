"use server";

import { ApifyClient } from "apify-client";
import { createClient } from "@/utils/supabase/server";

export async function searchLeads(keyword: string, city: string, countryCode: string = "us", requestedLimit: number = 10) {
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized. Please log in.");
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

        const formattedLeads = items.map((item: any) => ({
            name: item.title,
            address: item.address,
            phone: item.phoneUnformatted || item.phone,
            website: item.website,
            rating: item.totalScore,
        }));

        // 5. Decrement Credits upon Success based on actual extracted leads
        const actualLeadsFound = formattedLeads.length;
        const newCreditsBalance = profile.credits - actualLeadsFound;

        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ credits: newCreditsBalance })
            .eq('id', user.id)
            .select('credits')
            .single();

        if (updateError) {
            console.error("Failed to decrement credits:", updateError);
            // Non-fatal, return results still but ideally webhook deals with it. 
        }

        // 6. Record Search History
        const { error: historyError } = await supabase
            .from('search_history')
            .insert({
                user_id: user.id,
                keyword,
                location: city,
                results_count: actualLeadsFound,
                results_data: formattedLeads,
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
