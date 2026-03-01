"use client";

import { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { PricingCards } from "@/components/billing/PricingCards";
import { PaymentModal } from "@/components/billing/PaymentModal";
import { verifyAndUpgrade } from "@/app/actions/verifyAndUpgrade";
import { toast } from "sonner";
import {
    CreditCard,
    History,
    ExternalLink,
    AlertCircle,
    RefreshCw,
    FileText,
    Zap,
    Loader2
} from "lucide-react";
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export interface PaymentRecord {
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
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [autoRenewal, setAutoRenewal] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{ name: string, price: number } | null>(null);

    const supabase = createClient();

    useEffect(() => {
        const fetchBillingData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                // Fetch profile credits
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('credits')
                    .eq('id', user.id)
                    .single();

                if (profile) setCredits(profile.credits);

                // Fetch payment history
                const { data: history } = await supabase
                    .from('payments')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (history) setPayments(history);
            }
            setLoading(false);
        };

        fetchBillingData();
    }, [supabase]);

    const handleSelectPlan = (plan: { name: string, price: number }) => {
        setSelectedPlan(plan);
    };

    const handlePaymentComplete = async (txHash: string) => {
        setIsVerifying(true);
        try {
            const result = await verifyAndUpgrade(txHash);
            if (result.success) {
                toast.success("Payment verified! Your account has been upgraded.");
                // Refresh data
                const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
                if (profile) setCredits(profile.credits);

                const { data: history } = await supabase.from('payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
                if (history) setPayments(history);
            } else {
                toast.error("Verification failed. Please contact support.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during verification.");
        } finally {
            setIsVerifying(false);
            setSelectedPlan(null);
        }
    };

    const handleDownloadInvoice = (payment: PaymentRecord) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const content = `
            <html>
                <head>
                    <title>Invoice - ${payment.id}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 60px; color: #111; line-height: 1.6; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 30px; margin-bottom: 40px; }
                        .logo { font-size: 24px; font-weight: 800; color: #4f46e5; }
                        .invoice-info { text-align: right; }
                        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                        .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #888; margin-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin: 40px 0; }
                        th { text-align: left; padding: 15px; border-bottom: 2px solid #eee; font-size: 12px; color: #888; text-transform: uppercase; }
                        td { padding: 20px 15px; border-bottom: 1px solid #f5f5f5; }
                        .total-section { display: flex; justify-content: flex-end; margin-top: 40px; }
                        .total-box { background: #fafafa; padding: 30px; border-radius: 12px; min-width: 250px; }
                        .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: 600; }
                        .grand-total { font-size: 20px; font-weight: 800; color: #4f46e5; margin-top: 15px; border-top: 1px solid #ddd; pt: 15px; }
                        .footer { margin-top: 100px; font-size: 11px; color: #aaa; text-align: center; border-top: 1px solid #eee; pt: 30px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">b2bleads.ai</div>
                        <div class="invoice-info">
                            <h1 style="margin:0; font-size: 32px; font-weight: 900;">INVOICE</h1>
                            <p style="margin:5px 0; color: #666;">#INV-${payment.id.slice(0, 8).toUpperCase()}</p>
                            <p style="margin:0; color: #666;">Date: ${new Date(payment.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div class="details">
                        <div>
                            <div class="section-title">Billed To</div>
                            <div style="font-weight: 700;">User Account</div>
                            <div>${user?.email}</div>
                        </div>
                        <div style="text-align: right;">
                            <div class="section-title">From</div>
                            <div style="font-weight: 700;">b2bleads.ai Global</div>
                            <div>Tech Support Division</div>
                            <div>contact@b2bleads.ai</div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div style="font-weight: 700;">${payment.plan_name} Plan Subscription</div>
                                    <div style="font-size: 12px; color: #666;">Lead Generation platform access & credits</div>
                                </td>
                                <td>1</td>
                                <td>$${payment.amount.toFixed(2)}</td>
                                <td style="text-align: right;">$${payment.amount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="total-box">
                            <div class="total-row">
                                <span>Subtotal</span>
                                <span>$${payment.amount.toFixed(2)}</span>
                            </div>
                            <div class="total-row">
                                <span>Tax (0%)</span>
                                <span>$0.00</span>
                            </div>
                            <div class="total-row grand-total">
                                <span>Total Paid</span>
                                <span>$${payment.amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 40px; padding: 20px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0; color: #166534; font-size: 14px; font-weight: 600; display: inline-block;">
                        Payment Status: SUCCESSFUL (${payment.status.toUpperCase()})
                    </div>

                    <div class="footer">
                        This is a computer-generated invoice. No signature required.<br>
                        Transaction Hash: ${payment.tx_hash}<br>
                        &copy; ${new Date().getFullYear()} b2bleads.ai Ltd. All rights reserved.
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-white">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
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

                <Card className="bg-primary border-none shadow-2xl shadow-primary/20 px-8 py-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap className="w-12 h-12 text-white" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-primary-foreground/80 text-xs font-bold uppercase tracking-widest mb-1">Available Credits</span>
                        <span className="text-4xl font-black text-white">{credits.toLocaleString()}</span>
                    </div>
                </Card>
            </div>

            {isVerifying && (
                <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl flex items-center gap-4 animate-pulse">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <div>
                        <p className="text-primary font-bold">Verifying your transaction...</p>
                        <p className="text-primary/70 text-sm">Blockchain confirmation usually takes 30-60 seconds. Don't close this page.</p>
                    </div>
                </div>
            )}

            {/* Pricing Section */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Choose a Plan</h2>
                    </div>

                    <div className="flex items-center gap-8 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 px-3">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('annual')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${billingCycle === 'annual' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Annual
                                <span className="absolute -top-2 -right-2 bg-emerald-500 text-[8px] text-white px-1.5 py-0.5 rounded-full font-black uppercase">Save 20%</span>
                            </button>
                        </div>

                        <div className="h-4 w-px bg-white/10 hidden md:block" />

                        <div className="flex items-center space-x-3 px-3">
                            <Switch
                                id="auto-renewal"
                                checked={autoRenewal}
                                onCheckedChange={setAutoRenewal}
                                className="data-[state=checked]:bg-primary"
                            />
                            <Label htmlFor="auto-renewal" className="text-sm font-bold text-gray-400 cursor-pointer flex items-center gap-2">
                                <RefreshCw className={`w-3 h-3 ${autoRenewal ? 'text-primary animate-spin-slow' : ''}`} />
                                Auto-Renewal
                            </Label>
                        </div>
                    </div>
                </div>
                <PricingCards onSelectPlan={handleSelectPlan} billingCycle={billingCycle} />
            </section>

            {/* History Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <History className="w-4 h-4 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Subscription History</h2>
                </div>

                <Card className="bg-card border-border shadow-2xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-white/[0.02]">
                            <TableRow className="border-border">
                                <TableHead className="text-gray-400">Date</TableHead>
                                <TableHead className="text-gray-400">Plan</TableHead>
                                <TableHead className="text-gray-400">Amount</TableHead>
                                <TableHead className="text-gray-400">Transaction</TableHead>
                                <TableHead className="text-gray-400 text-right pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length > 0 ? (
                                payments.map((payment) => (
                                    <TableRow key={payment.id} className="border-border hover:bg-muted transition-colors group">
                                        <TableCell className="text-gray-300">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-white font-bold">{payment.plan_name}</TableCell>
                                        <TableCell className="text-gray-300 font-medium">${payment.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <a
                                                href={`https://polygonscan.com/tx/${payment.tx_hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-primary hover:text-primary/80 text-sm transition-colors"
                                            >
                                                View TX <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <button
                                                onClick={() => handleDownloadInvoice(payment)}
                                                className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-white/5 flex items-center gap-2 ml-auto"
                                            >
                                                <FileText className="w-3.5 h-3.5 text-primary" />
                                                Invoice
                                            </button>
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
