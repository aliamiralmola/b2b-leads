"use server";

import { createClient } from "@/utils/supabase/server";

export async function fetchReferralHistory() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // 1. Get the affiliate record first
    const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!affiliate) return [];

    // 2. Fetch referrals linked to this affiliate
    const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching referrals:", error);
        return [];
    }

    return data.map(r => ({
        date: new Date(r.created_at).toISOString().split('T')[0],
        email: r.referred_email ? r.referred_email.replace(/^(..)(.*)(?=@)/, (_: string, gp1: string, gp2: string) => gp1 + "*".repeat(gp2.length)) : "Hidden",
        status: r.status,
        commission: `$${Number(r.commission || 0).toFixed(2)}`
    }));
}
