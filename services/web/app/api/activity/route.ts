import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId') || '1'

  const { data, error } = await supabase
    .from('activity')
    .select('*')
    .eq('projectid', projectId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(_req: NextRequest) {
  // TODO: Create an activity in the backend service.
  return NextResponse.json({ error: 'Not implemented yet.' }, { status: 501 })
}
