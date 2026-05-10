"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Zap, ArrowRight, CheckCircle2 } from "lucide-react";

interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
                <DialogHeader>
                    <div className="mx-auto bg-indigo-500/10 p-3 rounded-full mb-4 w-fit">
                        <Zap className="h-8 w-8 text-indigo-400" />
                    </div>
                    <DialogTitle className="text-center text-xl">Out of Free Credits!</DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        You've used all your credits. Upgrade to Enterprise for continued access to the Lead Engine.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-4">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground opacity-90">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Extended Lead Search & Filters</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground opacity-90">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Export leads directly to CSV / Excel</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground opacity-90">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Worldwide Search Capability</span>
                    </div>
                </div>

                <a href="/dashboard/billing" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 active:scale-95">
                    Upgrade to Enterprise
                    <ArrowRight className="h-4 w-4" />
                </a>
            </DialogContent>
        </Dialog>
    );
}
