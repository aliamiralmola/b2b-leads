"use client";

import { useState } from "react";
import { Sidebar, DashboardHeader } from "@/components/dashboard-layout";
import { VerifyEmailBanner } from "@/components/dashboard/VerifyEmailBanner";

export function DashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className={`flex flex-col min-h-screen relative transition-all duration-300 overflow-x-hidden ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-64'}`}>
                <VerifyEmailBanner />
                <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-4 lg:p-8 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
