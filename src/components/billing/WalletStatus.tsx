'use client'

import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { Button } from '@/components/ui/button'
import { Loader2, Wallet, LogOut, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect } from 'react'

interface WalletStatusProps {
    requiredAmount?: number;
}

export function WalletStatus({ requiredAmount }: WalletStatusProps) {
    const { address, isConnected, isConnecting } = useAccount()
    const { connectors, connect, status, error } = useConnect()
    const { disconnect } = useDisconnect()

    // Polygon USDT Address
    const USDT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as `0x${string}`

    const { data: balance, isLoading: isBalanceLoading } = useBalance({
        address,
        token: USDT_ADDRESS,
        chainId: polygon.id,
    })

    useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to connect wallet")
        }
    }, [error])

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

    if (isConnecting || status === 'pending') {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl gap-3 animate-in fade-in zoom-in duration-300">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <div className="text-center">
                    <p className="text-indigo-400 font-bold">Waiting for connection...</p>
                    <p className="text-indigo-400/60 text-xs">Please approve the request in your wallet</p>
                </div>
            </div>
        )
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col gap-3">
                {connectors.map((connector: any) => (
                    <Button
                        key={connector.uid}
                        onClick={() => connect({ connector })}
                        variant="outline"
                        className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white h-12 rounded-xl flex items-center gap-3 transition-all active:scale-[0.98]"
                    >
                        <Wallet className="w-5 h-5 text-indigo-400" />
                        Connect {connector.name}
                    </Button>
                ))}
            </div>
        )
    }

    const hasEnoughBalance = requiredAmount ? (Number(balance?.formatted || 0) >= requiredAmount) : true

    return (
        <div className="flex flex-col gap-4 p-4 bg-white/[0.03] border border-white/10 rounded-2xl animate-in slide-in-from-top-2 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Connected Wallet</p>
                        <p className="text-sm font-bold text-white">{formatAddress(address!)}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => disconnect()}
                    className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                </Button>
            </div>

            <div className="h-px bg-white/5 w-full" />

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-400 font-medium">Available Balance (USDT)</p>
                    {isBalanceLoading ? (
                        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin mt-1" />
                    ) : (
                        <p className={`text-lg font-black ${hasEnoughBalance ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {balance?.formatted || '0.00'} {balance?.symbol}
                        </p>
                    )}
                </div>

                {!isBalanceLoading && requiredAmount && (
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${hasEnoughBalance ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                        {hasEnoughBalance ? (
                            <><CheckCircle2 className="w-3 h-3" /> Sufficient Balance</>
                        ) : (
                            <><AlertCircle className="w-3 h-3" /> Insufficient Balance</>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
