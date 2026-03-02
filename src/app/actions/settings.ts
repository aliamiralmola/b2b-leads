"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { verifyOrigin } from "@/utils/security";
import { revalidatePath } from "next/cache";
import { FREE_TRIAL_CREDITS } from "@/lib/plans";

export async function ensureProfileExists() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return { error: "Unauthorized" };

    // Check if profile exists
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, credits')
        .eq('id', user.id)
        .single();

    if (fetchError || !profile) {
        // Create profile with initial credits
        const { error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                full_name: user.user_metadata.full_name || "",
                credits: FREE_TRIAL_CREDITS
            });

        if (insertError) {
            console.error("Error creating initial profile:", insertError);
            return { error: "Failed to create profile" };
        }
    } else if (profile.credits === 0) {
        // If profile exists but 0 credits and it's a new or problematic account, 
        // we could potentially grant credits here, but better to trust the initial insert.
    }

    return { success: true };
}

export async function updateProfileAndTeam(data: {
    fullName: string;
    companyName: string;
    email?: string;
}) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // 1. Update Profile (Full Name)
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: data.fullName })
        .eq('id', user.id);

    if (profileError) {
        console.error("Profile update error:", profileError);
        throw new Error("Failed to update profile name.");
    }

    // 2. Update/Create Team (Company Name)
    let { data: team, error: teamFetchError } = await supabase
        .from('teams')
        .select('id')
        .eq('owner_id', user.id)
        .single();

    if (teamFetchError || !team) {
        const { error: teamInsertError } = await supabase
            .from('teams')
            .insert({
                owner_id: user.id,
                name: data.companyName
            });

        if (teamInsertError) {
            console.error("Team insert error:", teamInsertError);
            throw new Error("Failed to create team.");
        }
    } else {
        const { error: teamUpdateError } = await supabase
            .from('teams')
            .update({ name: data.companyName })
            .eq('id', team.id);

        if (teamUpdateError) {
            console.error("Team update error:", teamUpdateError);
            throw new Error("Failed to update team name.");
        }
    }

    // 3. Handle Email Update if provided and different
    if (data.email && data.email !== user.email) {
        const { error: emailUpdateError } = await supabase.auth.updateUser({
            email: data.email
        });

        if (emailUpdateError) {
            console.error("Email update error:", emailUpdateError);
            throw new Error(emailUpdateError.message);
        }
    }

    revalidatePath('/dashboard/settings');
    return { success: true };
}

export async function deleteAccount() {
    await verifyOrigin();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // 1. Delete associated data
    // Delete search history
    await supabase.from('search_history').delete().eq('user_id', user.id);

    // Delete bookmarks
    await supabase.from('bookmarked_leads').delete().eq('user_id', user.id);

    // Delete payments
    await supabase.from('payments').delete().eq('user_id', user.id);

    // Delete affiliates (if they are an affiliate)
    await supabase.from('affiliates').delete().eq('user_id', user.id);

    // Delete team memberships or teams owned
    // First, if they own a team, we might need to handle team members? 
    // For simplicity, we delete team_members where they are part of a team, 
    // or if they own a team, we delete that team and its members.
    const { data: ownedTeam } = await supabase.from('teams').select('id').eq('owner_id', user.id).single();
    if (ownedTeam) {
        await supabase.from('team_members').delete().eq('team_id', ownedTeam.id);
        await supabase.from('teams').delete().eq('id', ownedTeam.id);
    }
    await supabase.from('team_members').delete().eq('email', user.email);

    // 2. Delete the profile data
    const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

    if (profileDeleteError) {
        console.error("Error deleting profile:", profileDeleteError);
        throw new Error("Failed to delete account data.");
    }

    // 3. Delete from Supabase Auth (Requires Service Role Key)
    const adminSupabase = createServiceClient();
    if (adminSupabase) {
        const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(user.id);
        if (authDeleteError) {
            console.error("Error deleting user from Auth:", authDeleteError);
            // We don't throw here to avoid half-deleted state, but we log it.
        }
    }

    await supabase.auth.signOut();
    revalidatePath('/');
    return { success: true };
}
