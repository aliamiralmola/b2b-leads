'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
}

export function ConfirmModal({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default'
}: ConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-card border-border rounded-3xl shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-2">
                        <div className={`p-3 rounded-2xl ${variant === 'destructive' ? 'bg-red-500/10 text-red-500' : 'bg-indigo-600/10 text-indigo-400'}`}>
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-xl font-black text-foreground">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground pt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 mt-6">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl font-bold text-muted-foreground hover:text-foreground"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                        className={`rounded-xl font-bold px-6 ${variant === 'destructive' ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-500'} text-white shadow-lg`}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
