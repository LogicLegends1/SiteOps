import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'
import { CurrentUserError, getCurrentDbUser } from '@/lib/superbase/current-user'

const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED']

export async function GET() {
  try {
    const supabase = await createClient()

    const dbUser = await getCurrentDbUser(supabase)

    const { data, error } = await supabase.rpc('get_projects_assigned_to_person', {
      p_person_id: dbUser.personid,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ projects: data ?? [] }, { status: 200 })
  } catch (error) {
    if (error instanceof CurrentUserError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('GET project list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Project name is required and must be a non-empty string' }, { status: 400 })
    }

    if (!body.status || typeof body.status !== 'string' || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Status is required and must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    // Build insert data
    const insertData: {
      name: string
      status: string
      locationlongitude?: number | null
      locationlatitude?: number | null
      projectdiagram?: string | null
    } = {
      name: body.name.trim(),
      status: body.status,
    }

    // Validate and add optional fields
    if (body.locationLongitude !== undefined) {
      if (body.locationLongitude !== null && typeof body.locationLongitude !== 'number') {
        return NextResponse.json({ error: 'locationLongitude must be a number or null' }, { status: 400 })
      }
      insertData.locationlongitude = body.locationLongitude
    }

    if (body.locationLatitude !== undefined) {
      if (body.locationLatitude !== null && typeof body.locationLatitude !== 'number') {
        return NextResponse.json({ error: 'locationLatitude must be a number or null' }, { status: 400 })
      }
      insertData.locationlatitude = body.locationLatitude
    }

    if (body.projectDiagram !== undefined) {
      if (body.projectDiagram !== null && typeof body.projectDiagram !== 'string') {
        return NextResponse.json({ error: 'projectDiagram must be a string or null' }, { status: 400 })
      }
      insertData.projectdiagram = body.projectDiagram ? body.projectDiagram.trim() : null
    }

    // Insert into database
    const { data, error } = await supabase
      .from('project')
      .insert([insertData])
      .select('projectid, name, locationlongitude, locationlatitude, projectdiagram, status')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ project: data }, { status: 201 })
  } catch (error) {
    console.error('POST project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
