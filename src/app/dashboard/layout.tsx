import { Sidebar, DashboardHeader } from "@/components/dashboard-layout";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#030712] text-white selection:bg-indigo-500/30">
            <Sidebar />
            <div className="pl-64 flex flex-col min-h-screen relative">
                <DashboardHeader />
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
