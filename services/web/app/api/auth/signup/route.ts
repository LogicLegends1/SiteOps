
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

const VALID_ROLES = ['OPERATION_MANAGER', 'PROJECT_MANAGER', 'SITE_ENGINEER']

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

  // Validation
  if (!email || !password || !username || !role || !nic) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  if (typeof role !== 'string' || !VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: `Invalid role. Allowed roles: ${VALID_ROLES.join(', ')}` },
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

  // =====================================
  // 2. Insert into person table
  // =====================================
  const { data: personData, error: personError } = await supabase
    .from('person')
    .insert([
      {
        name: username,
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