import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-black text-zinc-50 font-sans selection:bg-indigo-500/30 py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                    Refund Policy
                </h1>

                <div className="prose prose-invert prose-zinc max-w-none">
                    <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                        Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-white mb-4">7-Day Money-Back Guarantee</h2>
                        <p className="text-zinc-400 leading-relaxed mb-4">
                            At B2B Leads, we want you to be completely satisfied with our service. We offer a <strong>7-day money-back guarantee for unused credits</strong>.
                        </p>
                        <p className="text-zinc-400 leading-relaxed">
                            If you have purchased a subscription or a credit pack and have not used any of the credits within 7 days of the purchase, you are eligible for a full refund.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-white mb-4">How to Request a Refund</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            To request a refund, please contact our support team at support@abaaad.net with your account email and order details. We will process your request within 3-5 business days.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-white mb-4">Exceptions</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Refunds will not be issued for accounts where credits have already been consumed for lead extraction. Once a search is performed and results are generated, the credits are considered used and non-refundable.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            If you have any questions about our Refund Policy, please contact us at support@abaaad.net.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
