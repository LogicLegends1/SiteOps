import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { username, email, avatarimage, role } = await req.json()

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Insert into "user" table
    const { data, error } = await supabase
      .from('user')   // table name
      .insert([
        {
          username: username || null,
          email,
          avatarimage: avatarimage || null,
          role: role || 'SITE_ENGINEER',
        },
      ])
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'User created successfully', data },
      { status: 201 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}