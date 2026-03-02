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
import { Eye, Download, Info, Trash2, Coins, ChevronLeft, ChevronRight } from "lucide-react";
import { deleteSearchHistory } from "../../actions/searchLeads";
import { ConfirmModal } from "@/components/ConfirmModal";
import { toast } from "sonner";

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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
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
    }, [supabase]);

    const handleViewResults = (leads: Lead[]) => {
        setSelectedLeads(leads);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        try {
            await deleteSearchHistory(itemToDelete);
            setHistory(prev => prev.filter(item => item.id !== itemToDelete));
            toast.success("Search history item deleted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete history item");
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
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
                <h2 className="text-2xl font-bold text-foreground">Verification Required</h2>
                <p className="text-muted-foreground max-w-md">
                    Please verify your email address to view your search history.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Search History</h2>
                    <p className="text-muted-foreground">
                        A record of all your past lead searches.
                    </p>
                </div>
            </div>

            <Card className="bg-card border-border shadow-xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-foreground">Recent Searches</CardTitle>
                    <CardDescription className="text-muted-foreground">View your search queries and results count.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent bg-muted/50">
                                <TableHead className="text-muted-foreground font-medium">Date</TableHead>
                                <TableHead className="text-muted-foreground font-medium">Keyword</TableHead>
                                <TableHead className="text-muted-foreground font-medium text-center">Location</TableHead>
                                <TableHead className="text-muted-foreground font-medium text-center">Credits Used</TableHead>
                                <TableHead className="text-muted-foreground font-medium text-right pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length > 0 ? (
                                (() => {
                                    const totalPages = Math.ceil(history.length / itemsPerPage);
                                    const paginatedHistory = history.slice(
                                        (currentPage - 1) * itemsPerPage,
                                        currentPage * itemsPerPage
                                    );

                                    return (
                                        <>
                                            {paginatedHistory.map((item) => (
                                                <TableRow key={item.id} className="border-border hover:bg-muted transition-colors group">
                                                    <TableCell className="font-medium text-foreground/80 py-4">
                                                        {new Date(item.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: false
                                                        })}
                                                    </TableCell>
                                                    <TableCell className="text-foreground/80 font-bold">{item.keyword}</TableCell>
                                                    <TableCell className="text-center text-foreground/80">{item.location}</TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                -{item.results_count} Credits
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{item.results_count} Leads</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewResults(item.results_data || [])}
                                                                className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all rounded-full px-4"
                                                            >
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setItemToDelete(item.id);
                                                                    setIsDeleteModalOpen(true);
                                                                }}
                                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all rounded-full px-4"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}

                                            {history.length > itemsPerPage && (
                                                <TableRow className="hover:bg-transparent border-t border-border">
                                                    <TableCell colSpan={5} className="py-4 px-6">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                                                                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(history.length, currentPage * itemsPerPage)} of {history.length} searches
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={currentPage === 1}
                                                                    onClick={() => setCurrentPage(p => p - 1)}
                                                                    className="h-8 border-border bg-card hover:bg-muted text-xs font-bold px-3 transition-all"
                                                                >
                                                                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                                                </Button>
                                                                <div className="flex items-center gap-1">
                                                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                                        let pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                                                                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                                                                        if (pageNum < 1) pageNum = i + 1;
                                                                        if (pageNum > totalPages) return null;

                                                                        return (
                                                                            <button
                                                                                key={pageNum}
                                                                                onClick={() => setCurrentPage(pageNum)}
                                                                                className={`h-8 w-8 rounded-lg font-bold text-xs transition-all ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'border border-border bg-card text-muted-foreground hover:bg-muted font-outfit'}`}
                                                                            >
                                                                                {pageNum}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={currentPage === totalPages}
                                                                    onClick={() => setCurrentPage(p => p + 1)}
                                                                    className="h-8 border-border bg-card hover:bg-muted text-xs font-bold px-3 transition-all"
                                                                >
                                                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    );
                                })()
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        No searches found yet. Start exploring!
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-card border-border text-foreground shadow-2xl">
                    <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Info className="w-5 h-5 text-indigo-400" />
                                Extracted Leads
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground">Showing {selectedLeads.length} leads from this search.</p>
                        </div>
                        <Button
                            onClick={() => exportToCSV(selectedLeads)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all mr-6"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto mt-4 rounded-xl border border-border bg-card/40">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-muted-foreground font-medium">Business Name</TableHead>
                                    <TableHead className="text-muted-foreground font-medium">Phone</TableHead>
                                    <TableHead className="text-muted-foreground font-medium">Location</TableHead>
                                    <TableHead className="text-muted-foreground font-medium">Website</TableHead>
                                    <TableHead className="text-muted-foreground font-medium">AI Insight</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedLeads.length > 0 ? (
                                    selectedLeads.map((lead, idx) => (
                                        <TableRow key={idx} className="border-border hover:bg-muted transition-colors">
                                            <TableCell className="font-semibold text-foreground py-4">{lead.name}</TableCell>
                                            <TableCell className="text-foreground/80">{lead.phone || "N/A"}</TableCell>
                                            <TableCell className="text-foreground/80 text-sm max-w-[200px] truncate">{lead.address || "N/A"}</TableCell>
                                            <TableCell className="text-indigo-400">
                                                {lead.website ? (
                                                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                                        Visit <Eye className="w-3 h-3" />
                                                    </a>
                                                ) : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs italic max-w-[250px] leading-relaxed">
                                                {lead.ai_insight || "No insight available"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                            No data available for this search.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                open={isDeleteModalOpen}
                onOpenChange={(open) => {
                    setIsDeleteModalOpen(open);
                    if (!open) setItemToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Delete Search History"
                description="Are you sure you want to delete this search history item? This action cannot be undone and the extracted leads for this search will be removed from your history."
                confirmText={isDeleting ? "Deleting..." : "Delete History"}
                variant="destructive"
            />
        </div>
    );
}
