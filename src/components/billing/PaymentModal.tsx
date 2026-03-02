"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState, useCallback } from "react";
import { Loader2, ShieldCheck, CreditCard, Lock, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { WalletStatus } from "./WalletStatus";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from "viem";
import { toast } from "sonner";

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    planName: string;
    amount: number;
    onPaymentComplete: (txHash: string) => void;
}

const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const USDT_ABI = [
    {
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
    },
] as const;

export function PaymentModal({ open, onOpenChange, planName, amount, onPaymentComplete }: PaymentModalProps) {
    const { address, isConnected } = useAccount();
    const receiverAddress = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || "";

    const { data: hash, writeContract, isPending: isWritePending, error: writeError } = useWriteContract();

    const { isLoading: isWaitingForTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isTxSuccess && hash) {
            toast.success("Payment completed successfully!");
            onPaymentComplete(hash);
        }
    }, [isTxSuccess, hash, onPaymentComplete]);

    useEffect(() => {
        if (writeError) {
            toast.error(`Error: ${writeError.message}`);
        }
    }, [writeError]);

    const handleTransfer = async () => {
        if (!isConnected) {
            toast.error("Please connect your wallet first");
            return;
        }

        try {
            writeContract({
                address: USDT_ADDRESS,
                abi: USDT_ABI,
                functionName: 'transfer',
                args: [
                    receiverAddress as `0x${string}`,
                    parseUnits(amount.toString(), 6),
                ],
            });
        } catch (err: any) {
            toast.error(err.message || "An error occurred during payment");
        }
    };

    const isLoading = isWritePending || isWaitingForTx;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] bg-card border-border p-0 overflow-hidden text-foreground flex flex-col max-h-[90vh] shadow-2xl">
                <DialogHeader className="p-6 border-b border-border bg-muted/30 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-foreground tracking-tight uppercase">Checkout</DialogTitle>
                            <p className="text-muted-foreground text-sm font-bold">
                                Subscription: <span className="text-primary">{planName}</span>
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-0 custom-scrollbar bg-card flex flex-col">
                    <div className="flex border-b border-border bg-muted/20">
                        <button className="flex-1 py-3 text-xs font-black uppercase tracking-widest border-b-2 border-primary text-primary flex items-center justify-center gap-2">
                            <Send className="w-3 h-3" />
                            Crypto (USDT)
                        </button>
                        <button className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 border-b-2 border-transparent transition-colors opacity-50 cursor-not-allowed">
                            <CreditCard className="w-3 h-3" />
                            Credit Card
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        <section className="space-y-4">
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">1. Connection Status</h3>
                            <WalletStatus requiredAmount={amount} />
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">2. Payment Summary</h3>

                            <div className="bg-muted/30 border border-border rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <span className="text-muted-foreground">Plan Price</span>
                                        <span className="text-foreground">{amount} USDT</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <span className="text-muted-foreground">Network Fee</span>
                                        <span className="text-primary font-bold">~0.01 MATIC</span>
                                    </div>
                                    <div className="pt-4 border-t border-border flex justify-between items-center">
                                        <span className="text-sm font-black text-foreground uppercase tracking-wider">Total Amount</span>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-primary leading-none tracking-tighter">{amount} USDT</p>
                                            <p className="text-[9px] text-muted-foreground font-black mt-2 uppercase tracking-widest">+ NETWORK FEE</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-primary/5 px-5 py-4 flex items-start gap-3 border-t border-border">
                                    <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-primary/80 leading-relaxed font-bold">
                                        Funds will be transferred directly to the platform wallet for instant activation.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <button
                            onClick={handleTransfer}
                            disabled={isLoading || !isConnected}
                            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 btn-press group ${isLoading
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 active:scale-[0.98]'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    Complete Payment
                                </>
                            )}
                        </button>

                        <div className="p-4 bg-muted/50 border border-dashed border-border rounded-xl flex items-center justify-center text-center">
                            <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">
                                Credit card payments are temporarily disabled for maintenance.<br />
                                <span className="text-primary">Please use USDT for instant activation.</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-muted/30 border-t border-border flex items-center justify-center gap-3 text-[9px] text-muted-foreground shrink-0 uppercase tracking-[0.25em] font-black">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    Direct Transfer • No Middleman • Decentralized
                </div>
            </DialogContent>
        </Dialog>
    );
}
