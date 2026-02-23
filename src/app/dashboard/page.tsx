"use client";

import { useState, useEffect } from "react";
import { Search, Zap, Target, Shield, Download, MapPin, Building2, Star, Globe, Phone, Globe2 } from "lucide-react";
import { searchLeads } from "../actions/searchLeads";
import { createClient } from "@/utils/supabase/client";
import { UpgradeModal } from "@/components/upgrade-modal";
import { countries } from "@/lib/countries";

export default function DashboardPage() {
    const [keyword, setKeyword] = useState("");
    const [city, setCity] = useState("");
    const [countryCode, setCountryCode] = useState("us");
    const [requestedLimit, setRequestedLimit] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [leads, setLeads] = useState<any[]>([]);
    const [credits, setCredits] = useState<number | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        async function fetchCredits() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
                if (data) setCredits(data.credits);
            }
        }
        fetchCredits();
    }, [supabase]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword || !city) return;

        setIsLoading(true);
        setLeads([]);
        try {
            // Frontend validation first for better UX
            if (credits !== null && credits < requestedLimit) {
                setShowUpgradeModal(true);
                return;
            }

            const results = await searchLeads(keyword, city, countryCode, requestedLimit);
            setLeads(results.leads);
            setCredits(results.creditsRemaining);
        } catch (error: any) {
            console.error(error);
            if (error.message.includes("Insufficient credits")) {
                setShowUpgradeModal(true);
            } else {
                alert(`Search Failed: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        console.log("Exporting to CSV...", leads);
        alert("Exported to Console. Check developer tools.");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Lead Extractor</h2>
                    <p className="text-gray-400">Discover and extract high-quality B2B leads from Google Maps.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Search Results", value: leads.length > 0 ? leads.length.toString() : "0", icon: Target, color: "text-blue-400" },
                    { label: "Credits Remaining", value: credits !== null ? credits.toString() : "...", icon: Shield, color: "text-emerald-400" },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl group hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="relative group p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Industry / Keyword (e.g. Dentists)"
                            className="w-full bg-[#111] border border-white/10 text-white rounded-lg pl-10 pr-4 py-2 hover:border-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-500"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex-1 relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="City / Location (e.g. Dubai)"
                            className="w-full bg-[#111] border border-white/10 text-white rounded-lg pl-10 pr-4 py-2 hover:border-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-500"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex-1 relative">
                        <Globe2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <select
                            className="w-full bg-[#111] border border-white/10 text-white rounded-lg pl-10 pr-4 py-2 hover:border-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select Country</option>
                            {countries.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1 relative max-w-[140px]">
                        <Target className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="number"
                            placeholder="Limit"
                            min={1}
                            max={credits || 100}
                            className="w-full bg-[#111] border border-white/10 text-white rounded-lg pl-10 pr-4 py-2 hover:border-white/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-500"
                            value={requestedLimit}
                            onChange={(e) => setRequestedLimit(parseInt(e.target.value) || 1)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Search className="h-5 w-5" />
                                Find Leads
                            </>
                        )}
                    </button>
                </form>

                {/* Results Section */}
                <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-white/5 bg-[#161616]">
                        <h3 className="font-semibold text-white">Extracted Leads</h3>
                        {leads.length > 0 && (
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                Export CSV
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-500 uppercase bg-[#1a1a1a] border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Business Name</th>
                                    <th className="px-6 py-4 font-medium">Address</th>
                                    <th className="px-6 py-4 font-medium">Contact</th>
                                    <th className="px-6 py-4 font-medium">Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    // Loading Skeletons
                                    Array(5).fill(0).map((_, idx) => (
                                        <tr key={idx} className="border-b border-white/5">
                                            <td className="px-6 py-4">
                                                <div className="h-4 bg-white/5 rounded animate-pulse w-3/4"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 bg-white/5 rounded animate-pulse w-full"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 bg-white/5 rounded animate-pulse w-1/2"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 bg-white/5 rounded animate-pulse w-1/4"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : leads.length > 0 ? (
                                    leads.map((lead, idx) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white mb-1">{lead.name}</div>
                                                {lead.website && (
                                                    <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                                                        <Globe className="h-3 w-3" /> Website
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-[200px] truncate" title={lead.address}>
                                                    {lead.address || "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {lead.phone ? (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3 text-gray-500" />
                                                        {lead.phone}
                                                    </div>
                                                ) : "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                                    <span className="text-white font-medium">{lead.rating || "N/A"}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <Search className="h-8 w-8 mb-2 opacity-20" />
                                                <p>No leads found. Enter a keyword and location to start searching.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <UpgradeModal
                open={showUpgradeModal}
                onOpenChange={setShowUpgradeModal}
            />
        </div>
    );
}
