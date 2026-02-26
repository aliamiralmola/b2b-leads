import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DollarSign,
    Cookie,
    CalendarCheck,
    Link2,
    UserPlus,
    Banknote,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Zap,
} from "lucide-react";

export const metadata = {
    title: "Affiliate Program – Earn 50% Recurring Commission | b2bleads",
    description:
        "Join the b2bleads Affiliate Program and earn 50% recurring commission forever. Promote the world's easiest B2B Lead Scraper and build passive income.",
};

export default function AffiliatesPage() {
    return (
        <div className="flex flex-col min-h-screen bg-black text-zinc-50 font-sans selection:bg-emerald-500/30">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="b2bleads logo" width={32} height={32} className="object-contain" />
                        <span className="font-bold text-xl tracking-tight">b2bleads</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                        <Link href="/#features" className="hover:text-white transition-colors">
                            Features
                        </Link>
                        <Link href="/#pricing" className="hover:text-white transition-colors">
                            Pricing
                        </Link>
                        <Link
                            href="/affiliates"
                            className="text-emerald-400 font-semibold flex items-center gap-1.5"
                        >
                            <DollarSign className="w-3.5 h-3.5" />
                            Affiliates
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="hidden md:inline-flex text-zinc-300 hover:text-white hover:bg-white/10"
                            asChild
                        >
                            <Link href="/login">Log in</Link>
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]"
                            asChild
                        >
                            <Link href="/signup">Join Partner Program</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative pt-32 pb-24 md:pt-48 md:pb-36 overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-20 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 blur-[120px] rounded-full mix-blend-screen" />
                    </div>

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <Badge
                            variant="outline"
                            className="mb-8 border-emerald-500/30 bg-emerald-500/10 text-emerald-300 py-1.5 px-4 backdrop-blur-sm"
                        >
                            <Sparkles className="w-3 h-3 mr-2 inline-block" />
                            Partner Program — Now Open
                        </Badge>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 max-w-5xl mx-auto bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60">
                            Earn{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
                                50% Recurring
                            </span>{" "}
                            Commission Forever
                        </h1>

                        <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Promote the world&apos;s easiest B2B Lead Scraper and build passive income. Every
                            month your referrals stay subscribed, you earn — forever.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                size="lg"
                                className="h-14 px-10 text-base bg-emerald-600 hover:bg-emerald-500 text-white border-0 w-full sm:w-auto shadow-[0_0_30px_-5px_rgba(16,185,129,0.6)] transition-all hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.8)]"
                                asChild
                            >
                                <Link href="/signup">
                                    Join Partner Program <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-14 px-8 text-base border-white/10 text-white hover:bg-white/5 w-full sm:w-auto backdrop-blur-sm"
                                asChild
                            >
                                <Link href="/#pricing">See Our Pricing</Link>
                            </Button>
                        </div>

                        <div className="mt-16 flex items-center justify-center gap-8 text-sm text-zinc-500 font-medium flex-wrap">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Free to join
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                No cap on earnings
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Instant dashboard access
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-28 bg-zinc-950 border-y border-white/5 relative">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">
                                Why partners love us
                            </h2>
                            <p className="text-zinc-400 max-w-xl mx-auto text-lg">
                                We&apos;ve built one of the most rewarding affiliate programs in the B2B SaaS space.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* Card 1 */}
                            <Card className="bg-black/50 backdrop-blur border-white/10 hover:border-emerald-500/50 transition-colors duration-500 group">
                                <CardHeader>
                                    <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-500">
                                        <DollarSign className="h-7 w-7 text-emerald-400" />
                                    </div>
                                    <CardTitle className="text-2xl text-white">High Commission</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-zinc-400 leading-relaxed text-lg">
                                        Earn a flat{" "}
                                        <span className="text-emerald-400 font-semibold">50% commission</span> on every
                                        subscription your referrals pay — not just the first month, but every single
                                        month they stay.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Card 2 */}
                            <Card className="bg-black/50 backdrop-blur border-white/10 hover:border-teal-500/50 transition-colors duration-500 group">
                                <CardHeader>
                                    <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:bg-teal-500/20 group-hover:scale-110 transition-all duration-500">
                                        <Cookie className="h-7 w-7 text-teal-400" />
                                    </div>
                                    <CardTitle className="text-2xl text-white">30-Day Cookies</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-zinc-400 leading-relaxed text-lg">
                                        Our <span className="text-teal-400 font-semibold">30-day attribution window</span>{" "}
                                        means you get credit even if your referral takes a few weeks to convert. More
                                        time = more commission.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Card 3 */}
                            <Card className="bg-black/50 backdrop-blur border-white/10 hover:border-cyan-500/50 transition-colors duration-500 group">
                                <CardHeader>
                                    <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-500">
                                        <CalendarCheck className="h-7 w-7 text-cyan-400" />
                                    </div>
                                    <CardTitle className="text-2xl text-white">Monthly Payouts</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-zinc-400 leading-relaxed text-lg">
                                        Get paid every month like clockwork.{" "}
                                        <span className="text-cyan-400 font-semibold">No minimum thresholds</span>, no
                                        delays. Just consistent passive income deposited straight to you.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-32 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-[600px] h-[500px] opacity-10 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-transparent blur-[120px] rounded-full mix-blend-screen" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">
                                How it works
                            </h2>
                            <p className="text-zinc-400 max-w-xl mx-auto text-lg">
                                Start earning in three simple steps. No tech experience needed.
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            {/* Steps */}
                            <div className="grid md:grid-cols-3 gap-6 relative">
                                {/* Connector lines (desktop) */}
                                <div className="hidden md:block absolute top-10 left-[calc(16.666%+1rem)] right-[calc(16.666%+1rem)] h-px bg-gradient-to-r from-emerald-500/50 via-teal-500/50 to-cyan-500/50" />

                                {/* Step 1 */}
                                <div className="flex flex-col items-center text-center relative">
                                    <div className="relative w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] z-10">
                                        <UserPlus className="h-9 w-9 text-emerald-400" />
                                        <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-emerald-500 text-black text-xs font-extrabold flex items-center justify-center">
                                            1
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">Sign Up</h3>
                                    <p className="text-zinc-400 leading-relaxed">
                                        Create your free partner account in under 60 seconds. No approval process, no waiting — instant access.
                                    </p>
                                </div>

                                {/* Step 2 */}
                                <div className="flex flex-col items-center text-center relative">
                                    <div className="relative w-20 h-20 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-8 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] z-10">
                                        <Link2 className="h-9 w-9 text-teal-400" />
                                        <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-teal-500 text-black text-xs font-extrabold flex items-center justify-center">
                                            2
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">Get Your Link</h3>
                                    <p className="text-zinc-400 leading-relaxed">
                                        Grab your unique referral link from your affiliate dashboard and start sharing it anywhere — blog, social, email.
                                    </p>
                                </div>

                                {/* Step 3 */}
                                <div className="flex flex-col items-center text-center relative">
                                    <div className="relative w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-8 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] z-10">
                                        <Banknote className="h-9 w-9 text-cyan-400" />
                                        <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-cyan-500 text-black text-xs font-extrabold flex items-center justify-center">
                                            3
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">Get Paid</h3>
                                    <p className="text-zinc-400 leading-relaxed">
                                        Every time someone subscribes through your link, 50% of their payment lands in your account. Every month. Forever.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-28 border-t border-white/5">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-emerald-950/60 to-teal-950/40 border border-emerald-500/20 rounded-3xl p-12 md:p-16 shadow-[0_0_60px_-20px_rgba(16,185,129,0.4)]">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-8">
                                <Zap className="h-8 w-8 text-emerald-400" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
                                Ready to start earning?
                            </h2>
                            <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                                Join hundreds of partners already earning passive income. Sign up free and share
                                your link today.
                            </p>
                            <Button
                                size="lg"
                                className="h-14 px-12 text-base bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] transition-all hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.8)]"
                                asChild
                            >
                                <Link href="/signup">
                                    Join Partner Program <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <p className="text-zinc-600 text-sm mt-6">No credit card needed · Free forever</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-black pt-10 pb-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/logo.png" alt="b2bleads logo" width={32} height={32} className="object-contain" />
                            <span className="font-bold text-xl tracking-tight text-white">b2bleads</span>
                        </Link>
                        <div className="flex gap-8 text-sm font-medium text-zinc-400 flex-wrap justify-center">
                            <Link href="/privacy" className="hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="/contact" className="hover:text-white transition-colors">
                                Contact Support
                            </Link>
                        </div>
                    </div>
                    <div className="text-center text-zinc-600 text-sm mt-8">
                        &copy; {new Date().getFullYear()} b2bleads. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
