"use client";

import React, { useState, useEffect } from "react";
import {
    Search, Zap, Target, Shield, Download, MapPin, Building2,
    Star, Globe, Phone, Globe2, Bookmark, CheckSquare, Square,
    Loader2, CheckCircle2, MessageCircle, Mail, Map as MapIcon, Table as TableIcon,
    Languages, Linkedin, Filter, Clock, Users, FileText, FileSpreadsheet, ChevronDown, Monitor
} from "lucide-react";
import dynamic from "next/dynamic";
import { searchLeads, saveLead, getBookmarks } from "../../actions/searchLeads";
import { checkWebsiteAvailability } from "../../actions/checkWebsite";
import { createClient } from "@/utils/supabase/client";
import { UpgradeModal } from "@/components/upgrade-modal";
import { LeadDetailModal } from "@/components/LeadDetailModal";
import { countries } from "@/lib/countries";
import { toast } from "sonner";
import { getCitiesByCountry } from "../../actions/locations";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

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
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
    const [bookmarkedNames, setBookmarkedNames] = useState<Set<string>>(new Set());
    const [isSavingLead, setIsSavingLead] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"table" | "map">("table");
    const [languageFilter, setLanguageFilter] = useState("All Languages");
    const [searchSource, setSearchSource] = useState<string>("linkedin");
    const [minReviews, setMinReviews] = useState(0);
    const [maxDistance, setMaxDistance] = useState(50); // km
    const [onlyOpenNow, setOnlyOpenNow] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedDetailLead, setSelectedDetailLead] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isWorldwide, setIsWorldwide] = useState(false);
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [isFetchingCities, setIsFetchingCities] = useState(false);
    const [debugLogs, setDebugLogs] = useState<string[]>([]);

    // New UX features
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [hasPhone, setHasPhone] = useState(false);
    const [hasEmail, setHasEmail] = useState(false);
    const [hasWebsite, setHasWebsite] = useState(false);

    useEffect(() => {
        if (!countryCode || isWorldwide) {
            setAvailableCities([]);
            return;
        }

        let isMounted = true;
        setIsFetchingCities(true);

        getCitiesByCountry(countryCode).then(cities => {
            if (isMounted) {
                setAvailableCities(cities);
                setIsFetchingCities(false);
            }
        }).catch(err => {
            console.error("Failed to fetch cities:", err);
            if (isMounted) setIsFetchingCities(false);
        });

        return () => { isMounted = false; };
    }, [countryCode, isWorldwide]);

    // LinkedIn Specific Filters
    const [liCompany, setLiCompany] = useState("");
    const [liCurrentCompany, setLiCurrentCompany] = useState("");
    const [liFirstName, setLiFirstName] = useState("");
    const [liLastName, setLiLastName] = useState("");
    const [liName, setLiName] = useState("");
    const [liIndustry, setLiIndustry] = useState("");
    const [liProfileLanguage, setLiProfileLanguage] = useState("");
    const [liSchool, setLiSchool] = useState("");
    const [liServiceCategory, setLiServiceCategory] = useState("");
    const [liTitle, setLiTitle] = useState("");
    const [websiteStatuses, setWebsiteStatuses] = useState<Record<string, 'checking' | 'active' | 'inactive' | 'unknown'>>({});

    const supabase = React.useMemo(() => createClient(), []);

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

    const filteredLeads = React.useMemo(() => {
        const result = leads.filter(lead => {
            const matchesQuery = (lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.address?.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesRating = (lead.rating || 0) >= minRating;

            const textContent = (lead.address || "") + (lead.name || "");
            const isArabic = /[\u0600-\u06FF]/.test(textContent);
            const isFrench = /[àâäéèêëïîôöùûüç]/i.test(textContent);
            const isGerman = /[äöüß]/i.test(textContent);
            const isSpanish = /[áéíóúüñ¿¡]/i.test(textContent);

            const isEnglish = (!isArabic && !isFrench && !isGerman && !isSpanish);

            let langMatch = true;
            if (languageFilter === "Arabic") langMatch = isArabic;
            if (languageFilter === "French") langMatch = isFrench;
            if (languageFilter === "German") langMatch = isGerman;
            if (languageFilter === "Spanish") langMatch = isSpanish;
            if (languageFilter === "English") langMatch = isEnglish;

            const phoneMatch = !hasPhone || !!lead.phone;
            const emailMatch = !hasEmail || !!lead.email;
            const websiteMatch = !hasWebsite || !!lead.website;

            return matchesQuery && matchesRating && langMatch && phoneMatch && emailMatch && websiteMatch;
        });

        if (sortConfig) {
            result.sort((a: any, b: any) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];
                if (typeof aVal === 'string') aVal = aVal.toLowerCase();
                if (typeof bVal === 'string') bVal = bVal.toLowerCase();
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [leads, searchQuery, minRating, languageFilter, hasPhone, hasEmail, hasWebsite, sortConfig]);

    const paginatedLeads = React.useMemo(() => {
        return filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredLeads, currentPage, itemsPerPage]);

    useEffect(() => {
        if (paginatedLeads.length > 0) {
            paginatedLeads.forEach((lead: any) => {
                if (lead.website && !websiteStatuses[lead.id]) {
                    setWebsiteStatuses(prev => ({ ...prev, [lead.id]: 'checking' }));
                    checkWebsiteAvailability(lead.website).then(isActive => {
                        setWebsiteStatuses(prev => ({ ...prev, [lead.id]: isActive ? 'active' : 'inactive' }));
                    });
                }
            });
        }
    }, [paginatedLeads]);

    const handleSearch = async (e?: React.FormEvent, overrideKeyword?: string) => {
        if (e) e.preventDefault();
        const searchKw = overrideKeyword || keyword;
        if (!searchKw || (searchSource === 'google' && !city && !isWorldwide) || isLoading) {
            if (!searchKw) toast.error("Please enter a keyword.");
            if (!city && !isWorldwide) toast.error("Please enter a city or enable Worldwide search.");
            return;
        }

        const now = Date.now();
        setLastSearchTime(now);

        setIsLoading(true);
        setLeads([]);
        setDebugLogs([]);
        setSelectedLeads(new Set());
        try {
            if (city && !isWorldwide) {
                if (/[<>"{}:;[\]]/.test(city)) {
                    toast.error("Invalid characters in city name.");
                    setIsLoading(false);
                    return;
                }
            }

            // Credits are unlimited now, so we skip the credits check

            const liFilters = searchSource === 'linkedin' ? {
                company: liCompany || undefined,
                current_company: liCurrentCompany || undefined,
                first_name: liFirstName || undefined,
                last_name: liLastName || undefined,
                name: liName || undefined,
                industry: liIndustry || undefined,
                profile_language: liProfileLanguage || undefined,
                school: liSchool || undefined,
                service_category: liServiceCategory || undefined,
                title: liTitle || undefined,
                geocode_location: isWorldwide ? undefined : (city || undefined),
            } : undefined;

            const results = await searchLeads(searchKw, city, countryCode, requestedLimit, minRating, minReviews, maxDistance, onlyOpenNow, searchSource, liFilters, isWorldwide);
            setLeads(results.leads);
            setCredits(results.creditsRemaining);
            if (results.debugLogs) setDebugLogs(results.debugLogs);
            setCurrentPage(1);

            if (results.duplicateCount > 0) {
                toast.success(`Found ${results.leads.length} new leads! (${results.duplicateCount} duplicates skipped)`);
            } else {
                toast.success(`Found ${results.leads.length} leads!`);
            }
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

    const handleBulkBookmark = async () => {
        const toSave = leads.filter(l => selectedLeads.has(l.id) && !bookmarkedNames.has(l.name));
        if (toSave.length === 0) {
            toast.error("No new leads to save.");
            return;
        }

        const loadingToast = toast.loading(`Saving ${toSave.length} leads...`);
        try {
            for (const lead of toSave) {
                await saveLead(lead);
                setBookmarkedNames(prev => new Set(prev).add(lead.name));
            }
            toast.success(`Saved ${toSave.length} leads successfully!`, { id: loadingToast });
        } catch (error: any) {
            toast.error(error.message, { id: loadingToast });
        }
    };

    const toggleSort = (key: string) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return current.direction === 'asc' ? { key, direction: 'desc' } : null;
            }
            return { key, direction: 'asc' };
        });
    };

    const toggleSelectAll = () => {
        const allSelected = paginatedLeads.every((l: any) => selectedLeads.has(l.id));
        if (allSelected) {
            const next = new Set(selectedLeads);
            paginatedLeads.forEach((l: any) => next.delete(l.id));
            setSelectedLeads(next);
        } else {
            const next = new Set(selectedLeads);
            paginatedLeads.forEach((l: any) => next.add(l.id));
            setSelectedLeads(next);
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedLeads);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedLeads(next);
    };

    const handleExport = async (format: "csv" | "json" | "excel" = "csv") => {
        const exportLeads = selectedLeads.size > 0
            ? leads.filter((lead) => selectedLeads.has(lead.id))
            : filteredLeads;

        if (exportLeads.length === 0) {
            toast.error("No leads to export.");
            return;
        }

        if (format === "json") {
            const blob = new Blob([JSON.stringify(exportLeads, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `b2b_leads_${keyword.replace(/\s+/g, '_')}_${new Date().getTime()}.json`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 100);
            toast.success(`Exported ${exportLeads.length} leads as JSON.`);
            return;
        }

        if (format === "excel") {
            try {
                const XLSX = await import("xlsx");
                const worksheet = XLSX.utils.json_to_sheet(exportLeads);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
                XLSX.writeFile(workbook, `b2b_leads_${keyword.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`);
                toast.success(`Exported ${exportLeads.length} leads as Excel.`);
            } catch (error) {
                console.error("Excel export error:", error);
                toast.error("Failed to export Excel. Please try CSV.");
            }
            return;
        }

        // CSV Export
        const headers = ["Name", "Email", "Phone", "Address", "Website", "LinkedIn", "Facebook", "Instagram", "Twitter", "Rating", "Source", "Reviews"];
        const rows = exportLeads.map((lead: any) => [
            `"${(lead.name || "").replace(/"/g, '""')}"`,
            `"${(lead.email || "").replace(/"/g, '""')}"`,
            `"${(lead.phone || "").replace(/"/g, '""')}"`,
            `"${(lead.address || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
            `"${(lead.website || "").replace(/"/g, '""')}"`,
            `"${(lead.socials?.linkedin || "").replace(/"/g, '""')}"`,
            `"${(lead.socials?.facebook || "").replace(/"/g, '""')}"`,
            `"${(lead.socials?.instagram || "").replace(/"/g, '""')}"`,
            `"${(lead.socials?.twitter || "").replace(/"/g, '""')}"`,
            `"${lead.rating || "N/A"}"`,
            `"${searchSource.toUpperCase()}"`,
            `"${lead.reviews || 0}"`
        ]);

        const csvString = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
        const blob = new Blob(["\uFEFF", csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `b2b_leads_${keyword.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        toast.success(`Exported ${exportLeads.length} leads.`);
    };

    if (isVerified === false) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="h-20 w-20 rounded-3xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-2xl">
                    <Shield className="h-10 w-10 text-orange-500 animate-pulse" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-foreground uppercase tracking-tight mb-2">Access Restricted</h2>
                    <p className="text-muted-foreground max-w-md mx-auto text-sm font-medium">
                        Verification is mandatory to initialize the Lead Engine. Please confirm your credentials via the email sent to your inbox.
                    </p>
                </div>
                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-foreground text-background rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl">Re-authenticate Session</button>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Control Center */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sticky top-0 z-30 bg-background/80 backdrop-blur-xl p-4 -m-4 border-b border-border/40 lg:relative lg:bg-transparent lg:backdrop-blur-none lg:p-0 lg:m-0 lg:border-none">
                <div className="lg:col-span-4 flex items-center justify-between lg:block">
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter text-foreground mb-1 uppercase">Lead Engine</h2>
                        <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.2em] opacity-60">B2B Lead Generation</p>
                    </div>
                    <div className="flex flex-col items-end lg:mt-4">
                        <div className="px-4 py-2 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl flex items-center gap-2">
                            <Zap className="w-3 h-3 text-indigo-500 fill-indigo-500" />
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                Unlimited Free Plan
                            </span>
                        </div>
                        <p className="text-[8px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">
                            0.0 Credits / Search
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-8 flex flex-wrap items-center justify-end gap-3">
                    <div className="flex bg-muted/50 border border-border rounded-2xl p-1 shadow-inner overflow-x-auto max-w-full">
                        <button
                            onClick={() => setSearchSource("google")}
                            title="Google Maps"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchSource === "google" ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Search className="w-3 h-3 min-w-3" /> G-Maps
                        </button>
                        <button
                            onClick={() => setSearchSource("linkedin")}
                            title="LinkedIn"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchSource === "linkedin" ? 'bg-blue-600 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Linkedin className="w-3 h-3 min-w-3" /> L-In
                        </button>
                        <button
                            onClick={() => setSearchSource("facebook")}
                            title="Facebook"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchSource === "facebook" ? 'bg-blue-800 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            FB
                        </button>
                        <button
                            onClick={() => setSearchSource("instagram")}
                            title="Instagram"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchSource === "instagram" ? 'bg-pink-600 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            IG
                        </button>
                        <button
                            onClick={() => setSearchSource("twitter")}
                            title="Twitter / X"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchSource === "twitter" ? 'bg-slate-800 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            X
                        </button>
                    </div>

                    <div className="flex bg-muted/50 border border-border rounded-2xl p-1 shadow-inner">
                        <button
                            onClick={() => setViewMode("table")}
                            title="Tabular Data View"
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "table" ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <TableIcon className="w-3.5 h-3.5" /> Grid
                        </button>
                        <button
                            onClick={() => setViewMode("map")}
                            title="Geospatial Visualization"
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "map" ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <MapIcon className="w-3.5 h-3.5" /> Map
                        </button>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 px-6 py-3 bg-muted border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-card transition-all active:scale-95 shadow-lg">
                                <Download className="w-4 h-4" /> Export Assets
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-border bg-card shadow-2xl">
                            <DropdownMenuItem onClick={() => handleExport("csv")} className="rounded-xl flex items-center gap-3 p-3 cursor-pointer">
                                <FileText className="w-4 h-4 text-orange-500" />
                                <div className="flex flex-col"><span className="text-xs font-black">CSV Format</span><span className="text-[9px] text-muted-foreground">Universal Compatibility</span></div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport("excel")} className="rounded-xl flex items-center gap-3 p-3 cursor-pointer">
                                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                                <div className="flex flex-col"><span className="text-xs font-black">Excel Sheet</span><span className="text-[9px] text-muted-foreground">Data Analysis Ready</span></div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport("json")} className="rounded-xl flex items-center gap-3 p-3 cursor-pointer">
                                <Monitor className="w-4 h-4 text-indigo-500" />
                                <div className="flex flex-col"><span className="text-xs font-black">JSON Object</span><span className="text-[9px] text-muted-foreground">Developer Raw Data</span></div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Quick Presets */}
            {searchSource === "google" && (
                <div className="flex flex-wrap gap-2 animate-in slide-in-from-left duration-500 mt-4">
                    {INDUSTRY_PRESETS.map((p) => (
                        <button
                            type="button"
                            key={p.name}
                            onClick={(e) => {
                                setKeyword(p.keyword);
                                handleSearch(undefined, p.keyword);
                            }}
                            className="px-4 py-2 bg-muted/30 border border-border rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all active:scale-95"
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Main Search Input Group */}
            <form id="search-form" onSubmit={handleSearch} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-card border border-border rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                        <input
                            type="text"
                            placeholder="Industry (e.g. Lawyers)"
                            className="w-full bg-muted/40 border border-border text-foreground rounded-2xl pl-12 pr-4 py-4 hover:border-indigo-500/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-muted-foreground/40 font-bold"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            required
                        />
                        <div className="absolute -top-2 left-4 bg-background px-2 text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest">Industry Keyword</div>
                    </div>

                    <div className={`relative ${isWorldwide ? 'opacity-40 cursor-not-allowed' : ''}`}>
                        <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                        <select
                            className={`w-full bg-muted/40 border border-border text-foreground rounded-2xl pl-12 pr-10 py-4 hover:border-indigo-500/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer font-bold ${isWorldwide ? 'cursor-not-allowed' : ''}`}
                            value={countryCode}
                            onChange={(e) => {
                                setCountryCode(e.target.value);
                                setCity(""); // Reset city when country changes
                            }}
                            disabled={isWorldwide}
                        >
                            {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                        <div className="absolute -top-2 left-4 bg-background px-2 text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest">Region</div>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    </div>

                    <div className={`relative ${isWorldwide ? 'opacity-40 cursor-not-allowed' : ''}`}>
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                        <input
                            list="city-options"
                            type="text"
                            placeholder={isFetchingCities ? "Loading cities..." : "All Cities (Optional)"}
                            className={`w-full bg-muted/40 border border-border text-foreground rounded-2xl pl-12 pr-10 py-4 hover:border-indigo-500/30 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-foreground/70 font-bold ${isWorldwide ? 'cursor-not-allowed' : ''}`}
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            disabled={isWorldwide || isFetchingCities}
                        />
                        <datalist id="city-options">
                            {availableCities.map((cityName, idx) => (
                                <option key={`${cityName}-${idx}`} value={cityName} />
                            ))}
                        </datalist>
                        <div className="absolute -top-2 left-4 bg-background px-2 text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest">Target Location</div>
                        {isFetchingCities ? (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 animate-spin" />
                        ) : (
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`relative group/btn overflow-hidden px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all shadow-2xl active:scale-95 disabled:opacity-50 bg-indigo-600 shadow-indigo-500/25`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] transition-transform" />
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-3">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Processing...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-3">
                                <Search className="h-4 w-4" />
                                <span>Initialize extraction</span>
                            </div>
                        )}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="flex items-center gap-2 text-xs font-black text-muted-foreground hover:text-indigo-400 transition-all uppercase tracking-widest group"
                        >
                            <div className={`p-2 rounded-lg bg-muted group-hover:bg-indigo-500/10 transition-colors ${showAdvancedFilters ? 'bg-indigo-500 text-white' : ''}`}>
                                <Filter className="w-3.5 h-3.5" />
                            </div>
                            Advanced Filters
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-500 ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                        </button>
                        {showAdvancedFilters && (
                            <button
                                type="button"
                                onClick={() => {
                                    setMinRating(0);
                                    setMinReviews(0);
                                    setMaxDistance(50);
                                    setOnlyOpenNow(false);
                                    setHasPhone(false);
                                    setHasEmail(false);
                                    setHasWebsite(false);
                                    // ensure any other text filters are clean if desired
                                }}
                                className="text-[10px] font-black text-muted-foreground hover:text-red-400 transition-colors uppercase tracking-widest underline decoration-dashed"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col justify-center gap-1 group">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isWorldwide}
                                        onChange={(e) => setIsWorldwide(e.target.checked)}
                                    />
                                    <div className="w-10 h-5 bg-muted rounded-full peer peer-checked:bg-indigo-600 transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
                                </div>
                                <div className="flex flex-col"><span className="text-[10px] font-black text-foreground uppercase tracking-tighter flex items-center gap-1">Worldwide Extraction <Shield className={`w-3 h-3 ${isWorldwide ? 'text-indigo-500' : 'text-muted-foreground/30'}`} /></span></div>
                            </label>
                        </div>

                        <div className="relative w-24">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                            <input
                                type="number"
                                min="1"
                                max="1000"
                                className="w-full bg-muted/40 border border-border text-foreground rounded-xl pl-8 pr-2 py-2 text-xs font-bold outline-none focus:border-indigo-500 transition-all"
                                value={requestedLimit}
                                onChange={(e) => setRequestedLimit(parseInt(e.target.value) || 10)}
                            />
                        </div>
                    </div>
                </div>

                {showAdvancedFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-muted/20 border border-border rounded-[2rem] animate-in slide-in-from-top-4 duration-500">
                        {searchSource === "google" ? (
                            <>
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex justify-between">Min. Rating <span>{minRating}★</span></label>
                                    <input type="range" min="0" max="5" step="0.5" value={minRating} onChange={(e) => setMinRating(parseFloat(e.target.value))} className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex justify-between">Min. Reviews <span>{minReviews}+</span></label>
                                    <input type="number" min="0" value={minReviews} onChange={(e) => setMinReviews(parseInt(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-indigo-500" />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex justify-between">Proximity (km) <span>{maxDistance}km</span></label>
                                    <input type="range" min="1" max="100" value={maxDistance} onChange={(e) => setMaxDistance(parseInt(e.target.value))} className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">Requirements</label>
                                    <div className="flex flex-col gap-3">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${hasPhone ? 'bg-indigo-600 border-indigo-600 ' : 'bg-background border-border group-hover:border-indigo-500'}`}>
                                                {hasPhone && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white"><path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                            </div>
                                            <input type="checkbox" checked={hasPhone} onChange={(e) => setHasPhone(e.target.checked)} className="sr-only" />
                                            <span className="text-xs font-bold text-foreground">Has Phone</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${hasEmail ? 'bg-indigo-600 border-indigo-600 ' : 'bg-background border-border group-hover:border-indigo-500'}`}>
                                                {hasEmail && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white"><path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                            </div>
                                            <input type="checkbox" checked={hasEmail} onChange={(e) => setHasEmail(e.target.checked)} className="sr-only" />
                                            <span className="text-xs font-bold text-foreground">Has Email</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${hasWebsite ? 'bg-indigo-600 border-indigo-600 ' : 'bg-background border-border group-hover:border-indigo-500'}`}>
                                                {hasWebsite && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white"><path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                            </div>
                                            <input type="checkbox" checked={hasWebsite} onChange={(e) => setHasWebsite(e.target.checked)} className="sr-only" />
                                            <span className="text-xs font-bold text-foreground">Has Website</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => setOnlyOpenNow(!onlyOpenNow)}
                                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${onlyOpenNow ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}
                                    >
                                        <Clock className="w-3.5 h-3.5" /> {onlyOpenNow ? 'Status: Open' : 'Status: Any'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Company Name</label>
                                    <input type="text" value={liCompany} onChange={(e) => setLiCompany(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-blue-500" placeholder="e.g. OpenAI" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Professional Title</label>
                                    <input type="text" value={liTitle} onChange={(e) => setLiTitle(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-blue-500" placeholder="e.g. Architect" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Industrial Sector</label>
                                    <input type="text" value={liIndustry} onChange={(e) => setLiIndustry(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-blue-500" placeholder="e.g. FinTech" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Academic Institution</label>
                                    <input type="text" value={liSchool} onChange={(e) => setLiSchool(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-blue-500" placeholder="e.g. MIT" />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </form>
            <div className="bg-card/40 border-x border-b border-border rounded-b-[2.5rem] overflow-hidden backdrop-blur-xl -mt-8 pt-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 gap-4 border-b border-border bg-muted/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full sm:w-auto">
                        <div className="flex flex-col">
                            <h3 className="font-black text-foreground text-xl uppercase tracking-tight">Leads Found</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <span className={`h-2 w-2 rounded-full ${leads.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`} />
                                {leads.length} Records Retrieved
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                                <input
                                    type="text"
                                    placeholder="Filter Keywords..."
                                    className="bg-muted/40 border border-border text-xs text-foreground rounded-xl pl-9 pr-4 py-2.5 focus:border-indigo-500 outline-none w-full sm:w-56 transition-all font-bold"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                                <select
                                    className="bg-muted/40 border border-border text-[9px] text-foreground rounded-xl pl-9 pr-8 py-2.5 focus:border-indigo-500 outline-none appearance-none cursor-pointer font-black uppercase tracking-widest"
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
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/50 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {selectedLeads.size > 0 && (
                            <>
                                <div className="px-4 py-2 bg-indigo-600/10 border border-indigo-600/20 rounded-xl hidden sm:block">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{selectedLeads.size} Selected</span>
                                </div>
                                <button
                                    onClick={handleBulkBookmark}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 border border-emerald-600/20 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                                >
                                    <Bookmark className="w-3.5 h-3.5" /> Save Selected
                                </button>
                            </>
                        )}
                        <button
                            onClick={toggleSelectAll}
                            className="p-2.5 rounded-xl border border-border bg-muted/40 hover:border-indigo-500/50 transition-all active:scale-90"
                            title="Select/Deselect Current Page"
                        >
                            {paginatedLeads.every((l: any) => selectedLeads.has(l.id)) && paginatedLeads.length > 0 ? <CheckSquare className="w-5 h-5 text-indigo-500" /> : <Square className="w-5 h-5 opacity-30" />}
                        </button>
                    </div>
                </div>

                {debugLogs.length > 0 && (
                    <div className="mx-6 mb-6 p-4 bg-black/90 text-green-400 font-mono text-[10px] rounded-xl overflow-y-auto max-h-[300px] border border-green-500/30 whitespace-pre-wrap">
                        <div className="font-bold text-white mb-2 pb-2 border-b border-white/20">DEBUG LOGS (DEVELOPMENT ONLY):</div>
                        {debugLogs.join('\n')}
                    </div>
                )}

                <div className="min-h-[500px] relative">
                    {viewMode === "table" ? (
                        <div className="overflow-x-auto pb-10">
                            {/* Desktop Table View */}
                            <table className="w-full text-sm text-left min-w-[1100px] border-collapse hidden md:table">
                                <thead className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em] bg-muted/10 border-b border-border/40 select-none">
                                    <tr>
                                        <th className="px-8 py-5 w-20 text-center">Sel</th>
                                        <th className="px-6 py-5 cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => toggleSort('name')}>
                                            <div className="flex items-center gap-2">Company Name {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                                        </th>
                                        <th className="px-6 py-5 cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => toggleSort('address')}>
                                            <div className="flex items-center gap-2">Location {sortConfig?.key === 'address' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                                        </th>
                                        <th className="px-6 py-5">Contact Info</th>
                                        <th className="px-6 py-5 cursor-pointer hover:text-indigo-400 transition-colors" title="Lead Quality Score based on completeness" onClick={() => toggleSort('rating')}>
                                            <div className="flex items-center gap-2">Quality Score ℹ️ {sortConfig?.key === 'rating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                                        </th>
                                        <th className="px-6 py-5 text-right pr-10">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {isLoading ? (
                                        Array(itemsPerPage).fill(0).map((_, idx) => (
                                            <tr key={idx} className="bg-muted/5 animate-pulse">
                                                <td className="px-8 py-8"><div className="h-5 w-5 bg-muted rounded mx-auto" /></td>
                                                <td className="px-6 py-8"><div className="space-y-3"><div className="h-4 bg-muted rounded w-48" /><div className="h-2.5 bg-muted/40 rounded w-32" /></div></td>
                                                <td className="px-6 py-8"><div className="h-3 bg-muted rounded w-3/4" /></td>
                                                <td className="px-6 py-8"><div className="h-4 bg-muted rounded w-32" /></td>
                                                <td className="px-6 py-8"><div className="h-7 bg-muted rounded-full w-16" /></td>
                                                <td className="px-6 py-8 text-right pr-10"><div className="h-10 w-10 bg-muted rounded-xl ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : (
                                        (() => {
                                            const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

                                            if (paginatedLeads.length === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-32 text-center">
                                                            <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                                                                <Target className="h-12 w-12" />
                                                                <p className="text-sm font-black uppercase tracking-widest">No matching assets found in local buffer</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            return (
                                                <>
                                                    {paginatedLeads.map((lead: any) => (
                                                        <tr key={lead.id} className={`hover:bg-indigo-500/[0.02] transition-colors group/row ${selectedLeads.has(lead.id) ? 'bg-indigo-500/[0.05]' : ''}`}>
                                                            <td className="px-8 py-6 text-center">
                                                                <button onClick={() => toggleSelect(lead.id)} className="transition-transform active:scale-75">
                                                                    {selectedLeads.has(lead.id) ? <CheckSquare className="h-5 w-5 text-indigo-500" /> : <Square className="h-5 w-5 opacity-20 group-hover/row:opacity-100" />}
                                                                </button>
                                                            </td>
                                                            <td className="px-6 py-6 cursor-pointer" onClick={() => { setSelectedDetailLead(lead); setIsDetailModalOpen(true); }}>
                                                                <div className="font-black text-foreground mb-1 group-hover/row:text-indigo-600 transition-colors uppercase tracking-tight text-base">{lead.name}</div>
                                                                {lead.website && (
                                                                    <a href={lead.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-indigo-500 transition-all" onClick={(e) => e.stopPropagation()}>
                                                                        <Globe className="h-3 w-3" /> External Source
                                                                        {websiteStatuses[lead.id] === 'checking' && <Loader2 className="h-2 w-2 animate-spin ml-1 opacity-50" />}
                                                                        {websiteStatuses[lead.id] === 'active' && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 ml-1 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Website Active" />}
                                                                        {websiteStatuses[lead.id] === 'inactive' && <div className="h-1.5 w-1.5 rounded-full bg-red-500 ml-1 opacity-50" title="Website Unreachable" />}
                                                                    </a>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-6 text-muted-foreground text-xs font-bold max-w-[300px] truncate" onClick={() => { setSelectedDetailLead(lead); setIsDetailModalOpen(true); }}>{lead.address || "Address not provided"}</td>
                                                            <td className="px-6 py-6">
                                                                {lead.phone ? (
                                                                    <div className="flex flex-col gap-2">
                                                                        <div className="flex items-center gap-2 text-foreground font-black text-xs"><Phone className="h-3.5 w-3.5 text-indigo-500" /> {lead.phone}</div>
                                                                        <div className="flex items-center gap-2">
                                                                            <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all">Reach</a>
                                                                            {lead.email && (
                                                                                <a href={`mailto:${lead.email}`} className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all">Email</a>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ) : <span className="text-[10px] font-black opacity-20 uppercase tracking-widest">No phone available</span>}
                                                            </td>
                                                            <td className="px-6 py-6">
                                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 w-fit">
                                                                    <Star className={`h-3.5 w-3.5 ${lead.rating > 0 ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />
                                                                    <span className="text-foreground font-black text-xs">{lead.rating || "N/A"}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-6 text-right pr-10">
                                                                <button
                                                                    onClick={() => handleBookmark(lead)}
                                                                    disabled={isSavingLead === lead.name}
                                                                    className={`p-3 rounded-2xl border transition-all active:scale-90 ${bookmarkedNames.has(lead.name) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-muted/50 border-border text-muted-foreground hover:bg-white hover:border-indigo-500 hover:text-indigo-600 shadow-xl'}`}
                                                                >
                                                                    {isSavingLead === lead.name ? <Loader2 className="h-5 w-5 animate-spin" /> : bookmarkedNames.has(lead.name) ? <CheckCircle2 className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {/* Pagination Row */}
                                                    {totalPages > 1 && (
                                                        <tr>
                                                            <td colSpan={6} className="px-8 py-6 bg-muted/10 border-t border-border/50">
                                                                <div className="flex items-center justify-between font-black text-[9px] uppercase tracking-[0.2em]">
                                                                    <p className="text-muted-foreground opacity-60">Page {currentPage} of {totalPages}</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-muted border border-border rounded-xl hover:bg-indigo-600 hover:border-indigo-600 hover:text-white transition-all disabled:opacity-30">Previous</button>
                                                                        <div className="flex items-center gap-1">
                                                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                                                let pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                                                                                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                                                                                if (pageNum < 1) pageNum = i + 1;
                                                                                if (pageNum > totalPages) return null;
                                                                                return (
                                                                                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`h-9 w-9 rounded-xl transition-all ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'bg-muted border border-border text-muted-foreground hover:bg-card'}`}>
                                                                                        {pageNum}
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-muted border border-border rounded-xl hover:bg-indigo-600 hover:border-indigo-600 hover:text-white transition-all disabled:opacity-30">Next</button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        })()
                                    )}
                                </tbody>
                            </table>
                            {/* Mobile Card Layout */}
                            <div className="md:hidden grid grid-cols-1 gap-6 p-6">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, idx) => (
                                        <div key={idx} className="p-6 rounded-3xl border border-border/50 bg-muted/10 animate-pulse space-y-4 shadow-inner">
                                            <div className="h-5 bg-muted rounded w-3/4" />
                                            <div className="h-3 bg-muted rounded w-full opacity-50" />
                                            <div className="flex gap-2 pt-4"><div className="h-10 grow bg-muted rounded-xl" /><div className="h-10 w-12 bg-muted rounded-xl" /></div>
                                        </div>
                                    ))
                                ) : (
                                    (() => {
                                        return paginatedLeads.map((lead: any) => (
                                            <div key={lead.id} className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-500 bg-card shadow-2xl ${selectedLeads.has(lead.id) ? 'border-indigo-600 ring-4 ring-indigo-600/10 scale-[1.02]' : 'border-border/50 hover:border-indigo-500/30'}`}>
                                                <div className="absolute top-0 right-0 p-5">
                                                    <button onClick={() => toggleSelect(lead.id)} className="p-2 transition-transform active:scale-75">
                                                        {selectedLeads.has(lead.id) ? <CheckSquare className="h-7 w-7 text-indigo-600" /> : <Square className="h-7 w-7 opacity-20" />}
                                                    </button>
                                                </div>

                                                <div className="space-y-5" onClick={() => { setSelectedDetailLead(lead); setIsDetailModalOpen(true); }}>
                                                    <div className="pr-12">
                                                        <h4 className="font-black text-xl text-foreground uppercase tracking-tight leading-tight mb-2">{lead.name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                                                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                                                <span className="text-[11px] font-black">{lead.rating || "N/A"}</span>
                                                            </div>
                                                            {lead.website && (
                                                                <div className={`h-1.5 w-1.5 rounded-full ${websiteStatuses[lead.id] === 'active' ? 'bg-emerald-500' : websiteStatuses[lead.id] === 'inactive' ? 'bg-red-500' : 'bg-muted animate-pulse'}`} />
                                                            )}
                                                            <span className="text-[10px] text-muted-foreground font-black uppercase opacity-60">Scanned {new Date().toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-4 bg-muted/30 p-4 rounded-2xl border border-border/40">
                                                        <MapPin className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                                                        <p className="text-[11px] text-muted-foreground font-bold leading-relaxed line-clamp-2">{lead.address || "Address not provided"}</p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        {lead.phone ? (
                                                            <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95">
                                                                <Phone className="h-3.5 w-3.5" /> Direct Call
                                                            </a>
                                                        ) : <div className="py-4 bg-muted/20 border border-border/50 rounded-2xl flex items-center justify-center text-[10px] font-black opacity-30 uppercase">No Phone</div>}

                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleBookmark(lead); }}
                                                            disabled={isSavingLead === lead.name}
                                                            className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${bookmarkedNames.has(lead.name) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-muted border-border hover:bg-white active:scale-95'}`}
                                                        >
                                                            {isSavingLead === lead.name ? <Loader2 className="h-4 w-4 animate-spin" /> : bookmarkedNames.has(lead.name) ? <CheckCircle2 className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                                                            {bookmarkedNames.has(lead.name) ? 'Saved' : 'Secure'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ));
                                    })()
                                )}

                                {/* Mobile Pagination */}
                                {(() => {
                                    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
                                    if (totalPages <= 1) return null;

                                    return (
                                        <div className="flex items-center justify-center gap-4 py-8 border-t border-border/20">
                                            <button
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(p => p - 1)}
                                                className="px-6 py-3 bg-muted rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-20 transition-all active:scale-95"
                                            >
                                                Back
                                            </button>
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Matrix Page {currentPage} of {totalPages}</span>
                                            <button
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(p => p + 1)}
                                                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 disabled:opacity-20 transition-all active:scale-95"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 h-[600px] border-t border-border animate-in slide-in-from-bottom duration-700">
                            <Map leads={filteredLeads} />
                        </div>
                    )}
                </div>
            </div>
            <UpgradeModal
                open={showUpgradeModal}
                onOpenChange={setShowUpgradeModal}
            />

            <LeadDetailModal
                lead={selectedDetailLead}
                open={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen}
                onBookmark={handleBookmark}
                isBookmarked={selectedDetailLead && bookmarkedNames.has(selectedDetailLead.name)}
                websiteStatus={selectedDetailLead ? websiteStatuses[selectedDetailLead.id] : 'unknown'}
            />
        </div>
    );
}

