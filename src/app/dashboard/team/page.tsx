'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Users, Mail, UserPlus, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { inviteTeamMember, fetchTeamMembers, removeTeamMember } from '@/app/actions/team';
import { toast } from 'sonner';

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function TeamPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    const loadMembers = async () => {
        try {
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
            await inviteTeamMember(values.email);
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Users className="h-8 w-8 text-indigo-500" />
                    Team Management
                </h2>
                <p className="text-gray-400">
                    Manage your team members and collaborate on lead generation.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Invite Member Form */}
                <Card className="bg-[#0a0a0a] border-white/5 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <UserPlus className="h-5 w-5 text-indigo-400" />
                            Invite a Member
                        </CardTitle>
                        <CardDescription className="text-gray-400">
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
                                            <FormLabel className="text-gray-300">Email Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                    <Input
                                                        placeholder="colleague@example.com"
                                                        {...field}
                                                        className="bg-white/5 border-white/10 pl-10 focus-visible:ring-indigo-500 text-white"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        "Send Invite"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Team Members List */}
                <Card className="lg:col-span-2 bg-[#0a0a0a] border-white/5 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Users className="h-5 w-5 text-indigo-400" />
                            Your Team Members
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            A list of all members currently in your workspace.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-white/5 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="text-gray-300 font-semibold">Email</TableHead>
                                        <TableHead className="text-gray-300 font-semibold">Status</TableHead>
                                        <TableHead className="text-right text-gray-300 font-semibold">Actions</TableHead>
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
                                            <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                                                No members invited yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        members.map((member) => (
                                            <TableRow key={member.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <TableCell className="font-medium text-gray-200">
                                                    {member.email}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full w-fit">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Invited
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemove(member.id)}
                                                        className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
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
