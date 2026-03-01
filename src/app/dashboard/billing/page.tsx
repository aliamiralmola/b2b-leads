"use client";

import { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { PricingCards } from "@/components/billing/PricingCards";
import { PaymentModal } from "@/components/billing/PaymentModal";
import { verifyAndUpgrade } from "@/app/actions/verifyAndUpgrade";
import {
    CreditCard,
    History,
    Zap,
    CheckCircle2,
    Loader2,
    ExternalLink,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { toast } from "sonner";

interface PaymentRecord {
    id: string;
    created_at: string;
    amount: number;
    plan_name: string;
    status: string;
    tx_hash: string;
}

export default function BillingPage() {
    const [user, setUser] = useState<any>(null);
    const [credits, setCredits] = useState<number>(0);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number } | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const supabase = createClient();

    const fetchData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        // Fetch credits
        const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
        if (profile) setCredits(profile.credits);

        // Fetch payment history
        const { data: paymentData } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (paymentData) setPayments(paymentData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSelectPlan = (name: string, price: number) => {
        setSelectedPlan({ name, price });
    };

    const handlePaymentComplete = async (txHash: string) => {
        if (!selectedPlan) return;

        setSelectedPlan(null);
        setIsVerifying(true);

        try {
            const result = await verifyAndUpgrade(txHash, selectedPlan.name);
            if (result.success) {
                toast.success(result.message);
                fetchData(); // Refresh credits and history
            } else {
                toast.error(result.message || "Verification failed. Please contact support.");
            }
        } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("An unexpected error occurred during verification.");
        } finally {
            setIsVerifying(false);
        }
    };

    if (loading && !user) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-gray-500 font-medium">Loading billing information...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 py-8 px-4 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">Billing & Subscription</h1>
                    <p className="text-gray-400 text-lg">
                        Manage your credits, upgrade your plan, and view transaction history.
                    </p>
                </div>

                <Card className="bg-indigo-600 border-none shadow-2xl shadow-indigo-600/20 px-8 py-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap className="w-12 h-12 text-white" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Available Credits</span>
                        <span className="text-4xl font-black text-white">{credits.toLocaleString()}</span>
                    </div>
                </Card>
            </div>

            {isVerifying && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl flex items-center gap-4 animate-pulse">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                    <div>
                        <p className="text-indigo-400 font-bold">Verifying your transaction...</p>
                        <p className="text-indigo-400/70 text-sm">Blockchain confirmation usually takes 30-60 seconds. Don't close this page.</p>
                    </div>
                </div>
            )}

            {/* Pricing Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Choose a Plan</h2>
                </div>
                <PricingCards onSelectPlan={handleSelectPlan} />
            </section>

            {/* History Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <History className="w-4 h-4 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Subscription History</h2>
                </div>

                <Card className="bg-[#0c0c0c] border-white/5 shadow-2xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-white/[0.02]">
                            <TableRow className="border-white/5">
                                <TableHead className="text-gray-400">Date</TableHead>
                                <TableHead className="text-gray-400">Plan</TableHead>
                                <TableHead className="text-gray-400">Amount</TableHead>
                                <TableHead className="text-gray-400">Transaction</TableHead>
                                <TableHead className="text-gray-400 text-right pr-8">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length > 0 ? (
                                payments.map((payment) => (
                                    <TableRow key={payment.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                        <TableCell className="text-gray-300">
                                            {new Date(payment.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell className="text-white font-bold">{payment.plan_name}</TableCell>
                                        <TableCell className="text-gray-300 font-medium">${payment.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <a
                                                href={`https://polygonscan.com/tx/${payment.tx_hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                                            >
                                                View on Polygonscan
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    {payment.status}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center bg-transparent">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                                            <p>No subscriptions found. Upgrade your plan to get started.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </section>

            {/* Payment Modal */}
            {selectedPlan && (
                <PaymentModal
                    open={!!selectedPlan}
                    onOpenChange={(open) => !open && setSelectedPlan(null)}
                    planName={selectedPlan.name}
                    amount={selectedPlan.price}
                    onPaymentComplete={handlePaymentComplete}
                />
            )}
        </div>
    );
}
