'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteAccount } from '@/app/actions/settings'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2 } from 'lucide-react'

export function SecurityActions() {
    const supabase = createClient()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const handleSignOutAll = async () => {
        setIsLoading(true)
        try {
            const { error } = await supabase.auth.signOut({ scope: 'global' })
            if (error) throw error
            toast.success('Signed out of all devices successfully.')
            router.push('/login')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to sign out of all devices.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        setIsLoading(true)
        try {
            await deleteAccount()
            toast.success('Your account has been deleted.')
            router.push('/login')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete account.')
        } finally {
            setIsLoading(false)
            setIsDeleteDialogOpen(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Session Management UI */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border border-border bg-muted/30 gap-6">
                <div className="space-y-1">
                    <p className="font-bold text-foreground text-lg">Active Sessions</p>
                    <p className="text-sm text-muted-foreground">Manage your active sessions across different devices and browsers.</p>
                    <div className="flex items-center gap-2 mt-4 text-[10px] uppercase font-black tracking-widest text-indigo-500">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span>Current Device: Windows PC (Chrome) - Verified Session</span>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-accent h-12 px-6 font-bold rounded-xl border-2"
                    onClick={handleSignOutAll}
                    disabled={isLoading}
                >
                    {isLoading ? "Signing Out..." : "Sign Out All Devices"}
                </Button>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-red-500/10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border border-red-500/20 bg-red-500/5 gap-6">
                    <div className="space-y-1">
                        <p className="font-bold text-red-400 text-lg">Danger Zone</p>
                        <p className="text-sm text-red-500/70 max-w-md line-clamp-2">Permanently remove your account and all associated data. This action cannot be undone.</p>
                    </div>
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" className="bg-red-600/10 border border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white h-12 px-6 font-bold rounded-xl transition-all">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border shadow-2xl rounded-2xl sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Are you absolutely sure?</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    disabled={isLoading}
                                    className="bg-red-600 hover:bg-red-500"
                                >
                                    {isLoading ? "Deleting..." : "Permanently Delete Account"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}
