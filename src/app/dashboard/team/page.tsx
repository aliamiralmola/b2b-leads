'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Users, Mail, UserPlus, Trash2, Loader2, CheckCircle2, ChevronDown, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { inviteTeamMember, fetchTeamMembers, removeTeamMember } from '@/app/actions/team';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    role: z.enum(["admin", "editor", "viewer"]),
});

export default function TeamPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerified, setIsVerified] = useState<boolean | null>(null);
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            role: "viewer",
        },
    });

    const loadMembers = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email_confirmed_at) {
                setIsVerified(false);
                setLoading(false);
                return;
            }
            setIsVerified(true);
            const data = await fetchTeamMembers();
            setMembers(data);
        } catch (error) {
            console.error("Failed to load members:", error);
            toast.error("Failed to load team members");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMembers();
    }, []);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            await inviteTeamMember(values.email, values.role);
            toast.success("Invitation sent successfully!");
            form.reset();
            loadMembers();
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleRemove(id: string) {
        try {
            await removeTeamMember(id);
            toast.success("Member removed");
            loadMembers();
        } catch (error) {
            toast.error("Failed to remove member");
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (isVerified === false) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="bg-orange-500/10 p-4 rounded-full mb-4">
                    <Users className="h-10 w-10 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Verification Required</h2>
                <p className="text-muted-foreground max-w-md">
                    Please verify your email address to access team management features.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <Users className="h-8 w-8 text-indigo-500" />
                    Team Management
                </h2>
                <p className="text-muted-foreground">
                    Manage your team members and collaborate on lead generation.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Invite Member Form */}
                <Card className="bg-card border-border shadow-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <UserPlus className="h-5 w-5 text-indigo-400" />
                            Invite a Member
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Add a new member to your team workspace by email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-muted-foreground">Email Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="colleague@example.com"
                                                        {...field}
                                                        className="bg-muted border-border pl-10 focus-visible:ring-indigo-500 text-foreground"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-muted-foreground">Workspace Role</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-muted border-border focus:ring-indigo-500 rounded-xl">
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-card border-border rounded-xl">
                                                    <SelectItem value="admin">Admin (Full Access)</SelectItem>
                                                    <SelectItem value="editor">Editor (Manage Leads)</SelectItem>
                                                    <SelectItem value="viewer">Viewer (Read Only)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 py-6 rounded-xl font-bold"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Send Invite</span>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Team Members List */}
                <Card className="lg:col-span-2 bg-card border-border shadow-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Users className="h-5 w-5 text-indigo-400" />
                            Your Team Members
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            A list of all members currently in your workspace.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="border-border hover:bg-transparent">
                                        <TableHead className="text-muted-foreground font-semibold px-6">Email</TableHead>
                                        <TableHead className="text-muted-foreground font-semibold px-6">Role</TableHead>
                                        <TableHead className="text-muted-foreground font-semibold px-6">Status</TableHead>
                                        <TableHead className="text-right text-muted-foreground font-semibold px-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-500" />
                                            </TableCell>
                                        </TableRow>
                                    ) : members.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                                No members invited yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        members.map((member) => (
                                            <TableRow key={member.id} className="border-border hover:bg-muted transition-colors">
                                                <TableCell className="font-medium text-foreground px-6">
                                                    {member.email}
                                                </TableCell>
                                                <TableCell className="px-6">
                                                    <Badge variant="outline" className={`rounded-lg border-border font-bold uppercase text-[10px] tracking-widest ${member.role === 'admin' ? 'text-indigo-400 bg-indigo-400/5' : member.role === 'editor' ? 'text-amber-400 bg-amber-400/5' : 'text-muted-foreground bg-muted'}`}>
                                                        {member.role || 'viewer'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full w-fit">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Active
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemove(member.id)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
