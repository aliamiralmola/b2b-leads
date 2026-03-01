'use client';

import * as React from 'react';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    Home, Search, Database, Settings, LogOut, Bell,
    UserCircle, Users, Share2, CreditCard, Menu, X,
    Bookmark, ChevronRight
} from "lucide-react";
import { signOut } from "@/app/login/actions";
import { ThemeToggle } from "./theme-toggle";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const routes = [
        { name: "Overview", href: "/dashboard", icon: Home },
        { name: "Find Leads", href: "/dashboard/search", icon: Search },
        { name: "Search History", href: "/dashboard/history", icon: Database },
        { name: "Bookmarks", href: "/dashboard/bookmarks", icon: Bookmark },
        { name: "Team", href: "/dashboard/team", icon: Users },
        { name: "Affiliates", href: "/dashboard/affiliates", icon: Share2 },
        { name: "Billing & Crypto", href: "/dashboard/billing", icon: CreditCard },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <>
            <aside className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="b2bleads logo" width={28} height={28} className="object-contain" />
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            b2bleads
                        </span>
                    </Link>
                    <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                    {routes.map((route) => {
                        const isActive = pathname === route.href;
                        return (
                            <Link
                                key={route.name}
                                href={route.href}
                                onClick={onClose}
                                title={route.name}
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

                <div className="p-4 border-t border-white/5 space-y-4">
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 w-full transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Log Out
                    </button>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 px-3 text-[10px] font-medium text-gray-600 uppercase tracking-widest leading-none">
                        <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
                        <Link href="/refund" className="hover:text-gray-400 transition-colors">Refund</Link>
                    </div>

                    <div className="px-3 text-[9px] text-gray-700 leading-tight">
                        &copy; {new Date().getFullYear()} b2bleads.ai<br />
                        Reg No: 12345678-A
                    </div>
                </div>
            </aside>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}
        </>
    );
}

interface HeaderProps {
    onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: HeaderProps) {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    return (
        <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2 text-sm">
                    <Home className="h-4 w-4 text-gray-500" />
                    {segments.map((segment, index) => {
                        const href = `/${segments.slice(0, index + 1).join('/')}`;
                        const isLast = index === segments.length - 1;
                        return (
                            <React.Fragment key={href}>
                                <ChevronRight className="h-3 w-3 text-gray-600" />
                                <Link
                                    href={href}
                                    className={`capitalize ${isLast ? 'text-white font-bold' : 'text-gray-500 hover:text-gray-300 transition-colors'}`}
                                >
                                    {segment.replace(/-/g, ' ')}
                                </Link>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <button className="text-gray-400 hover:text-white transition-colors relative" title="Notifications">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors" title="Profile">
                    <UserCircle className="h-8 w-8 text-gray-400" />
                </button>
            </div>
        </header>
    );
}

