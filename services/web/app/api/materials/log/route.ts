import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'
import { CurrentUserError, getCurrentDbUser } from '@/lib/superbase/current-user'

export async function POST(req: NextRequest) {
  try {
    const { materialId, quantity, activityId } = await req.json()
    const supabase = await createClient()

    const dbUser = await getCurrentDbUser(supabase)

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
    if (err instanceof CurrentUserError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }

    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
