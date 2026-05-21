import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'
import { CurrentUserError, getCurrentDbUser } from '@/lib/superbase/current-user'

const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED']

export async function GET() {
  try {
    const supabase = await createClient()

    let projectsData: any = null
    let projectsError: any = null

    // TEMPORARY: Disabled role-based filtering for development to ensure projects are visible.
    const res = await supabase
      .from('project')
      .select('projectid, name, locationlongitude, locationlatitude, projectdiagram, status, projectdeadline')
    
    projectsData = res.data
    projectsError = res.error

    if (projectsError) {
      return NextResponse.json({ error: projectsError.message }, { status: 400 })
    }

    return NextResponse.json({ projects: projectsData ?? [] }, { status: 200 })
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
      projectdeadline?: string | null
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

    if (body.deadlineDate !== undefined) {
      if (body.deadlineDate !== null && typeof body.deadlineDate !== 'string') {
        return NextResponse.json({ error: 'deadlineDate must be a string (ISO date) or null' }, { status: 400 })
      }

      if (body.deadlineDate !== null && isNaN(Date.parse(body.deadlineDate))) {
        return NextResponse.json({ error: 'deadlineDate must be a valid date string' }, { status: 400 })
      }

      insertData.projectdeadline = body.deadlineDate ? body.deadlineDate : null
    }

    // Insert into database
    const { data, error } = await supabase
      .from('project')
      .insert([insertData])
      .select('projectid, name, locationlongitude, locationlatitude, projectdiagram, status, projectdeadline')
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
