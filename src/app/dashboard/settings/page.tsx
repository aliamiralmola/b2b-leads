import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    User,
    CreditCard,
    Bell,
    Building2,
    Zap,
    History,
    CheckCircle2
} from "lucide-react";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { updateProfileAndTeam } from "@/app/actions/settings";
import { revalidatePath } from "next/cache";

export default async function SettingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Please log in to view your settings.</div>;
    }

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch Team
    const { data: team } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    const credits = profile?.credits || 0;
    const planName = credits > 1000 ? "Pro" : "Free Trial";

    const invoiceHistory = [
        { id: "INV-001", date: "2024-02-01", amount: "$0.00", status: "Paid" },
        { id: "INV-002", date: "2024-01-01", amount: "$0.00", status: "Paid" },
    ];

    async function handleSave(formData: FormData) {
        "use server";
        const fullName = formData.get("fullName") as string;
        const companyName = formData.get("companyName") as string;

        await updateProfileAndTeam({ fullName, companyName });
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 py-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-white mb-2">Settings</h2>
                    <p className="text-gray-400 text-lg">
                        Manage your enterprise workspace and account preferences.
                    </p>
                </div>
                <SignOutButton />
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl h-auto mb-8">
                    <TabsTrigger value="general" className="flex items-center gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                        <User className="w-4 h-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="flex items-center gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                        <CreditCard className="w-4 h-4" />
                        Billing
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                        <Bell className="w-4 h-4" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general" className="space-y-6">
                    <form action={handleSave}>
                        <Card className="bg-[#0c0c0c] border-white/5 shadow-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-white">
                                    <Building2 className="w-5 h-5 text-indigo-400" />
                                    Account Information
                                </CardTitle>
                                <CardDescription>Update your personal and company details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-gray-400">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            defaultValue={profile?.full_name || ""}
                                            placeholder="John Doe"
                                            className="bg-white/5 border-white/10 text-white h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-400">Email Address</Label>
                                        <Input
                                            id="email"
                                            value={user.email}
                                            disabled
                                            className="bg-white/5 border-white/10 text-gray-500 h-12"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="companyName" className="text-gray-400">Company / Team Name</Label>
                                        <Input
                                            id="companyName"
                                            name="companyName"
                                            defaultValue={team?.name || ""}
                                            placeholder="My Awesome Team"
                                            className="bg-white/5 border-white/10 text-white h-12"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 h-12 font-bold shadow-lg shadow-indigo-600/20">
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </TabsContent>

                {/* Billing Tab */}
                <TabsContent value="billing" className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="bg-[#0c0c0c] border-white/5 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Zap className="w-12 h-12 text-indigo-400" />
                            </div>
                            <CardHeader>
                                <CardDescription className="text-gray-500">Current Plan</CardDescription>
                                <CardTitle className="text-3xl font-black text-white">{planName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium bg-indigo-400/10 w-fit px-3 py-1 rounded-full border border-indigo-400/20">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Active Platform API
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#0c0c0c] border-white/5 shadow-2xl md:col-span-2">
                            <CardHeader>
                                <CardDescription className="text-gray-500">Credit Balance</CardDescription>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-white">{credits.toLocaleString()}</span>
                                    <span className="text-indigo-400 font-bold uppercase tracking-widest text-sm">Credits Remaining</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-400">
                                    Credits are used to extract high-quality B2B leads. 1 Credit = 1 Business Lead.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-[#0c0c0c] border-white/5 shadow-2xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl text-white flex items-center gap-2">
                                    <History className="w-5 h-5 text-gray-400" />
                                    Invoice History
                                </CardTitle>
                                <CardDescription>View and download your past invoices.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-white/[0.02]">
                                    <TableRow className="border-white/5">
                                        <TableHead className="text-gray-400">Invoice ID</TableHead>
                                        <TableHead className="text-gray-400">Date</TableHead>
                                        <TableHead className="text-gray-400">Amount</TableHead>
                                        <TableHead className="text-gray-400 text-right pr-6">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoiceHistory.map((invoice) => (
                                        <TableRow key={invoice.id} className="border-white/5 hover:bg-white/5">
                                            <TableCell className="text-white font-medium">{invoice.id}</TableCell>
                                            <TableCell className="text-gray-400">{invoice.date}</TableCell>
                                            <TableCell className="text-gray-400">{invoice.amount}</TableCell>
                                            <TableCell className="text-right pr-6">
                                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-xs font-bold uppercase">
                                                    {invoice.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card className="bg-[#0c0c0c] border-white/5 shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Email Preferences</CardTitle>
                            <CardDescription>Control how you receive updates and alerts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                <div className="space-y-0.5">
                                    <p className="font-bold text-white">Email Alerts</p>
                                    <p className="text-sm text-gray-500">Get notified when your searches are complete.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                <div className="space-y-0.5">
                                    <p className="font-bold text-white">Product Updates</p>
                                    <p className="text-sm text-gray-500">Stay informed about new features and improvements.</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
