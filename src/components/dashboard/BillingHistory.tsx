"use client";

import { useState } from "react";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";

interface Invoice {
    id: string;
    date: string;
    amount: string;
    status: string;
}

type SortKey = "id" | "date" | "amount" | "status";
type SortDir = "asc" | "desc";

export function BillingHistory({ invoices }: { invoices: Invoice[] }) {
    const [sortKey, setSortKey] = useState<SortKey>("date");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [statusFilter, setStatusFilter] = useState("All");

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const sorted = [...invoices]
        .filter(inv => statusFilter === "All" || inv.status === statusFilter)
        .sort((a, b) => {
            let va = a[sortKey];
            let vb = b[sortKey];
            if (sortKey === "amount") {
                va = va.replace(/[^0-9.]/g, "");
                vb = vb.replace(/[^0-9.]/g, "");
                return sortDir === "asc" ? parseFloat(va) - parseFloat(vb) : parseFloat(vb) - parseFloat(va);
            }
            return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
        });

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
        return sortDir === "asc"
            ? <ArrowUp className="w-3 h-3 ml-1 text-indigo-400" />
            : <ArrowDown className="w-3 h-3 ml-1 text-indigo-400" />;
    };

    const handleExportCSV = () => {
        const headers = ["Invoice ID", "Date", "Amount", "Status"];
        const rows = sorted.map(inv => [inv.id, inv.date, inv.amount, inv.status]);
        const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "billing_history.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4 border-b border-white/5 bg-white/[0.01]">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    Billing History
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">({sorted.length})</span>
                </h3>
                <div className="flex items-center gap-3">
                    <select
                        className="bg-white/5 border border-white/10 text-[10px] text-white rounded-xl px-3 py-2 outline-none appearance-none cursor-pointer font-bold uppercase tracking-widest"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option>All</option>
                        <option>Paid</option>
                        <option>Pending</option>
                        <option>Failed</option>
                    </select>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all border border-indigo-600/20"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-white/[0.01]">
                        <TableRow className="border-white/5">
                            {([
                                ["id", "Invoice ID"],
                                ["date", "Date"],
                                ["amount", "Amount"],
                                ["status", "Status"],
                            ] as [SortKey, string][]).map(([key, label]) => (
                                <TableHead
                                    key={key}
                                    className="text-gray-400 font-bold uppercase tracking-widest text-[10px] py-4 cursor-pointer hover:text-white transition-colors select-none"
                                    onClick={() => handleSort(key)}
                                >
                                    <span className="flex items-center">
                                        {label}
                                        <SortIcon col={key} />
                                    </span>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sorted.length > 0 ? sorted.map((invoice) => (
                            <TableRow key={invoice.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell className="text-white font-bold">{invoice.id}</TableCell>
                                <TableCell className="text-gray-400 font-medium">{invoice.date}</TableCell>
                                <TableCell className="text-gray-400 font-medium">{invoice.amount}</TableCell>
                                <TableCell>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${invoice.status === "Paid"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : invoice.status === "Failed"
                                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        }`}>
                                        {invoice.status}
                                    </span>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-gray-600">
                                    No transactions found yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
