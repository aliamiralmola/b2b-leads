"use client";

import { useState, useEffect } from "react";
import {
    Copy,
    Link as LinkIcon,
    MousePointer2,
    Users,
    DollarSign,
    Calendar,
    ArrowUpRight,
    Check,
    Mail,
    Linkedin
} from "lucide-react";
import { createAffiliateLink } from "@/app/actions/createAffiliateLink";
import { fetchReferralHistory } from "@/app/actions/affiliates";
import { createClient } from "@/utils/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReferralEntry {
    date: string;
    email: string;
    status: string;
    commission: string;
}

export default function AffiliatePage() {
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const [stats, setStats] = useState({
        clicks: 0,
        signups: 0,
        earnings: "0.00"
    });
    const [referralHistory, setReferralHistory] = useState<ReferralEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");
    const [isUpdatingWallet, setIsUpdatingWallet] = useState(false);
    const [origin, setOrigin] = useState("");
    const supabase = createClient();

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin);
        }
        async function initAffiliate() {
            setIsLoading(true);
            try {
                // Get or create affiliate link
                const result = await createAffiliateLink();
                if (result.success && result.referralCode) {
                    setReferralCode(result.referralCode);
                }

                // Fetch real stats from DB
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: affiliateData } = await supabase
                        .from('affiliates')
                        .select('clicks_count, signups_count, earnings, wallet_address')
                        .eq('user_id', user.id)
                        .single();

                    if (affiliateData) {
                        setStats({
                            clicks: affiliateData.clicks_count || 0,
                            signups: affiliateData.signups_count || 0,
                            earnings: Number(affiliateData.earnings).toFixed(2)
                        });
                        setWalletAddress(affiliateData.wallet_address || "");
                    }
                }
                // Fetch referral history
                const history = await fetchReferralHistory();
                setReferralHistory(history);
            } catch (error) {
                console.error("Error initializing affiliate:", error);
            } finally {
                setIsLoading(false);
            }
        }
        initAffiliate();
    }, [supabase]);

    const referralLink = `${origin}?ref=${referralCode || "......"}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setIsCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleUpdateWallet = async () => {
        setIsUpdatingWallet(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from('affiliates')
                .update({ wallet_address: walletAddress })
                .eq('user_id', user.id);

            if (error) throw error;
            toast.success("Wallet address updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update wallet address");
        } finally {
            setIsUpdatingWallet(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    const statCards = [
        { label: "Total Clicks", value: stats.clicks, icon: MousePointer2, color: "text-blue-400" },
        { label: "Total Signups", value: stats.signups, icon: Users, color: "text-emerald-400" },
        { label: "Total Earnings", value: `$${stats.earnings}`, icon: DollarSign, color: "text-indigo-400" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Affiliate Program</h2>
                <p className="text-muted-foreground max-w-2xl">
                    Invite others to b2bleads and earn commission on every signup.
                </p>
            </div>

            {/* Referral Link Card */}
            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-2xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <LinkIcon className="h-32 w-32 -mr-8 -mt-8 rotate-12 text-indigo-400" />
                </div>

                <div className="relative z-10 max-w-xl">
                    <h3 className="text-xl font-bold text-foreground mb-4">Your Referral Link</h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                        Share this link with your network. When someone signs up through your link, they'll be tracked as your referral.
                    </p>

                    <div className="flex gap-2">
                        <div className="flex-1 bg-black/20 dark:bg-black/40 border border-border rounded-xl px-4 py-3 text-foreground/80 font-mono text-sm flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
                            {referralLink}
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl font-medium transition-all flex items-center gap-2 active:scale-95"
                        >
                            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {isCopied ? "Copied" : "Copy"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-card border border-border p-6 rounded-2xl hover:border-primary/10 transition-all">
                        <div className={`p-3 rounded-xl bg-muted w-fit mb-4 ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Payout Settings */}
            <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground">Payout Settings</h3>
                        <p className="text-sm text-muted-foreground">Commission is paid in USDT (BEP20/ERC20) on the 1st of every month.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">USDT Wallet Address (BEP20/ERC20)</label>
                        <input
                            type="text"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            placeholder="0x..."
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button
                            onClick={handleUpdateWallet}
                            disabled={isUpdatingWallet}
                            className="h-12 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl"
                        >
                            {isUpdatingWallet ? "Saving..." : "Save Wallet"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Referral History Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Referral History</h3>
                    <span className="text-xs text-indigo-400 font-medium bg-indigo-400/10 px-2 py-1 rounded-md border border-indigo-400/20">
                        Live Tracking
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/50">
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Email</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commission</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {referralHistory.length > 0 ? (
                                referralHistory.map((row, i) => (
                                    <tr key={i} className="hover:bg-muted transition-colors group">
                                        <td className="px-6 py-4 text-sm text-foreground/80">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {row.date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground/80 font-medium">
                                            {row.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.status === "Active"
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground font-bold">
                                            {row.commission}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-muted-foreground group-hover:text-foreground transition-colors">
                                                <ArrowUpRight className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No referral history yet. Share your link to start earning!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
