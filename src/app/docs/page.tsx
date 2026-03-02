'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    Book, Search, Zap, Shield, CreditCard,
    ArrowRight, MessageSquare, HelpCircle,
    ChevronDown, Globe, Mail, Rocket
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";

export default function FAQDocumentationPage() {
    const [searchQuery, setSearchQuery] = React.useState("");

    const faqs = [
        {
            q: "How does the lead extraction work?",
            a: "We use advanced cloud-based crawlers to search platforms like Google Maps and LinkedIn in real-time. Our AI then scrapes, verifies, and enriches this data to provide you with high-quality contact information."
        },
        {
            q: "Are the leads fresh?",
            a: "Yes! Unlike static databases, we perform live searches when you request them. This ensures you get the most up-to-date business information available on the web."
        },
        {
            q: "What are credits used for?",
            a: "Credits are the currency of b2bleads.ai. 1 credit typically equals 1 valid lead with phone and website. For leads with missing data, we only deduct a fraction of a credit (0.2 - 0.5)."
        },
        {
            q: "Can I export data to my CRM?",
            a: "Absolutely. You can export your leads in CSV, JSON, or Excel formats, which are compatible with almost all CRMs like Salesforce, HubSpot, and Pipedrive."
        },
        {
            q: "Is there an API available?",
            a: "Yes, we offer a robust developer API for Team and Enterprise users. You can find your API keys in the Settings > Developer tab."
        }
    ];

    const docs = [
        {
            title: "Getting Started",
            icon: Rocket,
            items: ["Quick Start Guide", "Dashboard Overview", "Search Tips"]
        },
        {
            title: "Lead Enrichment",
            icon: Zap,
            items: ["How AI Scoring Works", "Data Verification", "Industry Heuristics"]
        },
        {
            title: "Billing & Credits",
            icon: CreditCard,
            items: ["Subscription Tiers", "Crypto Payments", "Usage Reports"]
        },
        {
            title: "Developer Tools",
            icon: Globe,
            items: ["API Authentication", "Webhook Setup", "SDK Documentation"]
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            {/* Hero Section */}
            <div className="relative py-24 px-6 overflow-hidden bg-muted/30 border-b border-border">
                <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 blur-[120px] rounded-full" />
                </div>

                <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
                    <Badge variant="secondary" className="px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-600/10 text-indigo-400 border-indigo-500/20">
                        Help Center & Docs
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                        How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">help you</span> today?
                    </h1>
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search for answers, guides, or API docs..."
                            className="w-full bg-card border border-border rounded-3xl py-6 pl-16 pr-6 shadow-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-muted-foreground">
                        <span>Popular:</span>
                        <button className="hover:text-indigo-400 underline decoration-indigo-500/30">API Keys</button>
                        <button className="hover:text-indigo-400 underline decoration-indigo-500/30">Deducting Credits</button>
                        <button className="hover:text-indigo-400 underline decoration-indigo-500/30">Export Options</button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Documentation Grid */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <Book className="h-5 w-5 text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">Documentation</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {docs.map((doc, i) => (
                                <div key={i} className="group p-8 rounded-3xl bg-card border border-border hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/5">
                                    <div className="h-12 w-12 rounded-2xl bg-muted group-hover:bg-indigo-600/10 flex items-center justify-center mb-6 transition-colors">
                                        <doc.icon className="h-6 w-6 text-muted-foreground group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">{doc.title}</h3>
                                    <ul className="space-y-3">
                                        {doc.items.map((item, j) => (
                                            <li key={j}>
                                                <Link href="#" className="text-sm text-muted-foreground hover:text-indigo-400 flex items-center justify-between group/link">
                                                    {item}
                                                    <ChevronRight className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-all -translate-x-2 group-hover/link:translate-x-0" />
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Side */}
                    <div className="space-y-12">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <HelpCircle className="h-5 w-5 text-purple-400" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">Common FAQs</h2>
                        </div>

                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {faqs.map((faq, i) => (
                                <AccordionItem key={i} value={`item-${i}`} className="border border-border rounded-2xl px-6 bg-card data-[state=open]:border-indigo-500/30 transition-all overflow-hidden">
                                    <AccordionTrigger className="hover:no-underline py-6 font-bold text-left text-sm hover:text-indigo-400 transition-colors">
                                        {faq.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-6">
                                        {faq.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>

                        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white space-y-6 shadow-2xl shadow-indigo-500/20">
                            <MessageSquare className="h-10 w-10" />
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black leading-tight">Can't find what you're looking for?</h3>
                                <p className="text-white/80 text-sm">Our support team is available 24/7 to help you with any questions or technical issues.</p>
                            </div>
                            <Button className="w-full bg-white text-indigo-600 hover:bg-neutral-100 font-bold py-6 rounded-2xl transition-all shadow-xl">
                                Contact Support
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="max-w-4xl mx-auto px-6 mt-32 text-center">
                <div className="p-12 rounded-[40px] bg-muted/50 border border-border relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30" />
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-4xl font-black tracking-tighter">Ready to scale your outreach?</h2>
                        <p className="text-muted-foreground max-w-lg mx-auto">Join 5,000+ sales teams using b2bleads.ai to dominate their local markets.</p>
                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-7 rounded-2xl font-black text-lg group transition-all">
                                Get Started Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Link href="/dashboard/billing" className="text-sm font-bold hover:text-indigo-400 transition-colors">View Pricing Plans</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChevronRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
