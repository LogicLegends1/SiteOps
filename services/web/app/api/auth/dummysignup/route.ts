import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      username,
      email,
      avatarimage,
      role,

      // person fields
      name,
      position,
      yearsofexperience,
      nic
    } = await req.json()

    // ✅ Validation
    if (!email || !name || !position || !nic) {
      return NextResponse.json(
        { error: 'Email, name, position, and NIC are required' },
        { status: 400 }
      )
    }

    // 🔹 1. Insert into PERSON first
    const { data: personData, error: personError } = await supabase
      .from('person')
      .insert([
        {
          name,
          position,
          yearsofexperience: yearsofexperience || null,
          nic,
        },
      ])
      .select()
      .single()

    if (personError) {
      return NextResponse.json(
        { error: personError.message },
        { status: 500 }
      )
    }

    // 🔹 2. Insert into USER with personid
    const { data: userData, error: userError } = await supabase
      .from('user')
      .insert([
        {
          username: username || null,
          email,
          avatarimage: avatarimage || null,
          role: role || 'SITE_ENGINEER',
          personid: personData.personid   // ✅ link here
        },
      ])
      .select()

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'User + Person created successfully',
        person: personData,
        user: userData
      },
      { status: 201 }
    )

  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}