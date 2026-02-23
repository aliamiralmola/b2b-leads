'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Home, Database, CreditCard, Settings, LogOut, Bell, UserCircle } from "lucide-react";
import { signOut } from "@/app/login/actions";

export function Sidebar() {
    const pathname = usePathname();
    const routes = [
        { name: "Search Leads", href: "/dashboard", icon: Home },
        { name: "Saved Leads", href: "/dashboard/saved", icon: Database },
        { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col z-40">
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md p-1 shadow-lg shadow-indigo-500/25">
                        <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Nexus B2B
                    </span>
                </Link>
            </div>

            <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                {routes.map((route) => {
                    const isActive = pathname === route.href;
                    return (
                        <Link
                            key={route.name}
                            href={route.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? "bg-indigo-500/10 text-indigo-400"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <route.icon className="h-4 w-4" />
                            {route.name}
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 w-full transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Log Out
                </button>
            </div>
        </aside>
    );
}

export function DashboardHeader() {
    return (
        <header className="h-16 bg-[#030712]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-30">
            <h1 className="text-lg font-semibold text-white">Dashboard</h1>
            <div className="flex items-center gap-4">
                <button className="text-gray-400 hover:text-white transition-colors relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                    <UserCircle className="h-8 w-8 text-gray-400" />
                </button>
            </div>
        </header>
    );
}
