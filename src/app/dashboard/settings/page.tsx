import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Mail, LogOut, ShieldCheck } from "lucide-react";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

export default async function SettingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Please log in to view your settings.</div>;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

    return (
        <div className="max-w-4xl mx-auto space-y-10 py-6">
            <div>
                <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">Settings</h2>
                <p className="text-gray-400 text-lg">
                    Manage your account settings, plan, and security.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Account Details */}
                <Card className="bg-[#0c0c0c] border-white/5 shadow-2xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Mail className="h-5 w-5 text-blue-400" />
                            </div>
                            Account Details
                        </CardTitle>
                        <CardDescription>Your account credentials and identification.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</Label>
                            <Input
                                id="email"
                                value={user.email}
                                disabled
                                className="bg-white/5 border-white/10 text-gray-300 h-11 focus:ring-0"
                            />
                        </div>
                        <div className="pt-4 border-t border-white/5">
                            <SignOutButton />
                        </div>
                    </CardContent>
                </Card>

                {/* Plan & Credits */}
                <Card className="bg-[#0c0c0c] border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap className="h-24 w-24 text-indigo-500" />
                    </div>
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <Zap className="h-5 w-5 text-indigo-400" />
                            </div>
                            Subscription Status
                        </CardTitle>
                        <CardDescription>Current credit balance and plan details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="flex items-center justify-between p-6 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-2xl border border-indigo-500/20">
                            <div>
                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Available Credits</p>
                                <p className="text-4xl font-black text-white">{profile?.credits || 0}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                                <Zap className="h-6 w-6 text-white fill-white" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed text-center px-4">
                            You extract high-quality leads at the cost of <span className="text-white font-medium">1 credit per result</span>.
                        </p>
                    </CardContent>
                </Card>

                {/* Security Section (Placeholder) */}
                <Card className="bg-[#0c0c0c] border-white/5 shadow-2xl md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                            </div>
                            Privacy & Security
                        </CardTitle>
                        <CardDescription>Manage your security preferences and data privacy.</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                            <div className="space-y-1">
                                <p className="font-medium text-white">Password Management</p>
                                <p className="text-sm text-gray-500">Update your account password securely.</p>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded text-gray-400 border border-white/10 uppercase tracking-tighter">
                                Coming Soon
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
