export default function DashboardLoading() {
    return (
        <div className="flex flex-col space-y-8 animate-pulse p-4">
            <div className="space-y-4">
                <div className="h-8 w-64 bg-white/5 rounded-lg" />
                <div className="h-4 w-96 bg-white/5 rounded-lg" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="h-48 bg-white/5 rounded-2xl border border-white/5" />
                <div className="h-48 bg-white/5 rounded-2xl border border-white/5" />
                <div className="h-48 bg-white/5 rounded-2xl border border-white/5" />
            </div>

            <div className="h-[400px] w-full bg-white/5 rounded-2xl border border-white/5" />
        </div>
    );
}
