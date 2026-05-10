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

    async function handleGoogleLogin() {
        setIsLoading(true)
        setErrorMsg(null)
        setSuccessMsg(null)

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                setErrorMsg(error.message)
                setIsLoading(false)
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'An error occurred during Google sign in')
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

                    <Button 
                        variant="outline" 
                        type="button" 
                        disabled={isLoading}
                        onClick={handleGoogleLogin}
                        className="w-full relative py-6"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 absolute left-4 animate-spin" /> : (
                            <svg viewBox="0 0 24 24" className="w-5 h-5 absolute left-4" aria-hidden="true">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                        )}
                        Continue with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with email
                            </span>
                        </div>
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
