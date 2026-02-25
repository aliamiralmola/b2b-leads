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
    Check
} from "lucide-react";
import { createAffiliateLink } from "@/app/actions/createAffiliateLink";
import { createClient } from "@/utils/supabase/client";

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
    const [isLoading, setIsLoading] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    const supabase = createClient();

    const referralHistory: ReferralEntry[] = [
        { date: "2024-05-20", email: "al***@gmail.com", status: "Active", commission: "$5.00" },
        { date: "2024-05-18", email: "jo***@outlook.com", status: "Pending", commission: "$0.00" },
        { date: "2024-05-15", email: "sa***@company.io", status: "Active", commission: "$12.50" },
    ];

    useEffect(() => {
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
                        .select('clicks_count, signups_count, earnings')
                        .eq('user_id', user.id)
                        .single();

                    if (affiliateData) {
                        setStats({
                            clicks: affiliateData.clicks_count || 0,
                            signups: affiliateData.signups_count || 0,
                            earnings: Number(affiliateData.earnings).toFixed(2)
                        });
                    }
                }
            } catch (error) {
                console.error("Error initializing affiliate:", error);
            } finally {
                setIsLoading(false);
            }
        }
        initAffiliate();
    }, [supabase]);

    const referralLink = `https://b2bleads.abaaad.net?ref=${referralCode || "......"}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
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
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Affiliate Program</h2>
                <p className="text-gray-400 max-w-2xl">
                    Invite others to Nexus B2B and earn commission on every signup.
                </p>
            </div>

            {/* Referral Link Card */}
            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-2xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <LinkIcon className="h-32 w-32 -mr-8 -mt-8 rotate-12 text-indigo-400" />
                </div>

                <div className="relative z-10 max-w-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Your Referral Link</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                        Share this link with your network. When someone signs up through your link, they'll be tracked as your referral.
                    </p>

                    <div className="flex gap-2">
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-300 font-mono text-sm flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
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
                    <div key={i} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all">
                        <div className={`p-3 rounded-xl bg-white/5 w-fit mb-4 ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Referral History Table */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Referral History</h3>
                    <span className="text-xs text-indigo-400 font-medium bg-indigo-400/10 px-2 py-1 rounded-md border border-indigo-400/20">
                        Live Tracking
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User Email</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Commission</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {referralHistory.map((row, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            {row.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300 font-medium">
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
                                    <td className="px-6 py-4 text-sm text-white font-bold">
                                        {row.commission}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-500 group-hover:text-white transition-colors">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
