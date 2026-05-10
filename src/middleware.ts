import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const publicRoutes = ['/login', '/auth', '/privacy', '/terms', '/refund', '/contact', '/faq', '/docs', '/affiliates']
    const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route)) || request.nextUrl.pathname === '/'

    if (!user && !isPublicRoute) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    const authRoutes = ['/login'] // Routes that logged-in users shouldn't see
    const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route)) ||
        (request.nextUrl.pathname === '/' && user)

    if (user && isAuthRoute) {
        // user is logged in, redirect away from login/landing page to dashboard
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally: return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    // Affiliate referral tracking
    const refCode = request.nextUrl.searchParams.get('ref')
    if (refCode) {
        // Set cookie for 30 days
        supabaseResponse.cookies.set('affiliate_code', refCode, {
            maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
            path: '/',
            httpOnly: false, // Must be false so client-side can read it during signup
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })

        // Only increment if we haven't tracked this session yet (optional but good for data quality)
        // For now, we'll just try to fire the RPC
        // Unique click tracking: Prevent same person from increasing count multiple times in 24h
        const trackingCookieName = `tracked_ref_${refCode}`;
        const alreadyTracked = request.cookies.get(trackingCookieName);

        if (!alreadyTracked) {
            try {
                const { error: rpcError } = await supabase.rpc('increment_affiliate_clicks', { code: refCode });
                if (rpcError) {
                    console.warn("Middleware: increment_affiliate_clicks RPC failed. Falling back to manual update.", rpcError);

                    const { data: aff } = await supabase.from('affiliates').select('clicks_count').eq('referral_code', refCode).single();
                    if (aff) {
                        await supabase.from('affiliates')
                            .update({ clicks_count: (aff.clicks_count || 0) + 1 })
                            .eq('referral_code', refCode);
                    }
                }

                // Set tracking cookie for 24h
                supabaseResponse.cookies.set(trackingCookieName, 'true', {
                    maxAge: 24 * 60 * 60,
                    path: '/',
                    httpOnly: true,
                    sameSite: 'lax',
                });
            } catch (e) {
                console.error("Middleware Cache Exception during click tracking:", e);
            }
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
