"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function inviteTeamMember(email: string) {
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized. Please log in.");
    }

    // 2. Check if user has a team, or create one
    let { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('owner_id', user.id)
        .single();

    if (teamError || !team) {
        const { data: newTeam, error: createTeamError } = await supabase
            .from('teams')
            .insert({
                owner_id: user.id,
                name: 'My Workspace'
            })
            .select('id')
            .single();

        if (createTeamError) {
            console.error("Failed to create team:", createTeamError);
            throw new Error("Failed to create your team workspace.");
        }
        team = newTeam;
    }

    // 3. Insert the invited member
    const { error: inviteError } = await supabase
        .from('team_members')
        .insert({
            team_id: team.id,
            email: email
        });

    if (inviteError) {
        console.error("Failed to invite team member:", inviteError);
        throw new Error("Failed to invite team member. They might already be invited.");
    }

    revalidatePath('/dashboard/team');
    return { success: true };
}

export async function fetchTeamMembers() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // Fetch team first
    const { data: team } = await supabase
        .from('teams')
        .select('id')
        .eq('owner_id', user.id)
        .single();

    if (!team) return [];

    const { data: members, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', team.id);

    if (error) {
        console.error("Error fetching team members:", error);
        return [];
    }

    return members;
}

export async function removeTeamMember(memberId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

    if (error) {
        console.error("Error removing team member:", error);
        throw new Error("Failed to remove team member.");
    }

    revalidatePath('/dashboard/team');
    return { success: true };
}
