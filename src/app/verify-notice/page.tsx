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
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/10 mb-6">
                    <Mail className="h-10 w-10 text-indigo-500" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
                    Check Your Email
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[#0a0a0a] border border-white/5 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 text-center">
                    <div className="space-y-6">
                        <p className="text-gray-300 leading-relaxed">
                            Account Created! Please check <span className="font-semibold text-white">{email ? decodeURIComponent(email) : 'your email'}</span> and click the verification link to activate your b2bleads account.
                        </p>

                        <div className="pt-2 mt-6">
                            <Link
                                href="/login"
                                className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Back to Login
                            </Link>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            Didn't receive the email? Check your spam folder or try logging in to trigger a new link.
                        </p>
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
