'use client'

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
    const supabase = createClient();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="destructive"
            className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 transition-all font-medium py-6"
            onClick={handleSignOut}
            disabled={isLoading}
        >
            <LogOut className="h-4 w-4" />
            {isLoading ? "Signing Out..." : "Sign Out"}
        </Button>
    );
}
