import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

export async function POST(req: NextRequest) {
  try {
    const { materialId, quantity, activityId } = await req.json()
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get internal user ID from the user table
    const { data: dbUser } = await supabase
      .from('user')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!dbUser) {
      return NextResponse.json({ error: "User record not found" }, { status: 404 })
    }

    // Insert the consumption log
    const { data, error } = await supabase
      .from('material_consumption_log')
      .insert([
        {
          materialid: parseInt(materialId),
          activityid: parseInt(activityId) || 1, // Fallback to 1 if no activity
          quantityused: parseFloat(quantity),
          loggedby: dbUser.id,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Log recorded successfully', data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
