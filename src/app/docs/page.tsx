import Link from "next/link";
import { ArrowLeft, BookOpen, Search, CreditCard, Users, ShieldCheck, Zap } from "lucide-react";

export const metadata = {
    title: "Documentation – b2bleads",
    description: "Full documentation for the b2bleads platform — search, credits, exports, billing, and the affiliate program.",
};

const SECTIONS = [
    {
        icon: Search,
        color: "indigo",
        title: "Lead Search",
        slug: "search",
        items: [
            "Enter an industry keyword (e.g. 'Dentists') and a target city.",
            "Select a country from the dropdown to scope the search geographically.",
            "Use Industry Presets for quick access to common business categories.",
            "Adjust the Results Limit (5–50) to control credit usage per search.",
            "Toggle between Table View and Map View using the controls in the top-right.",
            "Filter results by language using the 🌐 Language dropdown.",
            "Export results as CSV, JSON, or PDF with the Export button.",
        ],
    },
    {
        icon: CreditCard,
        color: "emerald",
        title: "Credits",
        slug: "credits",
        items: [
            "New accounts receive 10 free trial credits.",
            "1 credit = 1 lead extracted with full data (name, phone, address, website, rating).",
            "Leads missing phone or website are charged 0.5 credits.",
            "Duplicate leads are automatically detected and do not consume credits.",
            "Credits never expire and roll over between months.",
            "Purchase more credits from Dashboard → Billing using USDC/USDT on Polygon.",
        ],
    },
    {
        icon: Users,
        color: "amber",
        title: "Team Management",
        slug: "team",
        items: [
            "Invite team members from Settings → General → Team Name.",
            "All team members share the workspace credit balance.",
            "The workspace owner manages billing and plan upgrades.",
            "Remove team members at any time from the settings panel.",
        ],
    },
    {
        icon: ShieldCheck,
        color: "rose",
        title: "Security",
        slug: "security",
        items: [
            "Change your password any time from Settings → Security.",
            "Use 'Forgot Password' on the login page to reset via email.",
            "Sign out of all devices simultaneously from the Session Management panel.",
            "Delete your account permanently from Settings → Security → Danger Zone.",
        ],
    },
    {
        icon: Zap,
        color: "violet",
        title: "Affiliate Program",
        slug: "affiliate",
        items: [
            "Earn 50% recurring commission on every referral subscription.",
            "Access your unique affiliate link from Dashboard → Affiliates.",
            "Track clicks, conversions, and earnings in real-time.",
            "Payouts are processed on the 1st of every month.",
        ],
    },
];

const colorMap: Record<string, string> = {
    indigo: "bg-indigo-500/10 text-indigo-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    rose: "bg-rose-500/10 text-rose-400",
    violet: "bg-violet-500/10 text-violet-400",
};

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-50 font-sans py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Documentation
                    </h1>
                </div>
                <p className="text-zinc-400 text-lg mb-16 max-w-2xl">
                    A complete reference for the b2bleads platform. Jump to any section using the navigation below.
                </p>

                {/* Quick Nav */}
                <div className="flex flex-wrap gap-3 mb-16">
                    {SECTIONS.map((s) => (
                        <a
                            key={s.slug}
                            href={`#${s.slug}`}
                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-indigo-500/40 transition-all"
                        >
                            {s.title}
                        </a>
                    ))}
                </div>

                <div className="space-y-16">
                    {SECTIONS.map((section) => {
                        const Icon = section.icon;
                        const colorClass = colorMap[section.color];
                        return (
                            <div key={section.slug} id={section.slug} className="scroll-mt-24">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass.replace("text-", "bg-").split(" ")[0]} `}>
                                        <Icon className={`w-5 h-5 ${colorClass.split(" ")[1]}`} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                                </div>
                                <ul className="space-y-3">
                                    {section.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-zinc-400 leading-relaxed">
                                            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${colorClass.split(" ")[1].replace("text-", "bg-")}`} />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-20 p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl text-center">
                    <p className="text-zinc-400 mb-2">Still have questions?</p>
                    <Link href="/contact" className="text-indigo-400 hover:underline font-semibold">
                        Contact our support team →
                    </Link>
                </div>
            </div>
        </div>
    );
}
