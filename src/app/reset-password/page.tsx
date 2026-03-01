'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Image from 'next/image'
import { Loader2, Check, Lock } from 'lucide-react'

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

const formSchema = z.object({
    password: z.string().min(8, {
        message: 'Password must be at least 8 characters.',
    }),
    confirmPassword: z.string().min(8, {
        message: 'Please confirm your password.',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export default function ResetPasswordPage() {
    const supabase = createClient()
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setErrorMsg(null)
        setSuccessMsg(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: values.password
            })

            if (error) {
                setErrorMsg(error.message)
            } else {
                setSuccessMsg('Your password has been reset successfully. Redirecting to login...')
                setTimeout(() => {
                    router.push('/login')
                }, 3000)
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:px-0">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <div className="flex justify-center mb-4">
                        <Image src="/logo.png" alt="b2bleads logo" width={48} height={48} className="object-contain" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Reset Password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your new password below.
                    </p>
                </div>

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

                {!successMsg && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                            <FormLabel>New Password</FormLabel>
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
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold" type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </Button>
                        </form>
                    </Form>
                )}
            </div>
        </div>
    )
}
