import { ensureProfileExists } from "@/app/actions/settings";
import { DashboardLayoutWrapper } from "@/components/dashboard/DashboardLayoutWrapper";
import { SupportWidgets } from "@/components/support-widgets";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await ensureProfileExists();

    return (
        <DashboardLayoutWrapper>
            {children}
            <SupportWidgets />
        </DashboardLayoutWrapper>
    );
}
