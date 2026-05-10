"use client";

import { useState, useEffect, useCallback } from "react";
import {
    ShieldAlert, Search, RefreshCw, Zap,
    Trash2, ShieldCheck, CreditCard, Mail,
    User, Calendar, Loader2, Lock, KeyRound,
    AlertTriangle, History, ArrowRightLeft,
    CheckCircle2, XCircle, MoreVertical,
    MailCheck, UserX, Fingerprint, MessagesSquare, Check,
    ChevronLeft, ChevronRight, LayoutGrid, List, Layers,
    ChevronUp, ChevronDown, Filter, Info, DollarSign
} from "lucide-react";
import {
    getAdminUsers,
    updateUserPlan,
    adjustUserCredits,
    adminResetPassword,
    adminDeleteUser,
    adminUpdateEmail,
    checkAdminServiceStatus,
    getSupportMessages,
    updateMessageStatus,
    getAdminAffiliates,
    markPayoutAsPaid,
    getAffiliateReferrals
} from "../actions/adminActions";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 25;

export default function AdminMatrix() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<"grid" | "table">("table"); // Default to table for better utility
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [serviceActive, setServiceActive] = useState<boolean | null>(null);
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"plans" | "communications" | "affiliates">("plans");

    const checkPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "123") {
            setIsAuthenticated(true);
            toast.success("Security Clearance Granted");
        } else {
            toast.error("Invalid Security Key");
        }
    };

    const fetchAllData = useCallback(async () => {
        setIsRefetching(true);
        try {
            const [usersData, messagesData, affiliatesData, status] = await Promise.all([
                getAdminUsers(searchQuery, page, PAGE_SIZE),
                getSupportMessages(),
                getAdminAffiliates(),
                checkAdminServiceStatus()
            ]);
            setUsers(usersData);
            setMessages(messagesData);
            setAffiliates(affiliatesData);
            setServiceActive(status);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsRefetching(false);
        }
    }, [searchQuery, page]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAllData();
        }
    }, [isAuthenticated, fetchAllData]);

    const handlePlanUpdate = async (userId: string, plan: string) => {
        setIsLoading(true);
        const toastId = toast.loading(`Migrating subject to ${plan}...`);
        try {
            await updateUserPlan(userId, plan);
            toast.success(`User successfully migrated to ${plan}`, { id: toastId });
            fetchAllData();
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreditAdjust = async (userId: string, amount: number) => {
        setIsLoading(true);
        try {
            await adjustUserCredits(userId, amount);
            toast.success(`System Credits injected: ${amount}`);
            fetchAllData();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (userId: string, email: string) => {
        setIsLoading(true);
        try {
            const res = await adminResetPassword(userId, email);
            if (res.link) {
                navigator.clipboard.writeText(res.link);
                toast.success("Recovery link copied! Send it to the user.");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("This will PERMANENTLY delete the account. Continue?")) return;
        setIsLoading(true);
        try {
            await adminDeleteUser(userId);
            toast.success("Identity Purged");
            fetchAllData();
            setIsActionModalOpen(false);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const markMessageRead = async (id: string) => {
        try {
            await updateMessageStatus(id, 'read');
            fetchAllData();
        } catch (error) { }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-4">
                <div className="w-full max-w-md space-y-8 glass p-10 rounded-[2.5rem] border-primary/20 shadow-2xl">
                    <div className="text-center space-y-4">
                        <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                            <Lock className="h-10 w-10 text-primary animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">Admin Portal</h1>
                        <p className="text-muted-foreground text-sm">Enter the control password to continue</p>
                    </div>
                    <form onSubmit={checkPassword} className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                className="h-14 bg-background/50 text-center text-xl font-bold tracking-[0.5em] rounded-2xl"
                                placeholder="••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button className="w-full h-14 rounded-2xl font-bold text-lg bg-primary hover:bg-primary/90">
                            Login to Command Center
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-700 pb-20">
            {/* Standard Platform Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary flex items-center justify-center rounded-2xl shadow-lg shadow-primary/20">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Support Console</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`h-2 w-2 rounded-full ${serviceActive ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    {serviceActive ? 'Service Key Active' : 'Limited Visibility (RLS)'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by email or name..."
                                className="pl-12 h-12 rounded-2xl bg-muted/50 border-border focus-visible:ring-primary"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            />
                        </div>
                        <Button variant="outline" size="icon" onClick={fetchAllData} className="h-12 w-12 rounded-2xl border-border bg-card hover:bg-muted">
                            <RefreshCw className={`h-5 w-5 text-primary ${isRefetching ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 lg:px-8 mt-8 space-y-8">
                {/* Mode Selector & Warning */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="inline-flex p-1.5 bg-muted rounded-2xl border border-border">
                        <button
                            onClick={() => setActiveTab('plans')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'plans' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <User className="h-4 w-4" /> User Management
                        </button>
                        <button
                            onClick={() => setActiveTab('communications')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'communications' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <MessagesSquare className="h-4 w-4" />
                            Support
                            {messages.filter(m => m.status === 'unread').length > 0 && (
                                <span className="flex h-2 w-2 rounded-full bg-primary" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('affiliates')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'affiliates' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <DollarSign className="h-4 w-4" />
                            Affiliates & Payouts
                        </button>
                    </div>

                    {!serviceActive && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl text-[11px] font-medium max-w-sm">
                            <Info className="h-4 w-4 shrink-0" />
                            Only your own profile is visible. To manage all users, set the SERVICE_ROLE_KEY in .env.local.
                        </div>
                    )}
                </div>

                {activeTab === 'plans' ? (
                    <div className="space-y-6">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border">
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-muted-foreground font-medium">Display Mode:</span>
                                <div className="flex bg-muted p-1 rounded-xl">
                                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                                        <LayoutGrid className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                                        <List className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Filter className="h-3 w-3" />
                                <span>Showing {users.length} profiles</span>
                            </div>
                        </div>

                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in relative">
                                {users.map((user) => (
                                    <div key={user.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                            <User className="h-24 w-24" />
                                        </div>
                                        <div className="space-y-4 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                                                    {user.full_name?.[0] || 'U'}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h3 className="font-bold text-foreground truncate">{user.full_name || 'Anonymous User'}</h3>
                                                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="p-3 bg-muted/30 rounded-2xl border border-border/50">
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Tier</p>
                                                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[10px] uppercase">{user.plan_name}</Badge>
                                                </div>
                                                <div className="p-3 bg-muted/30 rounded-2xl border border-border/50">
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Balance</p>
                                                    <p className="text-sm font-bold text-foreground">{user.credits?.toLocaleString() || 0}</p>
                                                </div>
                                            </div>

                                            <Button
                                                variant="outline"
                                                onClick={() => { setSelectedUser(user); setIsActionModalOpen(true); }}
                                                className="w-full h-11 rounded-xl border-border hover:border-primary hover:text-primary transition-all font-bold text-xs"
                                            >
                                                Manage Profile
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm animate-fade-in">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-muted/50 border-b border-border">
                                                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">User Identity</th>
                                                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Current Tier</th>
                                                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Credits</th>
                                                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Join Date</th>
                                                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground text-right">Operations</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {users.map((user) => (
                                                <tr key={user.id} className="hover:bg-muted/30 transition-all group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center font-bold text-primary border border-border">
                                                                {user.full_name?.[0]}
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <div className="font-bold text-sm truncate">{user.full_name || 'Anonymous'}</div>
                                                                <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="secondary" className="uppercase text-[9px] bg-primary/5 text-primary border-primary/10">
                                                            {user.plan_name}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-sm tabular-nums">
                                                        {user.credits?.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                                                        {user.joined_at ? new Date(user.joined_at).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => { setSelectedUser(user); setIsActionModalOpen(true); }}
                                                            className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary"
                                                        >
                                                            <Layers className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Pagination placeholder */}
                    </div>
                ) : activeTab === 'communications' ? (
                    <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">
                        {messages.length === 0 && (
                            <div className="bg-card border border-border border-dashed p-24 text-center rounded-[2.5rem] opacity-50">
                                <MessagesSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="font-bold text-sm text-muted-foreground">No active support conversations found.</p>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div key={msg.id} className={`bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all ${msg.status === 'unread' ? 'border-l-4 border-l-primary' : 'opacity-60'}`}>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="uppercase text-[9px] font-bold">{msg.type}</Badge>
                                            <span className="text-sm font-bold text-primary">{msg.email}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium">{new Date(msg.created_at).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {msg.status === 'unread' && (
                                                <Button size="icon" variant="ghost" onClick={() => markMessageRead(msg.id)} className="h-9 w-9 rounded-xl text-emerald-500 hover:bg-emerald-500/10">
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button size="icon" variant="ghost" onClick={() => {
                                                const user = users.find(u => u.email === msg.email);
                                                if (user) { setSelectedUser(user); setIsActionModalOpen(true); }
                                                else { toast.error("User not in current view. Try searching."); }
                                            }} className="h-9 w-9 rounded-xl text-primary hover:bg-primary/10">
                                                <User className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 text-sm leading-relaxed">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between bg-card p-6 rounded-[2rem] border border-border shadow-sm">
                            <div>
                                <h3 className="text-xl font-bold">Affiliate Network Management</h3>
                                <p className="text-sm text-muted-foreground">Total payout liability across all partners: <span className="text-emerald-500 font-bold">${affiliates.reduce((acc, curr) => acc + Number(curr.earnings), 0).toFixed(2)}</span></p>
                            </div>
                            <Button
                                variant="outline"
                                className="rounded-xl font-bold text-xs gap-2"
                                onClick={() => {
                                    const csvRows = [
                                        ["Name", "Email", "Code", "Wallet", "Clicks", "Signups", "Earnings", "Last Payout"].join(","),
                                        ...affiliates.map(a => [
                                            a.user_name,
                                            a.user_email,
                                            a.referral_code,
                                            a.wallet_address || 'NOT_SET',
                                            a.clicks_count,
                                            a.signups_count,
                                            a.earnings,
                                            a.last_payout_at || 'Never'
                                        ].join(","))
                                    ];
                                    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `affiliates_report_${new Date().toISOString().split('T')[0]}.csv`;
                                    link.click();
                                }}
                            >
                                <History className="h-4 w-4" /> Export Report
                            </Button>
                        </div>

                        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Partner</th>
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Tracking Data</th>
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Earnings (USDT)</th>
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Wallet Address</th>
                                            <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground text-right">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {affiliates.map((aff) => (
                                            <tr key={aff.id} className="hover:bg-muted/30 transition-all group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                                                            {aff.user_name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm">{aff.user_name}</p>
                                                            <p className="text-[10px] text-muted-foreground">{aff.user_email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex gap-4">
                                                        <div>
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">Clicks</p>
                                                            <p className="text-sm font-bold tabular-nums">{aff.clicks_count}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-50">Signups</p>
                                                            <p className="text-sm font-bold tabular-nums">{aff.signups_count}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-black text-emerald-500">${Number(aff.earnings).toFixed(2)}</span>
                                                        <Badge variant="outline" className="text-[9px] opacity-70">
                                                            Last: {aff.last_payout_at ? new Date(aff.last_payout_at).toLocaleDateString() : 'None'}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="font-mono text-[10px] truncate max-w-[150px] bg-muted px-2 py-1 rounded-md border border-border">
                                                        {aff.wallet_address || 'WALLET_NOT_SET'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={async () => {
                                                            if (confirm(`Mark payout for ${aff.user_name} as SENT?`)) {
                                                                await markPayoutAsPaid(aff.id);
                                                                toast.success("Payout registered successfully");
                                                                fetchAllData();
                                                            }
                                                        }}
                                                        className="rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 font-bold text-[10px] gap-2"
                                                    >
                                                        <Zap className="h-3 w-3" /> Mark as Paid
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Comprehensive Override Matrix */}
            <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
                <DialogContent className="max-w-xl bg-card border-border rounded-[2.5rem] p-0 overflow-hidden shadow-2xl scale-in-95 animate-in duration-200">
                    <div className="bg-primary/5 p-8 border-b border-border">
                        <DialogHeader>
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                                    {selectedUser?.full_name?.[0]}
                                </div>
                                <div className="text-left">
                                    <DialogTitle className="text-xl font-bold">Manage Account</DialogTitle>
                                    <DialogDescription className="text-primary font-bold text-xs flex items-center gap-2 mt-1">
                                        <Mail className="h-3 w-3" />
                                        {selectedUser?.email}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Plan Migration */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Access Tier Override</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {['Free', 'Starter', 'Growth', 'Scale', 'Enterprise'].map(p => (
                                    <Button
                                        key={p}
                                        variant={selectedUser?.plan_name === p ? 'default' : 'outline'}
                                        onClick={() => handlePlanUpdate(selectedUser.id, p)}
                                        className={`h-12 rounded-xl text-xs font-bold uppercase transition-all ${selectedUser?.plan_name === p ? 'shadow-lg shadow-primary/20' : 'border-border'}`}
                                        disabled={isLoading}
                                    >
                                        {p}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Credit Adjustment */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 text-left block">Direct Credit Injection</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[100, 1000, 5000, 10000].map(amt => (
                                    <Button
                                        key={amt}
                                        variant="secondary"
                                        onClick={() => handleCreditAdjust(selectedUser.id, amt)}
                                        className="h-12 rounded-xl font-bold border border-border/10 hover:bg-primary hover:text-white"
                                    >
                                        {amt.toLocaleString()}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Security Overrides */}
                        <div className={`space-y-4 ${!serviceActive ? 'opacity-30 pointer-events-none' : ''}`}>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 text-left block">Deep Auth Controls</label>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => handleResetPassword(selectedUser.id, selectedUser.email)}
                                    className="h-16 rounded-2xl border-border flex flex-col gap-1 items-start px-4"
                                >
                                    <div className="flex items-center gap-2 text-primary font-bold">
                                        <KeyRound className="h-4 w-4" /> RECOVER
                                    </div>
                                    <span className="text-[9px] text-muted-foreground uppercase">Copy Reset Link</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleDeleteUser(selectedUser.id)}
                                    className="h-16 rounded-2xl border-border hover:bg-destructive/10 hover:text-destructive flex flex-col gap-1 items-start px-4"
                                >
                                    <div className="flex items-center gap-2 font-bold">
                                        <Trash2 className="h-4 w-4" /> PURGE
                                    </div>
                                    <span className="text-[9px] text-muted-foreground uppercase">Delete Identity</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
