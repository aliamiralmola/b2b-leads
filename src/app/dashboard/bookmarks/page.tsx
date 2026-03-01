"use client";

import { useState, useEffect } from "react";
import {
    Bookmark, Trash2, Download, Globe, Phone, Star, Search,
    Loader2, FileJson, FileText, ExternalLink, FileDown, MoreHorizontal
} from "lucide-react";
import { getBookmarks, deleteBookmark } from "../../actions/searchLeads";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BookmarkItem {
    id: string;
    created_at: string;
    business_name: string;
    lead_data: {
        name: string;
        address: string;
        phone: string;
        website: string;
        rating: number;
    };
}

export default function BookmarksPage() {
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getBookmarks();
                setBookmarks(data);
            } catch (error) {
                toast.error("Failed to load bookmarks.");
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this lead from your bookmarks?")) return;

        try {
            await deleteBookmark(id);
            setBookmarks(prev => prev.filter(b => b.id !== id));
            toast.success("Lead removed.");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const filteredBookmarks = bookmarks.filter(b =>
        b.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.lead_data.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleExportPDF = () => {
        if (filteredBookmarks.length === 0) {
            toast.info("No leads to export.");
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error("Failed to open print window. Please allow pop-ups.");
            return;
        }

        const content = `
            <html>
                <head>
                    <title>Bookmarked Leads - b2bleads</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #111; }
                        h1 { color: #4f46e5; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #eee; padding: 12px; text-align: left; font-size: 12px; }
                        th { background: #fafafa; font-weight: bold; }
                        .footer { margin-top: 30px; font-size: 10px; color: #888; text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>Saved Leads Report</h1>
                    <p>Generated on ${new Date().toLocaleDateString()} - b2bleads.ai</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Website</th>
                                <th>Rating</th>
                                <th>Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredBookmarks.map(item => `
                                <tr>
                                    <td><strong>${item.business_name}</strong></td>
                                    <td>${item.lead_data.phone || 'N/A'}</td>
                                    <td>${item.lead_data.website || 'N/A'}</td>
                                    <td>${item.lead_data.rating || 0}★</td>
                                    <td>${item.lead_data.address || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="footer">Confidential Lead Data - Property of User</div>
                </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
        toast.success("PDF export initiated. Please check the print dialog.");
    };

    const handleExport = (format: 'json' | 'csv' | 'pdf') => {
        if (filteredBookmarks.length === 0) {
            toast.info("No leads to export.");
            return;
        }

        if (format === 'pdf') {
            handleExportPDF();
            return;
        }

        const exportData = filteredBookmarks.map(b => ({
            name: b.business_name,
            phone: b.lead_data.phone,
            website: b.lead_data.website,
            rating: b.lead_data.rating,
            address: b.lead_data.address,
            saved_at: b.created_at
        }));

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `bookmarked_leads_${new Date().getTime()}.json`;
            link.click();
            toast.success("JSON export started.");
        } else if (format === 'csv') {
            const headers = ["Name", "Phone", "Address", "Website", "Rating", "Saved At"];
            const rows = exportData.map(lead => [
                `"${(lead.name || "").replace(/"/g, '""')}"`,
                `"${(lead.phone || "").replace(/"/g, '""')}"`,
                `"${(lead.address || "").replace(/"/g, '""')}"`,
                `"${(lead.website || "").replace(/"/g, '""')}"`,
                `"${lead.rating || "N/A"}"`,
                `"${new Date(lead.saved_at).toLocaleDateString()}"`
            ]);
            const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `bookmarked_leads_${new Date().getTime()}.csv`;
            link.click();
            toast.success("CSV export started.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white mb-1">Bookmarks</h2>
                    <p className="text-gray-400 text-sm">Manage and export your high-priority leads.</p>
                </div>
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-card border-border text-popover-foreground">
                            <DropdownMenuItem onClick={() => handleExport('json')} className="focus:bg-accent">
                                <FileJson className="mr-2 h-4 w-4" /> JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('csv')} className="focus:bg-accent">
                                <FileDown className="mr-2 h-4 w-4" /> CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('pdf')} className="focus:bg-accent text-primary">
                                <FileText className="mr-2 h-4 w-4" /> Export PDF
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Card className="bg-card border-border shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-white text-xl flex items-center gap-2">
                                <Bookmark className="w-5 h-5 text-indigo-400" />
                                Saved Prospects
                            </CardTitle>
                            <CardDescription>A collection of your verified and saved business leads.</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Filter saved leads..."
                                className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-foreground focus:border-primary outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                    ) : filteredBookmarks.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4">Business</th>
                                        <th className="px-6 py-4">Contact Detail</th>
                                        <th className="px-6 py-4">Rating</th>
                                        <th className="px-6 py-4">Saved At</th>
                                        <th className="px-6 py-4 text-right pr-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredBookmarks.map((item) => (
                                        <tr key={item.id} className="hover:bg-indigo-600/[0.02] transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors uppercase tracking-tight">{item.business_name}</div>
                                                <div className="text-xs text-gray-500 max-w-[200px] truncate">{item.lead_data.address}</div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col gap-1">
                                                    {item.lead_data.phone ? (
                                                        <div className="text-white font-medium flex items-center gap-2">
                                                            <Phone className="w-3 h-3 text-indigo-400" />
                                                            {item.lead_data.phone}
                                                        </div>
                                                    ) : <span className="text-gray-600 text-xs italic">No phone</span>}
                                                    {item.lead_data.website && (
                                                        <a href={item.lead_data.website} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 text-[10px] font-bold flex items-center gap-1 transition-colors">
                                                            <Globe className="w-3 h-3" /> WEBSITE <ExternalLink className="w-2 h-2" />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                    <span className="text-foreground font-black">{item.lead_data.rating}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-gray-500 text-xs">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-6 text-right pr-8">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive/80 transition-all rounded-xl"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-24 text-center">
                            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bookmark className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No bookmarks yet</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                Save high-quality leads from your search results to see them here for later export and analysis.
                            </p>
                            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white" asChild>
                                <a href="/dashboard/search">Start Searching</a>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
