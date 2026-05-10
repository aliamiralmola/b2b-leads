"use server";

import { createServiceClient } from "@/utils/supabase/service";
import { createClient as createServerClient } from "@/utils/supabase/server";

async function getAdminClient() {
    const serviceClient = createServiceClient();
    if (serviceClient) return serviceClient;
    return await createServerClient();
}

export async function checkAdminServiceStatus() {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return !!serviceKey;
}

export async function getAdminUsers(searchQuery: string = "", page: number = 1, pageSize: number = 20) {
    const supabase = await getAdminClient();
    const offset = (page - 1) * pageSize;

    // 1. Fetch Profiles
    let profileQuery = supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            email,
            credits
        `)
        .range(offset, offset + pageSize - 1)
        .order('email', { ascending: true });

    if (searchQuery) {
        profileQuery = profileQuery.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    const { data: profiles, error: profileError } = await profileQuery;

    if (profileError) {
        console.error("Error fetching admin profiles:", profileError);
        throw new Error(`Failed to fetch profiles: ${profileError.message}`);
    }

    if (!profiles || profiles.length === 0) return [];

    // 2. Fetch Payments for these users to determine plan status
    const userIds = profiles.map(p => p.id);
    const { data: payments, error: paymentError } = await supabase
        .from('payments')
        .select('user_id, plan_name, status, created_at')
        .in('user_id', userIds)
        .eq('status', 'completed');

    if (paymentError) {
        console.warn("Could not fetch payments, defaulting all to Free:", paymentError.message);
    }

    // 3. Merge data
    return profiles.map(user => {
        const userPayments = (payments || []).filter(p => p.user_id === user.id);
        const latestPayment = userPayments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        return {
            ...user,
            plan_name: latestPayment?.plan_name || 'Free',
            joined_at: latestPayment?.created_at || null // fallback
        };
    });
}

export async function updateUserPlan(userId: string, planName: string) {
    const supabase = await getAdminClient();

    // Insert a new completed payment record to override the plan
    const { error } = await supabase
        .from('payments')
        .insert({
            user_id: userId,
            plan_name: planName,
            status: 'completed',
            amount: 0,
            tx_hash: `MANUAL_OVERRIDE_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        });

    if (error) throw new Error(`Plan migration failed: ${error.message}`);
    return { success: true };
}

export async function adjustUserCredits(userId: string, amount: number) {
    const supabase = await getAdminClient();

    const { error } = await supabase
        .from('profiles')
        .update({ credits: amount })
        .eq('id', userId);

    if (error) throw new Error(`Credit adjustment failed: ${error.message}`);
    return { success: true };
}

export async function adminResetPassword(userId: string, email: string) {
    const supabase = createServiceClient();
    if (!supabase) throw new Error("Deep System Override (Auth) requires Service Role Key. Please contact infrastructure.");

    // This creates a reset link that can be emailed or given to the user
    const { data, error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email
    });

    if (error) throw new Error(`Recovery link generation failed: ${error.message}`);
    return { success: true, link: data.properties.action_link };
}

export async function adminDeleteUser(userId: string) {
    const supabase = createServiceClient();
    if (!supabase) throw new Error("Deep System Override (Purge) requires Service Role Key.");

    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw new Error(`System wipe failed: ${error.message}`);

    await supabase.from('profiles').delete().eq('id', userId);

    return { success: true };
}

export async function adminUpdateEmail(userId: string, newEmail: string) {
    const supabase = createServiceClient();
    if (!supabase) throw new Error("Deep System Override (Email) requires Service Role Key.");

    const { error } = await supabase.auth.admin.updateUserById(userId, {
        email: newEmail,
        email_confirm: true // Force confirm
    });

    if (error) throw new Error(`Email override failed: ${error.message}`);
    return { success: true };
}

// Support Message Actions
export async function sendSupportMessage(content: string, type: 'chat' | 'feedback' = 'chat') {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from('support_messages')
        .insert({
            user_id: user?.id || null,
            email: user?.email || 'Guest',
            content,
            type,
            status: 'unread'
        });

    if (error) {
        // Fallback if table doesn't exist yet, we silently succeed or log for admin
        console.warn("Support message table might be missing", error);
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function getSupportMessages() {
    const supabase = await getAdminClient();
    const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return [];
    return data;
}

export async function updateMessageStatus(id: string, status: 'read' | 'unread' | 'archived') {
    const supabase = await getAdminClient();
    const { error } = await supabase
        .from('support_messages')
        .update({ status })
        .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
}
export async function getAdminAffiliates() {
    const supabase = await getAdminClient();

    // Fetch all affiliates with their user profiles
    const { data: affiliates, error } = await supabase
        .from('affiliates')
        .select(`
            *,
            profiles:user_id (full_name, email)
        `)
        .order('earnings', { ascending: false });

    if (error) {
        console.error("Error fetching admin affiliates:", error);
        return [];
    }

    // Fetch related referrals for more detail (Total Paid, Total Pending)
    const { data: referrals } = await supabase
        .from('referrals')
        .select('affiliate_id, status, commission');

    return (affiliates || []).map(aff => {
        const affReferrals = (referrals || []).filter(r => r.affiliate_id === aff.id);
        return {
            ...aff,
            total_referrals: affReferrals.length,
            active_referrals: affReferrals.filter(r => r.status === 'Active').length,
            pending_referrals: affReferrals.filter(r => r.status === 'Pending').length,
            user_name: (aff.profiles as any)?.full_name || 'Anonymous',
            user_email: (aff.profiles as any)?.email || 'N/A'
        };
    });
}

export async function markPayoutAsPaid(affiliateId: string) {
    const supabase = await getAdminClient();

    // 1. Get current earnings to log/reset if needed (though usually we just update last_payout_at)
    const { data: aff } = await supabase.from('affiliates').select('earnings').eq('id', affiliateId).single();

    // 2. Update last payout date
    const { error } = await supabase
        .from('affiliates')
        .update({
            last_payout_at: new Date().toISOString()
        })
        .eq('id', affiliateId);

    if (error) throw new Error(error.message);
    return { success: true };
}

export async function getAffiliateReferrals(affiliateId: string) {
    const supabase = await getAdminClient();
    const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

    if (error) return [];
    return data;
}
