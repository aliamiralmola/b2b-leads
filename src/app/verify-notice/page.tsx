'use client';

import Link from 'next/link';
import { Mail, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyNoticeContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    return (
        <div className="min-h-screen bg-[#030712] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500/30">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 mb-6">
                    <Mail className="h-8 w-8 text-indigo-500" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
                    Check your inbox
                </h2>
                <p className="mt-4 text-center text-sm text-gray-400">
                    We've sent a verification link to{' '}
                    <span className="font-semibold text-white">{email ? decodeURIComponent(email) : 'your email'}</span>.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[#0a0a0a] border border-white/5 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
                    <div className="space-y-6">
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                            <p className="text-sm text-indigo-200">
                                You must confirm your email address to access B2B Leads. Click the link in the email to get started.
                            </p>
                        </div>

                        <div className="text-center pt-2 border-t border-white/5 mt-6">
                            <p className="text-sm text-gray-400 mb-4">
                                Didn't receive the email? Check your spam folder or try logging in to resend it.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Return to login <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyNoticePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#030712] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        }>
            <VerifyNoticeContent />
        </Suspense>
    );
}
