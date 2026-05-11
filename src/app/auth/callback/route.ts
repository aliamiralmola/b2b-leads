import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    let errorMessage = "Could not verify your email"

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(`${origin}/dashboard`)
        } else {
            console.error("Auth callback error:", error)
            errorMessage = error.message
        }
    }

    // return the user to an error page with some instructions
    return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent(errorMessage)}`)
}
