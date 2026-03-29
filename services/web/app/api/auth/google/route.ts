import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'
export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        access_type: 'offline',  // get refresh token
        prompt: 'consent',
      },
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Redirect user to Google login page
  return NextResponse.redirect(data.url)
}