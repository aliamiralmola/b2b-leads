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
            <DialogContent className="sm:max-w-[480px] bg-[#0a0a0a] border-white/10 p-0 overflow-hidden text-white flex flex-col max-h-[90vh]">
                <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02] shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-white tracking-tight">Checkout</DialogTitle>
                            <p className="text-gray-400 text-sm font-medium">
                                Subscription: <span className="text-white">{planName}</span>
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#050505] space-y-6">
                    <section className="space-y-3">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">1. Connection Status</h3>
                        <WalletStatus requiredAmount={amount} />
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">2. Payment Summary</h3>

                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Plan Price</span>
                                    <span className="text-sm font-bold text-white">{amount} USDT</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Network Fee</span>
                                    <span className="text-sm font-medium text-indigo-400">~0.01 MATIC</span>
                                </div>
                                <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-sm font-bold text-white">Total Amount</span>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-white leading-none">{amount} USDT</p>
                                        <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase">+ NETWORK FEE</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-600/5 px-4 py-3 flex items-start gap-3 border-t border-white/5">
                                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-indigo-300 leading-relaxed font-medium">
                                    Funds will be transferred directly to the platform wallet for instant activation.
                                </p>
                            </div>
                        </div>
                    </section>

                    <button
                        onClick={handleTransfer}
                        disabled={isLoading || !isConnected}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 group ${isLoading
                                ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98]'
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                Complete Payment
                            </>
                        )}
                    </button>

                    {hash && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div className="text-[11px] space-y-1">
                                <p className="text-emerald-400 font-bold">Transaction Submitted</p>
                                <p className="text-gray-500 font-mono break-all">{hash}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-gray-600 shrink-0 uppercase tracking-widest font-black">
                    <Lock className="w-3 h-3 text-emerald-500" />
                    Secure Direct Transfer • No Middleman • 100% Decentralized
                </div>
            </DialogContent>
        </Dialog>
    );
}
