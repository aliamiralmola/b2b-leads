import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Clock, MessagesSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
    title: "Contact Support – b2bleads",
    description: "Get in touch with the b2bleads support team.",
};

export default function ContactSupport() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500/30 py-20 px-4">
            <div className="max-w-5xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                    Contact Support
                </h1>

                <p className="text-muted-foreground text-lg leading-relaxed mb-12 max-w-2xl">
                    Have questions or need help? Our team is here to support you and ensure you get the most out of B2B Leads.
                </p>

                {/* Three contact cards — stack on mobile, 3 cols on md+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {/* Email */}
                    <Card className="bg-card/80 border-border hover:border-indigo-500/50 transition-colors h-full">
                        <CardContent className="pt-6 flex flex-col h-full">
                            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-6 shrink-0">
                                <Mail className="h-6 w-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">Email Us</h3>
                            <p className="text-muted-foreground mb-6 flex-1">Drop us a line anytime and we&apos;ll get back to you as soon as possible.</p>
                            <a
                                href="mailto:support@abaaad.net"
                                className="text-indigo-400 hover:text-indigo-300 font-medium text-base inline-flex items-center break-all"
                            >
                                support@abaaad.net
                            </a>
                        </CardContent>
                    </Card>

                    {/* Response Time — global UTC instead of EST */}
                    <Card className="bg-card/80 border-border hover:border-indigo-500/50 transition-colors h-full">
                        <CardContent className="pt-6 flex flex-col h-full">
                            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-6 shrink-0">
                                <Clock className="h-6 w-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">Support Hours</h3>
                            <p className="text-muted-foreground mb-2 flex-1">Monday – Friday</p>
                            <p className="text-foreground font-semibold">09:00 – 18:00 UTC</p>
                            <p className="text-muted-foreground/60 text-xs mt-1">(12:00 – 21:00 GST · 05:00 – 14:00 EDT)</p>
                            <p className="text-muted-foreground/60 text-sm mt-4 italic">Typical response within 24 hours</p>
                        </CardContent>
                    </Card>

                    {/* Live Chat */}
                    <Card className="bg-card/80 border-border hover:border-emerald-500/50 transition-colors h-full">
                        <CardContent className="pt-6 flex flex-col h-full">
                            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6 shrink-0">
                                <MessagesSquare className="h-6 w-6 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">Live Chat</h3>
                            <p className="text-muted-foreground mb-6 flex-1">Chat with us directly inside the platform dashboard for instant support.</p>
                            <Link
                                href="/dashboard"
                                className="text-emerald-400 hover:text-emerald-300 font-medium text-base"
                            >
                                Open Dashboard →
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-8 text-center max-w-2xl mx-auto">
                    <MessageSquare className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-4">Looking for something else?</h2>
                    <p className="text-muted-foreground">
                        Check out our{" "}
                        <Link href="/faq" className="text-indigo-400 hover:underline">FAQ</Link>
                        {" "}or{" "}
                        <Link href="/docs" className="text-indigo-400 hover:underline">Documentation</Link>
                        {" "}for quick answers to common questions.
                    </p>
                </div>
            </div>
        </div>
    );
}
