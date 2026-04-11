import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

type RouteContext = {
  params: Promise<{
    projectID: string
  }>
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { projectID } = await context.params
    const numericProjectId = Number(projectID)

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: 'Invalid project id' }, { status: 400 })
    }

    const { data: projectData, error: projectError } = await supabase
      .from('project')
      .select('projectid')
      .eq('projectid', numericProjectId)
      .single()

    if (projectError || !projectData) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { data: assignments, error: assignmentError } = await supabase
      .from('project_assignment')
      .select('personid')
      .eq('projectid', numericProjectId)

    if (assignmentError) {
      return NextResponse.json({ error: assignmentError.message }, { status: 400 })
    }

    const personIds = (assignments ?? []).map((assignment) => assignment.personid)

    if (personIds.length === 0) {
      return NextResponse.json({ people: [] }, { status: 200 })
    }

    const { data: people, error: peopleError } = await supabase
      .from('person')
      .select('personid, name, position, yearsofexperience, nic')
      .in('personid', personIds)
      .order('personid', { ascending: true })

    if (peopleError) {
      return NextResponse.json({ error: peopleError.message }, { status: 400 })
    }

    return NextResponse.json({ people: people ?? [] }, { status: 200 })
  } catch (error) {
    console.error('GET assigned people error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
