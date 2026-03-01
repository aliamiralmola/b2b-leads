'use client'

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export function SignOutButton() {
    const supabase = createClient();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

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
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 transition-all font-medium py-6"
                    disabled={isLoading}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0a0a] border-white/5 text-white">
                <DialogHeader>
                    <DialogTitle>Are you sure you want to sign out?</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        You will need to log in again to access your dashboard and search for leads.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/5">
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleSignOut} disabled={isLoading} className="bg-red-600 hover:bg-red-500 text-white font-bold">
                        {isLoading ? "Signing Out..." : "Confirm Sign Out"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
