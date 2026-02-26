'use client'

import * as React from 'react'
import { createClient } from '@/utils/supabase/client'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function VerifyEmailBanner() {
    const supabase = createClient()
    const [isVerified, setIsVerified] = React.useState<boolean>(true) // Assume true initially to prevent flash
    const [isLoading, setIsLoading] = React.useState(true)
    const [cooldown, setCooldown] = React.useState(0)
    const [isResending, setIsResending] = React.useState(false)
    const [userEmail, setUserEmail] = React.useState<string | null>(null)

    const COOLDOWN_MINUTES = 5
    const COOLDOWN_SECONDS = COOLDOWN_MINUTES * 60

    React.useEffect(() => {
        async function checkVerification() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setIsVerified(!!user.email_confirmed_at)
                setUserEmail(user.email ?? null)
            }
            setIsLoading(false)
        }
        checkVerification()
    }, [supabase.auth])

    React.useEffect(() => {
        // Check localStorage for existing cooldown
        const lastResentStr = localStorage.getItem('resendEmailTimestamp')
        if (lastResentStr) {
            const lastResent = parseInt(lastResentStr, 10)
            const now = Date.now()
            const diffSeconds = Math.floor((now - lastResent) / 1000)

            if (diffSeconds < COOLDOWN_SECONDS) {
                setCooldown(COOLDOWN_SECONDS - diffSeconds)
            } else {
                localStorage.removeItem('resendEmailTimestamp')
            }
        }
    }, [])

    React.useEffect(() => {
        let timer: NodeJS.Timeout
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        localStorage.removeItem('resendEmailTimestamp')
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => clearInterval(timer)
    }, [cooldown])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const handleResend = async () => {
        if (!userEmail || cooldown > 0 || isResending) return

        setIsResending(true)
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: userEmail,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            })

            if (!error) {
                const now = Date.now()
                localStorage.setItem('resendEmailTimestamp', now.toString())
                setCooldown(COOLDOWN_SECONDS)
            }
        } catch (error) {
            console.error("Failed to resend email:", error)
        } finally {
            setIsResending(false)
        }
    }

    if (isLoading || isVerified) return null

    return (
        <div className="sticky top-0 z-50 w-full bg-orange-600/90 text-white px-4 py-3 shadow-md backdrop-blur-sm border-b border-orange-500/50">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-200" />
                    <p className="text-sm font-medium">
                        Please verify your email to use the service. Required features are blocked until verified.
                    </p>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleResend}
                    disabled={cooldown > 0 || isResending}
                    className="bg-white text-orange-700 hover:bg-orange-50 shrink-0 w-full sm:w-auto font-semibold"
                >
                    {isResending ? 'Sending...' : cooldown > 0 ? `Resend again in ${formatTime(cooldown)}` : 'Resend Email'}
                </Button>
            </div>
        </div>
    )
}
