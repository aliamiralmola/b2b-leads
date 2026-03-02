import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, Check, CreditCard, HelpCircle } from "lucide-react";
import { PLANS } from "@/lib/plans";

export const dynamic = "force-dynamic";

// Removed hardcoded PACKAGES, using PLANS from @/lib/plans

export default async function PaymentsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch subscription history
    const { data: payments, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Payments & Subscriptions</h1>
                <p className="text-gray-400">Handle your crypto payments, view your active packages, and browse subscription history.</p>
            </div>

            <div className="mb-8 p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold mb-2 text-white">Top Up Credits Using Crypto</h2>
                    <p className="text-gray-400 text-sm max-w-xl">We support fully decentralized cross-chain payments. Pay with any token from any chain and receive credits instantly.</p>
                </div>
                <a href="/dashboard/billing" className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all">
                    Go to Billing & Crypto
                </a>
            </div>

            {/* Packages */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-white">Available Packages</h2>
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-muted/50 border border-border">
                        <HelpCircle className="w-3.5 h-3.5" />
                        1 USDT ≈ 1 USD
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PLANS.map((pkg) => (
                        <div key={pkg.name} className={`bg-[#0a0a0a] border rounded-2xl p-6 flex flex-col relative overflow-hidden group transition-all duration-300 ${pkg.popular ? 'border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'border-white/5 hover:border-indigo-500/30'}`}>
                            {pkg.popular && (
                                <div className="absolute top-0 right-0 bg-indigo-600 text-[10px] font-bold text-white px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                                    Best Value
                                </div>
                            )}
                            <div className="absolute -bottom-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <CreditCard className="w-24 h-24 text-indigo-500" />
                            </div>

                            <h3 className="text-lg font-medium text-white mb-2 relative z-10">{pkg.name}</h3>
                            <p className="text-sm text-gray-400 mb-6 min-h-[40px] relative z-10">{pkg.description}</p>

                            <div className="mb-6 relative z-10">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">${pkg.price}</span>
                                    <span className="text-gray-500 text-sm font-medium">USDT</span>
                                </div>
                                {pkg.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through">${pkg.originalPrice}</span>
                                )}
                            </div>

                            <ul className="mb-8 space-y-3 flex-1 relative z-10">
                                <li className="flex items-center gap-3 text-sm text-gray-300">
                                    <Check className="w-4 h-4 text-indigo-400" />
                                    <span>{pkg.credits.toLocaleString()} Credits</span>
                                </li>
                                {pkg.features.slice(1).map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                        <Check className="w-4 h-4 text-indigo-400" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="relative z-10 mt-auto">
                                <a href="/dashboard/billing" className={`block w-full text-center px-4 py-2.5 mt-4 text-sm font-bold transition-all rounded-xl ${pkg.popular ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-muted border border-border text-foreground hover:bg-muted/80'}`}>
                                    Get {pkg.name}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subscription History */}
            <div>
                <h2 className="text-2xl font-semibold text-white mb-6">Subscription History</h2>

                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
                    {(!payments || payments.length === 0) ? (
                        <div className="p-8 text-center bg-muted/30">
                            <p className="text-gray-400">You don't have any subscription history yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-sm font-medium text-gray-400">
                                        <th className="p-4">Plan Name</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Start Date</th>
                                        <th className="p-4">End Date</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment: any) => {
                                        const startDate = new Date(payment.created_at);
                                        const endDate = new Date(startDate);
                                        endDate.setDate(endDate.getDate() + 30); // Assuming 30 days subscription

                                        return (
                                            <tr key={payment.id} className="border-b border-white/5 hover:bg-muted/30 text-sm transition-colors">
                                                <td className="p-4 font-medium text-white">{payment.plan_name}</td>
                                                <td className="p-4 text-gray-300">{payment.amount} USDT</td>
                                                <td className="p-4 text-gray-400">{startDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                                <td className="p-4 text-gray-400">{endDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${payment.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                        {payment.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                        <span className="capitalize">{payment.status}</span>
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
