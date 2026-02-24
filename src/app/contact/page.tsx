import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactSupport() {
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
                    Contact Support
                </h1>

                <p className="text-zinc-400 text-xl leading-relaxed mb-12 max-w-2xl">
                    Have questions or need help? Our team is here to support you and ensure you get the most out of B2B Leads.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <Card className="bg-zinc-950/80 border-white/10 hover:border-indigo-500/50 transition-colors">
                        <CardContent className="pt-6">
                            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-6">
                                <Mail className="h-6 w-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Email Us</h3>
                            <p className="text-zinc-400 mb-6">Drop us a line anytime and we'll get back to you as soon as possible.</p>
                            <a
                                href="mailto:support@abaaad.net"
                                className="text-indigo-400 hover:text-indigo-300 font-medium text-lg inline-flex items-center"
                            >
                                support@abaaad.net
                            </a>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-950/80 border-white/10 hover:border-indigo-500/50 transition-colors">
                        <CardContent className="pt-6">
                            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-6">
                                <Clock className="h-6 w-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Response Time</h3>
                            <p className="text-zinc-400 mb-2">Monday - Friday</p>
                            <p className="text-white font-medium">9:00 AM - 6:00 PM EST</p>
                            <p className="text-zinc-500 text-sm mt-4 italic">Typical response within 24 hours</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-8 text-center max-w-2xl mx-auto">
                    <MessageSquare className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-4">Looking for something else?</h2>
                    <p className="text-zinc-400 mb-0">
                        Check out our <Link href="/faq" className="text-indigo-400 hover:underline">FAQ</Link> or <Link href="/docs" className="text-indigo-400 hover:underline">Documentation</Link> for quick answers to common questions.
                    </p>
                </div>
            </div>
        </div>
    );
}
