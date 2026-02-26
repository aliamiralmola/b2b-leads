"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Download, Info } from "lucide-react";

interface Lead {
    name: string;
    phone: string;
    address: string;
    website: string;
    rating?: number;
    ai_insight?: string;
}

interface HistoryItem {
    id: string;
    created_at: string;
    keyword: string;
    location: string;
    results_count: number;
    results_data: Lead[];
}

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVerified, setIsVerified] = useState<boolean | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchHistory = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }
            if (!user.email_confirmed_at) {
                setIsVerified(false);
                setLoading(false);
                return;
            }
            setIsVerified(true);

            const { data, error } = await supabase
                .from('search_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching history:", error);
            } else {
                setHistory(data || []);
            }
            setLoading(false);
        };

        fetchHistory();
    }, []);

    const handleViewResults = (leads: Lead[]) => {
        setSelectedLeads(leads);
        setIsModalOpen(true);
    };

    const exportToCSV = (leads: Lead[]) => {
        if (!leads || leads.length === 0) return;

        const headers = ["Name", "Phone", "Address", "Website", "Rating", "AI Insight"];
        const rows = leads.map(lead => [
            `"${(lead.name || "").replace(/"/g, '""')}"`,
            `"${(lead.phone || "").replace(/"/g, '""')}"`,
            `"${(lead.address || "").replace(/"/g, '""')}"`,
            `"${(lead.website || "").replace(/"/g, '""')}"`,
            `"${lead.rating || 0}"`,
            `"${(lead.ai_insight || "N/A").replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `leads_export_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (isVerified === false) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="bg-orange-500/10 p-4 rounded-full mb-4">
                    <Info className="h-10 w-10 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Verification Required</h2>
                <p className="text-gray-400 max-w-md">
                    Please verify your email address to view your search history.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Search History</h2>
                    <p className="text-gray-400">
                        A record of all your past lead searches.
                    </p>
                </div>
            </div>

            <Card className="bg-[#0a0a0a] border-white/5 shadow-xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-white">Recent Searches</CardTitle>
                    <CardDescription className="text-gray-400">View your search queries and results count.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent bg-white/[0.02]">
                                <TableHead className="text-gray-400 font-medium">Date</TableHead>
                                <TableHead className="text-gray-400 font-medium">Keyword</TableHead>
                                <TableHead className="text-gray-400 font-medium">Location</TableHead>
                                <TableHead className="text-gray-400 font-medium text-center">Leads Found</TableHead>
                                <TableHead className="text-gray-400 font-medium text-right pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length > 0 ? (
                                history.map((item) => (
                                    <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                        <TableCell className="font-medium text-gray-300 py-4">
                                            {new Date(item.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false
                                            })}
                                        </TableCell>
                                        <TableCell className="text-gray-300">{item.keyword}</TableCell>
                                        <TableCell className="text-gray-300">{item.location}</TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                {item.results_count} leads
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewResults(item.results_data || [])}
                                                className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all rounded-full px-4"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Results
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                                        No searches found yet. Start exploring!
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-[#0a0a0a] border-white/5 text-white shadow-2xl">
                    <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Info className="w-5 h-5 text-indigo-400" />
                                Extracted Leads
                            </DialogTitle>
                            <p className="text-sm text-gray-400">Showing {selectedLeads.length} leads from this search.</p>
                        </div>
                        <Button
                            onClick={() => exportToCSV(selectedLeads)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all mr-6"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto mt-4 rounded-xl border border-white/5 bg-black/40">
                        <Table>
                            <TableHeader className="bg-white/[0.02]">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-gray-400 font-medium">Business Name</TableHead>
                                    <TableHead className="text-gray-400 font-medium">Phone</TableHead>
                                    <TableHead className="text-gray-400 font-medium">Location</TableHead>
                                    <TableHead className="text-gray-400 font-medium">Website</TableHead>
                                    <TableHead className="text-gray-400 font-medium">AI Insight</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedLeads.length > 0 ? (
                                    selectedLeads.map((lead, idx) => (
                                        <TableRow key={idx} className="border-white/5 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-semibold text-white py-4">{lead.name}</TableCell>
                                            <TableCell className="text-gray-300">{lead.phone || "N/A"}</TableCell>
                                            <TableCell className="text-gray-300 text-sm max-w-[200px] truncate">{lead.address || "N/A"}</TableCell>
                                            <TableCell className="text-indigo-400">
                                                {lead.website ? (
                                                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                                        Visit <Eye className="w-3 h-3" />
                                                    </a>
                                                ) : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-gray-400 text-xs italic max-w-[250px] leading-relaxed">
                                                {lead.ai_insight || "No insight available"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center text-gray-500">
                                            No data available for this search.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
