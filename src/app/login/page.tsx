'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Image from 'next/image'
import { Loader2, ShieldCheck, Check, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const formSchema = z.object({
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    password: z.string().min(6, {
        message: 'Password must be at least 6 characters.',
    }),
})

export default function LoginPage() {
    const supabase = createClient()
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const searchParams = React.useMemo(() => typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null, [])
    const message = searchParams?.get('message')

    async function handleForgotPassword() {
        const email = form.getValues('email')
        if (!email || !z.string().email().safeParse(email).success) {
            setErrorMsg('Please enter your email first to reset your password.')
            return
        }

        setIsLoading(true)
        setErrorMsg(null)
        setSuccessMsg(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) {
                setErrorMsg(error.message)
            } else {
                setSuccessMsg('Password reset link sent to your email.')
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleLogin(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setErrorMsg(null)
        setSuccessMsg(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            })

            if (error) {
                setErrorMsg(error.message)
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'An error occurred during login')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleSignup(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setErrorMsg(null)
        setSuccessMsg(null)

        try {
            const { data, error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
            })

            if (error) {
                setErrorMsg(error.message)
            } else if (data?.session === null) {
                form.reset()
                router.push(`/verify-notice?email=${encodeURIComponent(values.email)}`)
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'An error occurred during signup')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <Link
                href="/"
                className="absolute right-4 top-4 md:right-8 md:top-8 text-sm font-medium hover:underline"
            >
                Home
            </Link>
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-background" />
                <div className="relative z-20 flex items-center gap-2 text-lg font-medium">
                    <Image src="/logo.png" alt="b2bleads logo" width={32} height={32} className="object-contain" />
                    b2bleads
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;This tool has saved me countless hours of work and helped me scale my lead pipeline faster than I ever thought possible.&rdquo;
                        </p>
                        <footer className="text-sm">Sofia Davis</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email below to log into your account
                        </p>
                        {message && (
                            <div className="p-3 rounded bg-destructive/10 border border-destructive/50 text-destructive text-xs mt-2">
                                {message}
                            </div>
                        )}
                        {errorMsg && (
                            <div className="p-3 rounded bg-destructive/10 border border-destructive/50 text-destructive text-sm mt-2">
                                {errorMsg}
                            </div>
                        )}
                        {successMsg && (
                            <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 text-sm mt-2">
                                {successMsg}
                            </div>
                        )}
                    </div>

                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4 pt-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="name@example.com" {...field} disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>Password</FormLabel>
                                                    <button
                                                        type="button"
                                                        onClick={handleForgotPassword}
                                                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                                    >
                                                        Forgot password?
                                                    </button>
                                                </div>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button className="w-full" type="submit" disabled={isLoading}>
                                        {isLoading ? 'Loading...' : 'Sign In'}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4 pt-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="name@example.com" {...field} disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => {
                                            const password = field.value || ''
                                            const hasLength = password.length >= 8
                                            const hasUpper = /[A-Z]/.test(password)
                                            const hasNumber = /[0-9]/.test(password)
                                            const strength = [hasLength, hasUpper, hasNumber].filter(Boolean).length

                                            return (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                                                    </FormControl>
                                                    <div className="mt-2 space-y-2">
                                                        <div className="flex gap-1 h-1">
                                                            {[1, 2, 3].map((s) => (
                                                                <div
                                                                    key={s}
                                                                    className={`flex-1 rounded-full transition-colors ${strength >= s
                                                                        ? strength === 3 ? 'bg-emerald-500' : strength === 2 ? 'bg-yellow-500' : 'bg-red-500'
                                                                        : 'bg-zinc-800'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px]">
                                                            <div className={`flex items-center gap-1 ${hasLength ? 'text-emerald-500' : 'text-zinc-500'}`}>
                                                                {hasLength ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                                                                8+ characters
                                                            </div>
                                                            <div className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-500' : 'text-zinc-500'}`}>
                                                                {hasUpper ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                                                                Uppercase
                                                            </div>
                                                            <div className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-500' : 'text-zinc-500'}`}>
                                                                {hasNumber ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                                                                Number
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )
                                        }}
                                    />
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border text-[11px] text-muted-foreground">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <span>Secure registration protected by hCaptcha Enterprise.</span>
                                    </div>
                                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{' '}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Privacy Policy
                        </Link>.
                    </p>
                </div>
            </div>
        </div>
    )
}
