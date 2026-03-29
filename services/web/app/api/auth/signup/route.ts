
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

export async function POST(req: NextRequest) {
  const { email, password, username, personid, role, avatarimage } = await req.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: 'email and password are required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // Step 1: Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Step 2: Insert into public.user table
  const { data: userData, error: userError } = await supabase
    .from('user')
    .insert([
      {
        personid,
        username,
        email,
        role,
        avatarimage: avatarimage ?? null,
      },
    ])
    .select()
    .single()

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 400 })
  }

  return NextResponse.json({
    message: 'Check your email to confirm your account.',
    authUser: authData.user,
    user: userData,
  })
}