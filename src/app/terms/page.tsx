import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
                    Terms of Service
                </h1>

                <div className="prose prose-invert prose-zinc max-w-none">
                    <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                        Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            By accessing or using B2B Leads, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            B2B Leads provides AI-powered lead extraction tools for Google Maps and LinkedIn. We reserve the right to modify or discontinue the service at any time without notice.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Intellectual Property</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            The Service and its original content, features, and functionality are and will remain the exclusive property of B2B Leads and its licensors.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            In no event shall B2B Leads, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Changes to Terms</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            If you have any questions about these Terms, please contact us at support@abaaad.net.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
