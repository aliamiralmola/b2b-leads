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
    CheckCircle2,
    Lock,
    Trash2,
    Mail,
    Camera,
    ShieldCheck
} from "lucide-react";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { SecurityActions } from "@/components/dashboard/SecurityActions";
import { BillingHistory } from "@/components/dashboard/BillingHistory";
import { updateProfileAndTeam } from "@/app/actions/settings";
import { PLANS } from "@/lib/plans";
import { revalidatePath } from "next/cache";

export default async function SettingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div className="p-8 text-center text-gray-500">Please log in to view your settings.</div>;
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
        const email = formData.get("email") as string;

        await updateProfileAndTeam({ fullName, companyName, email });
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 py-6 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-white mb-2">Settings</h2>
                    <p className="text-gray-400 text-lg">
                        Manage your enterprise workspace and account preferences.
                    </p>
                </div>
                <SignOutButton />
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl h-auto mb-8 flex flex-wrap">
                    <TabsTrigger value="general" className="flex items-center gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                        <User className="w-4 h-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="flex items-center gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                        <CreditCard className="w-4 h-4" />
                        Billing
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
                        <Bell className="w-4 h-4" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <form action={handleSave}>
                        <Card className="bg-card border-border shadow-2xl overflow-hidden">
                            <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                                <CardTitle className="flex items-center gap-2 text-xl text-white">
                                    <Building2 className="w-5 h-5 text-indigo-400" />
                                    Account Information
                                </CardTitle>
                                <CardDescription>Update your personal and company details.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-8">
                                {/* Avatar Section */}
                                <div className="flex flex-col md:flex-row items-center gap-8 mb-4">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-500/40">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-10 h-10 text-indigo-400" />
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                <Camera className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-center md:text-left">
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Profile Picture</h4>
                                        <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 2MB.</p>
                                        <Button variant="outline" size="sm" className="mt-2 border-white/10 text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest">
                                            Upload New
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            defaultValue={profile?.full_name || ""}
                                            placeholder="John Doe"
                                            className="bg-white/5 border-white/10 text-white h-12 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Email Address</Label>
                                        <div className="relative">
                                            <Input
                                                id="email"
                                                name="email"
                                                defaultValue={user.email}
                                                className="bg-white/5 border-white/10 text-white h-12 pr-10 focus:border-indigo-500 transition-all"
                                            />
                                            <Mail className="w-4 h-4 text-gray-600 absolute right-3 top-4" />
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1 italic">Changing your email will require a verification link sent to the new address.</p>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="companyName" className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Company / Team Name</Label>
                                        <Input
                                            id="companyName"
                                            name="companyName"
                                            defaultValue={team?.name || ""}
                                            placeholder="My Awesome Team"
                                            className="bg-white/5 border-white/10 text-white h-12 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/5 flex justify-end">
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 h-12 font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>

                    <Card className="bg-card border-border shadow-2xl mt-8 overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                            <CardTitle className="flex items-center gap-2 text-xl text-white">
                                <Lock className="w-5 h-5 text-amber-400" />
                                Security & Privacy
                            </CardTitle>
                            <CardDescription>Manage your password and account security.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border border-white/5 bg-white/[0.01] gap-6">
                                <div className="space-y-1">
                                    <p className="font-bold text-white text-lg">Change Password</p>
                                    <p className="text-sm text-gray-500">Ensure your account is using a long, random password to stay secure.</p>
                                    {/* Password Strength Mockup */}
                                    <div className="mt-4 space-y-2 max-w-xs">
                                        <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-gray-500 px-1">
                                            <span>Strength</span>
                                            <span className="text-emerald-400">Excellent</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="flex-1 h-1.5 rounded-full bg-emerald-500/50" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 h-12 px-6 font-bold rounded-xl border-2">
                                    Update Password
                                </Button>
                            </div>

                            <SecurityActions />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing" className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="bg-card border-border shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Zap className="w-24 h-24 text-indigo-400 -mr-8 -mt-8" />
                            </div>
                            <CardHeader>
                                <CardDescription className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Current Plan</CardDescription>
                                <CardTitle className="text-4xl font-black text-white mt-1">{planName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black bg-indigo-400/10 w-fit px-3 py-1 rounded-lg border border-indigo-400/20 uppercase tracking-widest">
                                    <ShieldCheck className="w-3 h-3" />
                                    Active Platform API
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border shadow-2xl md:col-span-2 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <CreditCard className="w-24 h-24 text-white -mr-8 -mt-8" />
                            </div>
                            <CardHeader>
                                <CardDescription className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Credit Balance</CardDescription>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-6xl font-black text-white tracking-tighter">{credits.toLocaleString()}</span>
                                    <span className="text-indigo-400 font-black uppercase tracking-widest text-xs">Credits Available</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-400 max-w-sm">
                                    Each credit allows you to extract 1 highly targeted business lead from our premium data sources.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-card border-border shadow-2xl overflow-hidden">
                        <BillingHistory invoices={invoiceHistory} />
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                    <Card className="bg-[#0c0c0c] border-white/5 shadow-2xl overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                            <CardTitle className="text-xl text-white">Email Preferences</CardTitle>
                            <CardDescription>Control how you receive updates and alerts.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-indigo-500/20 transition-all group">
                                <div className="space-y-1">
                                    <p className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors">Search Completions</p>
                                    <p className="text-sm text-gray-500">Get an email notification whenever your lead extraction finishes.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-indigo-500/20 transition-all group">
                                <div className="space-y-1">
                                    <p className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors">Product Announcements</p>
                                    <p className="text-sm text-gray-500">Stay up to date with the latest features and insights from the team.</p>
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
