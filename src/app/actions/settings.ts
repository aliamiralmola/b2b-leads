"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAndTeam(data: {
    fullName: string;
    companyName: string;
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

    revalidatePath('/dashboard/settings');
    return { success: true };
}
