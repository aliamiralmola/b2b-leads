"use client";

import { useState, useEffect } from "react";
import {
    Search, Zap, Target, Shield, Download, MapPin, Building2,
    Star, Globe, Phone, Globe2, Bookmark, CheckSquare, Square,
    Loader2, CheckCircle2, MessageCircle, Mail, Map as MapIcon, Table as TableIcon,
    Languages
} from "lucide-react";
import { searchLeads, saveLead, getBookmarks } from "../../actions/searchLeads";
import { createClient } from "@/utils/supabase/client";
import { UpgradeModal } from "@/components/upgrade-modal";
import { countries } from "@/lib/countries";
import { toast } from "sonner";

const INDUSTRY_PRESETS = [
    { name: "Real Estate Agents", keyword: "Real Estate Agents" },
    { name: "Dentists", keyword: "Dentists" },
    { name: "Roofing Contractors", keyword: "Roofing" },
    { name: "Digital Marketing Agencies", keyword: "Marketing Agency" },
    { name: "Lawyers", keyword: "Lawyers" },
    { name: "Plumbers", keyword: "Plumbers" },
    { name: "Gyms & Fitness", keyword: "Gym" },
    { name: "Restaurants", keyword: "Restaurants" },
];

export default function SearchPage() {
    const [keyword, setKeyword] = useState("");
    const [city, setCity] = useState("");
    const [countryCode, setCountryCode] = useState("us");
    const [requestedLimit, setRequestedLimit] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [leads, setLeads] = useState<any[]>([]);
    const [credits, setCredits] = useState<number | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [minRating, setMinRating] = useState(0);
    const [isVerified, setIsVerified] = useState<boolean | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [lastSearchTime, setLastSearchTime] = useState(0);
    const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
    const [bookmarkedNames, setBookmarkedNames] = useState<Set<string>>(new Set());
    const [isSavingLead, setIsSavingLead] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"table" | "map">("table");
    const [languageFilter, setLanguageFilter] = useState("All Languages");

    const supabase = createClient();

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsVerified(!!user.email_confirmed_at);
                const { data } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
                if (data) setCredits(data.credits);

                // Fetch existing bookmarks
                const existing = await getBookmarks();
                setBookmarkedNames(new Set(existing.map((b: any) => b.business_name)));
            }
        }
        init();
    }, [supabase]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword || !city || isLoading) return;

        const now = Date.now();
        if (now - lastSearchTime < 2000) return;
        setLastSearchTime(now);

        setIsLoading(true);
        setLeads([]);
        setSelectedLeads(new Set());
        try {
            const cityRegex = /^[a-zA-Z\s,]+$/;
            if (!cityRegex.test(city)) {
                toast.error("Please enter a valid city name.");
                setIsLoading(false);
                return;
            }

            if (credits !== null && credits < requestedLimit) {
                setShowUpgradeModal(true);
                return;
            }

            const results = await searchLeads(keyword, city, countryCode, requestedLimit, minRating);
            setLeads(results.leads);
            setCredits(results.creditsRemaining);
            toast.success(`Found ${results.leads.length} leads!`);
        } catch (error: any) {
            console.error(error);
            if (error.message.includes("Insufficient credits")) {
                setShowUpgradeModal(true);
            } else {
                toast.error(error.message || "Failed to search leads.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookmark = async (lead: any) => {
        if (bookmarkedNames.has(lead.name)) {
            toast.info("Lead is already bookmarked. View it in the Bookmarks page.");
            return;
        }

        setIsSavingLead(lead.name);
        try {
            await saveLead(lead);
            setBookmarkedNames(prev => new Set(prev).add(lead.name));
            toast.success("Lead saved successfully!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSavingLead(null);
        }
    };

    const toggleSelectAll = () => {
        if (selectedLeads.size === leads.length) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(leads.map((_, i) => i)));
        }
    };

    const toggleSelect = (idx: number) => {
        const next = new Set(selectedLeads);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        setSelectedLeads(next);
    };

    const handleExport = () => {
        const exportLeads = selectedLeads.size > 0
            ? leads.filter((_, i) => selectedLeads.has(i))
            : leads;

        if (exportLeads.length === 0) return;

        const headers = ["Name", "Phone", "Address", "Website", "Rating"];
        const rows = exportLeads.map((lead: any) => [
            `"${(lead.name || "").replace(/"/g, '""')}"`,
            `"${(lead.phone || "").replace(/"/g, '""')}"`,
            `"${(lead.address || "").replace(/"/g, '""')}"`,
            `"${(lead.website || "").replace(/"/g, '""')}"`,
            `"${lead.rating || "N/A"}"`
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `b2b_leads_${keyword.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${exportLeads.length} leads.`);
    };

    if (isVerified === false) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <Shield className="h-12 w-12 text-orange-500 mb-4" />
                <h2 className="text-2xl font-bold text-white">Verification Required</h2>
                <p className="text-gray-400 max-w-md">
                    Please verify your email address to access the lead search tool.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white mb-1">Lead Engine</h2>
                    <p className="text-gray-400 text-sm">Targeted B2B extraction with AI-ready datasets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode("table")}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "table" ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <TableIcon className="w-3.5 h-3.5" />
                            Table
                        </button>
                        <button
                            onClick={() => setViewMode("map")}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "map" ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <MapIcon className="w-3.5 h-3.5" />
                            Map View
                        </button>
                    </div>
                    <select
                        className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 transition-all cursor-pointer h-10"
                        onChange={(e) => setKeyword(e.target.value)}
                        value={keyword}
                    >
                        <option value="">Industry Presets</option>
                        {INDUSTRY_PRESETS.map(p => (
                            <option key={p.name} value={p.keyword}>{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="relative group p-6 bg-card border border-border rounded-3xl shadow-2xl">
                <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Industry (e.g. Dentists)"
                            className="w-full bg-white/[0.03] border border-white/10 text-white rounded-2xl pl-12 pr-4 py-4 hover:border-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-500"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex-1 relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="City (e.g. Dubai)"
                            className="w-full bg-white/[0.03] border border-white/10 text-white rounded-2xl pl-12 pr-4 py-4 hover:border-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-500"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex-1 relative">
                        <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <select
                            className="w-full bg-white/[0.03] border border-white/10 text-white rounded-2xl pl-12 pr-10 py-4 hover:border-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            required
                        >
                            {countries.map((country) => (
                                <option key={country.code} value={country.code}>{country.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Search className="h-5 w-5" /> Start Search</>}
                    </button>
                </form>

                <div className="bg-card/40 border border-border rounded-2xl overflow-hidden backdrop-blur-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 gap-4 border-b border-border bg-white/[0.01]">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                            <h3 className="font-bold text-white text-lg">Results ({leads.length})</h3>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Filter results..."
                                        className="bg-white/5 border border-white/10 text-xs text-white rounded-xl pl-9 pr-4 py-2 focus:border-indigo-500 outline-none w-full sm:w-48 transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                                    <select
                                        className="bg-white/5 border border-white/10 text-[10px] text-white rounded-xl pl-9 pr-8 py-2 focus:border-indigo-500 outline-none appearance-none cursor-pointer font-bold uppercase tracking-widest"
                                        value={languageFilter}
                                        onChange={(e) => setLanguageFilter(e.target.value)}
                                    >
                                        <option>All Languages</option>
                                        <option>English</option>
                                        <option>Arabic</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                        <option>German</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {selectedLeads.size > 0 && (
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{selectedLeads.size} Selected</span>
                            )}
                            {leads.length > 0 && (
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-sm font-bold transition-all border border-indigo-600/20"
                                >
                                    <Download className="h-4 w-4" />
                                    {selectedLeads.size > 0 ? "Export Selected" : "Export List"}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        {viewMode === "table" ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-gray-500 uppercase font-black tracking-widest bg-white/[0.02] border-b border-border">
                                        <tr>
                                            <th className="px-6 py-4 w-10">
                                                <button onClick={toggleSelectAll} className="text-gray-400 hover:text-white transition-colors">
                                                    {selectedLeads.size === leads.length && leads.length > 0 ? <CheckSquare className="h-5 w-5 text-indigo-500" /> : <Square className="h-5 w-5" />}
                                                </button>
                                            </th>
                                            <th className="px-6 py-4 font-medium">Business Name</th>
                                            <th className="px-6 py-4 font-medium">Location</th>
                                            <th className="px-6 py-4 font-medium">Contact</th>
                                            <th className="px-6 py-4 font-medium">Rating</th>
                                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {isLoading ? (
                                            Array(5).fill(0).map((_, idx) => (
                                                <tr key={idx} className="bg-white/[0.01]">
                                                    <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-white/5 rounded animate-pulse w-full"></div></td>
                                                </tr>
                                            ))
                                        ) : leads.length > 0 ? (
                                            leads
                                                .filter(lead =>
                                                    (lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        lead.address?.toLowerCase().includes(searchQuery.toLowerCase())) &&
                                                    (lead.rating || 0) >= minRating
                                                )
                                                .map((lead, idx) => (
                                                    <tr key={idx} className={`hover:bg-primary/[0.03] transition-colors group ${selectedLeads.has(idx) ? 'bg-primary/[0.05]' : ''}`}>
                                                        <td className="px-6 py-4">
                                                            <button onClick={() => toggleSelect(idx)} className="text-gray-600 group-hover:text-gray-400 transition-colors">
                                                                {selectedLeads.has(idx) ? <CheckSquare className="h-5 w-5 text-indigo-500" /> : <Square className="h-5 w-5" />}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{lead.name}</div>
                                                            {lead.website && (
                                                                <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-indigo-400 transition-colors">
                                                                    <Globe className="h-3 w-3" /> Visit Website
                                                                </a>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-400 text-xs">{lead.address || "-"}</td>
                                                        <td className="px-6 py-4">
                                                            {lead.phone ? (
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex items-center gap-2 text-white font-medium">
                                                                        <Phone className="h-3 w-3 text-indigo-400" />
                                                                        {lead.phone}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <a
                                                                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="p-1 px-2 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                                                                        >
                                                                            <MessageCircle className="h-3 w-3" /> WhatsApp
                                                                        </a>
                                                                        <a
                                                                            href={`mailto:contact@${lead.website?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || lead.name.toLowerCase().replace(/\s+/g, '') + '.com'}`}
                                                                            className="p-1 px-2 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-500/20 transition-all border border-indigo-500/20"
                                                                        >
                                                                            <Mail className="h-3 w-3" /> Email
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            ) : <span className="text-gray-600">No contact info</span>}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <Star className={`h-4 w-4 ${lead.rating > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                                                                <span className="text-white font-black">{lead.rating || "N/A"}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => handleBookmark(lead)}
                                                                disabled={isSavingLead === lead.name}
                                                                className={`p-2 rounded-lg border transition-all ${bookmarkedNames.has(lead.name) ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-muted border-border text-gray-400 hover:border-primary hover:text-primary'}`}
                                                            >
                                                                {isSavingLead === lead.name ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : bookmarkedNames.has(lead.name) ? (
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                ) : (
                                                                    <Bookmark className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-24 text-center">
                                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                                        <div className="bg-white/5 p-6 rounded-full mb-6">
                                                            <Search className="h-12 w-12 opacity-20" />
                                                        </div>
                                                        <p className="text-xl font-bold text-white mb-2">No leads to display</p>
                                                        <p className="max-w-xs mx-auto">Enter an industry and city to begin extracting high-quality B2B prospects.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 space-y-6">
                                <div className="aspect-[21/9] w-full bg-[#0a0a0a] rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center group">
                                    {/* Mock Map Background */}
                                    <div className="absolute inset-0 opacity-20 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/0,0,1,0,0/800x400?access_token=mock')] bg-cover bg-center" />

                                    {/* Map Grid Lines */}
                                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff05 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                                    {leads.length > 0 ? (
                                        <div className="relative z-10 w-full h-full">
                                            {leads.slice(0, 10).map((lead, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute animate-bounce"
                                                    style={{
                                                        left: `${20 + (i * 7) % 65}%`,
                                                        top: `${20 + (i * 13) % 65}%`,
                                                        animationDelay: `${i * 150}ms`
                                                    }}
                                                >
                                                    <div className="relative group/pin">
                                                        <MapPin className="w-8 h-8 text-indigo-500 fill-indigo-500/20" />
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-card border border-border p-3 rounded-xl shadow-2xl opacity-0 scale-95 group-hover/pin:opacity-100 group-hover/pin:scale-100 transition-all pointer-events-none z-50">
                                                            <p className="font-bold text-white text-xs truncate">{lead.name}</p>
                                                            <p className="text-[10px] text-gray-500 truncate mt-1">{lead.address}</p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                                <span className="text-[10px] text-white font-bold">{lead.rating}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="absolute bottom-6 right-6 bg-indigo-600/10 border border-indigo-600/20 px-4 py-2 rounded-full backdrop-blur-md">
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Showing top 10 locations</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center relative z-10">
                                            <div className="bg-white/5 p-6 rounded-full mb-4 inline-block">
                                                <MapIcon className="w-12 h-12 text-gray-600 opacity-50" />
                                            </div>
                                            <p className="text-white font-bold">No locations to map</p>
                                            <p className="text-gray-500 text-xs mt-2">Start a search to see leads visualized geographically.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {leads.slice(0, 6).map((lead, i) => (
                                        <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all cursor-pointer">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-bold text-white text-sm">{lead.name}</h4>
                                                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{lead.address}</p>
                                                </div>
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
        </div>
    );
}

