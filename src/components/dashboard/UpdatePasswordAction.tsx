'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Lock, Loader2 } from 'lucide-react';

export function UpdatePasswordAction() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const supabase = createClient();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            toast.success('Password updated successfully!');
            setIsOpen(false);
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button
                variant="outline"
                onClick={() => setIsOpen(true)}
                className="border-border text-foreground hover:bg-accent h-12 px-6 font-bold rounded-xl border-2"
            >
                Update Password
            </Button>
            <DialogContent className="bg-card border-border shadow-2xl rounded-2xl sm:max-w-[425px]">
                <form onSubmit={handleUpdate}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-amber-400" />
                            Update Password
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Enter your new password below. Make sure it's secure.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-muted border-border"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-muted border-border"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
