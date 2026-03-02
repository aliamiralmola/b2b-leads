import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";

export const metadata = {
    title: "FAQ – b2bleads",
    description: "Frequently asked questions about b2bleads — credits, search, billing, and more.",
};

const FAQS = [
    {
        category: "Credits & Billing",
        items: [
            { q: "How do credits work?", a: "Each credit lets you extract 1 verified business lead. If a result is missing a phone number or website, you are charged 0.5 credits. New accounts start with 10 free trial credits." },
            { q: "How do I buy more credits?", a: "Go to Dashboard → Billing and choose a plan. Payment is processed via crypto (USDC/USDT on Polygon). Credits are added instantly after verification." },
            { q: "Do credits expire?", a: "No — your credits never expire. Use them at your own pace." },
            { q: "Can I get a refund?", a: "Yes, within 7 days of purchase if fewer than 20% of your credits have been used. See our Refund Policy for full details." },
        ],
    },
    {
        category: "Search & Leads",
        items: [
            { q: "Where does the data come from?", a: "Leads are sourced in real-time from Google Maps and other public business directories. We do not store or resell static databases." },
            { q: "What is the Export feature?", a: "You can export your search results as CSV, JSON, or PDF from the search results toolbar. Bulk export is available by selecting multiple rows." },
            { q: "Can I search by language?", a: "Yes. Use the Language Filter in the search results table to narrow results to businesses operating in a specific language." },
            { q: "Why are some leads missing phone numbers?", a: "Some businesses do not publish phone numbers publicly. We charge 0.5 credits in these cases." },
        ],
    },
    {
        category: "Account & Security",
        items: [
            { q: "How do I change my password?", a: "Go to Settings → Security → Change Password. You can also use 'Forgot Password' on the login page to reset via email." },
            { q: "Can I invite team members?", a: "Yes, team invitations are available under Settings → General → Team. Invited members share your credit balance." },
            { q: "How do I delete my account?", a: "Go to Settings → Security → Danger Zone and click 'Delete Account'. This action is permanent and cannot be undone." },
        ],
    },
    {
        category: "Affiliate Program",
        items: [
            { q: "How much do I earn?", a: "You earn 50% recurring commission on every payment your referrals make — every month, for as long as they stay subscribed." },
            { q: "When do I get paid?", a: "Payouts are processed on the 1st of every month via PayPal, Payoneer, or wire transfer. There is no minimum threshold." },
        ],
    },
];

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans py-20 px-4">
            <div className="max-w-3xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                    Frequently Asked Questions
                </h1>
                <p className="text-zinc-400 text-lg mb-16 max-w-xl">
                    Everything you need to know about b2bleads. Can't find what you're looking for?{" "}
                    <Link href="/contact" className="text-indigo-400 hover:underline">Contact support</Link>.
                </p>

                <div className="space-y-12">
                    {FAQS.map((section) => (
                        <div key={section.category}>
                            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-6 border-b border-white/5 pb-3">
                                {section.category}
                            </h2>
                            <div className="space-y-4">
                                {section.items.map((item) => (
                                    <details key={item.q} className="group bg-zinc-950/80 border border-white/5 rounded-2xl px-6 py-5 hover:border-indigo-500/30 transition-colors">
                                        <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-white gap-4">
                                            <span>{item.q}</span>
                                            <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0 group-open:rotate-180 transition-transform" />
                                        </summary>
                                        <p className="mt-4 text-zinc-400 leading-relaxed text-sm">{item.a}</p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
