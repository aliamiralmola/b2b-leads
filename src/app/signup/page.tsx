'use client';

import * as React from 'react';
import Link from 'next/link';
import { useState } from 'react';
import {
    Zap, Rocket, CheckCircle2, ArrowRight, Loader2,
    Mail, Lock, User, ShieldCheck, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate signup logic for now (actual logic would use Supabase client)
        setTimeout(() => {
            toast.success("Account created! Please check your email to verify.");
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden">
            {/* Left Side: Branding & Features */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-transparent p-12 flex-col justify-between border-r border-white/5 relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />
                </div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 mb-12">
                        <div className="bg-gradient-to-tr from-indigo-600 to-purple-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                            <Zap className="w-6 h-6 text-white fill-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter">b2bleads<span className="text-indigo-500">.ai</span></span>
                    </Link>

                    <h1 className="text-5xl font-black leading-tight mb-8">
                        The ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">lead engine</span> for modern growth.
                    </h1>

                    <div className="space-y-6 max-w-md">
                        {[
                            { icon: Globe, title: "Global Extraction", desc: "Access data from Google Maps, LinkedIn, and more." },
                            { icon: ShieldCheck, title: "AI Verification", desc: "Quality scoring and context enrichment for every lead." },
                            { icon: Rocket, title: "Instant Growth", desc: "Export leads directly to your favorite CRM tools." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border backdrop-blur-sm group hover:bg-muted/50 transition-all">
                                <item.icon className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-lg">{item.title}</h4>
                                    <p className="text-white/60 text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 pt-12 border-t border-white/5">
                    <div className="flex -space-x-3 mb-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-10 w-10 rounded-full border-2 border-[#050505] bg-muted flex items-center justify-center text-[10px] font-bold">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                        <div className="h-10 px-3 py-2 rounded-full border-2 border-[#050505] bg-indigo-600 text-[10px] font-bold flex items-center justify-center">
                            +5k Users
                        </div>
                    </div>
                    <p className="text-sm text-white/40 italic">"This platform changed our outbound sales forever." — Growth Lead</p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full md:w-1/2 p-8 md:p-24 flex flex-col justify-center bg-card relative">
                <div className="max-w-md w-full mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-foreground">Get Started</h2>
                        <p className="text-muted-foreground">Create your account to start extracting leads in seconds.</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter your name"
                                    className="w-full bg-muted/50 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-muted-foreground/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    required
                                    type="email"
                                    placeholder="name@company.com"
                                    className="w-full bg-muted/50 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-muted-foreground/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-muted/50 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-muted-foreground/50"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-1">
                            <input type="checkbox" id="terms" className="accent-indigo-500 rounded h-4 w-4" required />
                            <label htmlFor="terms" className="text-xs text-muted-foreground">
                                I agree to the <Link href="/terms" className="text-indigo-400 hover:underline">Terms of Service</Link>
                            </label>
                        </div>

                        <Button
                            disabled={isLoading}
                            className="w-full py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all mt-4"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2">Create Account <ArrowRight className="w-5 h-5" /></span>}
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account? <Link href="/login" className="text-indigo-400 font-bold hover:underline">Sign In</Link>
                        </p>
                    </div>

                    <div className="pt-8 grid grid-cols-2 gap-4 border-t border-border">
                        <div className="flex flex-col items-center p-4 rounded-2xl bg-muted/30 border border-border text-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Free Credits</span>
                            <span className="text-lg font-bold">50 Leads</span>
                        </div>
                        <div className="flex flex-col items-center p-4 rounded-2xl bg-muted/30 border border-border text-center">
                            <Zap className="w-5 h-5 text-amber-500 mb-2" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Setup Time</span>
                            <span className="text-lg font-bold">&lt; 1 min</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
