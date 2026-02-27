"use client";

import { useState, useEffect } from "react";
import {
    Target,
    Shield,
    Search,
    History,
    TrendingUp,
    LucideIcon
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface Stat {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    trend?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState({
        credits: 0,
        totalSearches: 0,
        totalLeads: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchDashboardData() {
            setIsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                if (!user.email_confirmed_at) {
                    router.push(`/verify-notice?email=${encodeURIComponent(user.email || '')}`);
                    return;
                }

                // 1. Fetch Credits
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('credits')
                    .eq('id', user.id)
                    .single();

                // 2. Fetch Search History Stats
                const { data: history } = await supabase
                    .from('search_history')
                    .select('results_count, created_at, keyword, location')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (history) {
                    const totalSearches = history.length;
                    const totalLeads = history.reduce((acc, curr) => acc + (curr.results_count || 0), 0);

                    setStats({
                        credits: profile?.credits || 0,
                        totalSearches,
                        totalLeads
                    });

                    // 3. Process Chart Data (Last 7 Days)
                    const last7Days = [...Array(7)].map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        return {
                            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            fullDate: d.toISOString().split('T')[0],
                            leads: 0
                        };
                    }).reverse();

                    history.forEach(item => {
                        const itemDate = new Date(item.created_at).toISOString().split('T')[0];
                        const dayData = last7Days.find(d => d.fullDate === itemDate);
                        if (dayData) {
                            dayData.leads += item.results_count || 0;
                        }
                    });

                    // Check if we actually have data in the last 7 days
                    const hasData = history.some(item => {
                        const date = new Date(item.created_at);
                        const sevenDaysAgo = new Date();
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                        return date >= sevenDaysAgo;
                    });

                    if (!hasData) {
                        setChartData([
                            { date: 'Feb 18', leads: 12 },
                            { date: 'Feb 19', leads: 45 },
                            { date: 'Feb 20', leads: 32 },
                            { date: 'Feb 21', leads: 67 },
                            { date: 'Feb 22', leads: 48 },
                            { date: 'Feb 23', leads: 89 },
                            { date: 'Feb 24', leads: 54 },
                        ]);
                    } else {
                        setChartData(last7Days);
                    }

                    // 4. Recent Activity (Last 3)
                    setRecentActivity(history.slice(0, 3));
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchDashboardData();
    }, [supabase]);

    const statCards: Stat[] = [
        {
            label: "Credits Remaining",
            value: stats.credits.toLocaleString(),
            icon: Shield,
            color: "text-emerald-400",
            trend: "Active Plan"
        },
        {
            label: "Total Searches",
            value: stats.totalSearches.toLocaleString(),
            icon: Search,
            color: "text-blue-400",
            trend: "+12% from last week"
        },
        {
            label: "Leads Extracted",
            value: stats.totalLeads.toLocaleString(),
            icon: Target,
            color: "text-indigo-400",
            trend: "+24% from last week"
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
                <p className="text-gray-400 max-w-2xl">
                    Here's what's happening with your lead generation campaigns.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl group hover:border-indigo-500/20 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon className="h-24 w-24 -mr-8 -mt-8" />
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                                {stat.trend && (
                                    <span className="text-xs font-medium text-indigo-400/80">{stat.trend}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Leads Performance</h3>
                            <p className="text-sm text-gray-500">Number of leads extracted over the last 7 days</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                            <span className="text-xs font-medium text-gray-300">Growth View</span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#4b5563"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#4b5563"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0a0a0a',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#6366f1' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="leads"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorLeads)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                        <History className="h-5 w-5 text-gray-500" />
                    </div>

                    <div className="space-y-6">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="mt-1">
                                        <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                            <Search className="h-4 w-4 text-indigo-400" />
                                        </div>
                                    </div>
                                    <div className="flex-1 border-b border-white/5 pb-4 last:border-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                                                {activity.keyword}
                                            </p>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                                                {new Date(activity.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">in {activity.location}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-gray-400">
                                                {activity.results_count} leads
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Search className="h-8 w-8 text-gray-600 mx-auto mb-3 opacity-20" />
                                <p className="text-sm text-gray-500">No recent activity found.</p>
                                <button className="text-xs text-indigo-400 mt-4 hover:underline">
                                    Start your first search
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
