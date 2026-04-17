import { NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('person')
      .select('personid, name, position, yearsofexperience, nic')
      .order('personid', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ people: data ?? [] }, { status: 200 })
  } catch (error) {
    console.error('GET all people error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
