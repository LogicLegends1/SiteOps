
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

export async function POST(req: NextRequest) {
  const {
    email,
    password,
    username,
    role,
    nic,
    yearsOfExperience,
    avatarimage
  } = await req.json()

  if (!email || !password || !username || !role || !nic ) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // =====================================
  // 1. Create Auth User
  // =====================================
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message || 'Auth failed' },
      { status: 400 }
    )
  }

  const authUserId = authData.user.id // 🔥 UUID

  // =====================================
  // 2. Insert into person table
  // =====================================
  const { data: personData, error: personError } = await supabase
    .from('person')
    .insert([
      {
        username,
        position: role,
        yearsofexperience: yearsOfExperience
          ? parseInt(yearsOfExperience)
          : null,
        nic,
      },
    ])
    .select()
    .single()

  if (personError) {
    return NextResponse.json(
      { error: personError.message },
      { status: 400 }
    )
  }

  // =====================================
  // 3. Insert into user table
  // =====================================
  const { data: userData, error: userError } = await supabase
    .from('user')
    .insert([
      {
        personid: personData.personid,
        username,
        email,
        role,
        avatarimage: avatarimage ?? null,
      },
    ])
    .select()
    .single()

  if (userError) {
    return NextResponse.json(
      { error: userError.message },
      { status: 400 }
    )
  }

  // =====================================
  // 4. Success
  // =====================================
  return NextResponse.json({
    message: 'Check your email to confirm your account.',
    authUser: authData.user,
    person: personData,
    user: userData,
  })
}