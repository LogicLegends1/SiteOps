import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // This error means user exists but email not confirmed yet
  if (error?.message === 'Email not confirmed') {
    return NextResponse.json(
      { error: 'Please confirm your email before signing in. Check your inbox.' },
      { status: 401 }
    )
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    message: 'Signed in successfully',
    user: data.user,
    session: data.session,
  })
}