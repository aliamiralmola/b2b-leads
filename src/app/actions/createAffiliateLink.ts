"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Generates a unique 6-character affiliate code (e.g., MOLA26)
 */
function generateReferralCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function createAffiliateLink() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // Check if user already has an affiliate record
    const { data: existingAffiliate, error: fetchError } = await supabase
        .from('affiliates')
        .select('referral_code')
        .eq('user_id', user.id)
        .single();

    if (existingAffiliate) {
        return { success: true, referralCode: existingAffiliate.referral_code };
    }

    // Generate a unique code
    let referralCode = generateReferralCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
        const { data } = await supabase
            .from('affiliates')
            .select('referral_code')
            .eq('referral_code', referralCode)
            .single();

        if (!data) {
            isUnique = true;
        } else {
            referralCode = generateReferralCode();
            attempts++;
        }
    }

    // Insert new affiliate record
    const { error: insertError } = await supabase
        .from('affiliates')
        .insert({
            user_id: user.id,
            referral_code: referralCode,
            clicks_count: 0,
            signups_count: 0,
            earnings: 0
        });

    if (insertError) {
        console.error("Affiliate link generation error:", insertError);
        throw new Error("Failed to generate affiliate link.");
    }

    revalidatePath('/dashboard/affiliates');
    return { success: true, referralCode };
}
