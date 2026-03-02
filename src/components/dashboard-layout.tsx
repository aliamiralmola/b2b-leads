'use client';

import * as React from 'react';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    Home, Search, Database, Settings, LogOut, Bell,
    UserCircle, Users, Share2, CreditCard, Menu, X,
    Bookmark, ChevronRight, User, Key
} from "lucide-react";
import { signOut } from "@/app/login/actions";
import { Notifications } from "./dashboard/Notifications";
import { ThemeToggle } from "./theme-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
                <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="b2bleads logo" width={28} height={28} className="object-contain" />
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                            b2bleads
                        </span>
                    </Link>
                    <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
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
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                    }`}
                            >
                                <route.icon className="h-4 w-4" />
                                {route.name}
                            </Link>
                        )
                    })}
                </div>

                <div className="p-4 border-t border-border space-y-4">
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent w-full transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Log Out
                    </button>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
                        <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="/refund" className="hover:text-foreground transition-colors">Refund</Link>
                    </div>

                    <div className="px-3 text-[9px] text-muted-foreground/60 leading-tight">
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
                    className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2 text-sm">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    {segments.map((segment, index) => {
                        const href = `/${segments.slice(0, index + 1).join('/')}`;
                        const isLast = index === segments.length - 1;
                        return (
                            <React.Fragment key={href}>
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                <Link
                                    href={href}
                                    className={`capitalize ${isLast ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground transition-colors'}`}
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
                <Notifications />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-all" title="Profile">
                            <UserCircle className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-card border-border p-2 rounded-2xl shadow-2xl">
                        <DropdownMenuLabel className="px-3 py-2 text-xs font-black text-muted-foreground uppercase tracking-widest">Account Details</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-indigo-600/10 focus:text-indigo-400 cursor-pointer transition-colors">
                            <Link href="/dashboard/settings" className="flex items-center w-full">
                                <User className="mr-2 h-4 w-4" /> Profile Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-indigo-600/10 focus:text-indigo-400 cursor-pointer transition-colors">
                            <Link href="/dashboard/settings" className="flex items-center w-full">
                                <Key className="mr-2 h-4 w-4" /> Security
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem
                            onClick={() => signOut()}
                            className="rounded-xl p-3 focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-400 transition-colors"
                        >
                            <LogOut className="mr-2 h-4 w-4" /> Log Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

