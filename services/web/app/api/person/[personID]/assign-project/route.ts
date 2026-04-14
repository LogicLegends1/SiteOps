import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

type RouteContext = {
  params: Promise<{
    personID: string
  }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { personID } = await context.params
    const numericPersonId = Number(personID)

    if (!Number.isInteger(numericPersonId) || numericPersonId <= 0) {
      return NextResponse.json({ error: 'Invalid person id' }, { status: 400 })
    }

    const body = await req.json()

    if (!body.projectID || typeof body.projectID !== 'number' || body.projectID <= 0) {
      return NextResponse.json({ error: 'projectID is required and must be a positive integer' }, { status: 400 })
    }

    // Verify person exists
    const { data: personData, error: personError } = await supabase
      .from('person')
      .select('personid')
      .eq('personid', numericPersonId)
      .single()

    if (personError || !personData) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    // Verify project exists
    const { data: projectData, error: projectError } = await supabase
      .from('project')
      .select('projectid')
      .eq('projectid', body.projectID)
      .single()

    if (projectError || !projectData) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Insert assignment
    const { data, error } = await supabase
      .from('project_assignment')
      .insert([
        {
          projectid: body.projectID,
          personid: numericPersonId,
        },
      ])
      .select()
      .single()

    if (error) {
      // Check if it's a unique constraint violation (already assigned)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Person is already assigned to this project' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        message: 'Person assigned to project successfully',
        personID: numericPersonId,
        projectID: body.projectID,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('POST assign person to project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
