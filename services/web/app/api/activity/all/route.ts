import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const projectID = request.nextUrl.searchParams.get('projectID')

    if (!projectID) {
      return NextResponse.json({ error: 'projectID is required' }, { status: 400 })
    }

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

    const { data, error } = await supabase
      .from('activity')
      .select('activityid, projectid, progress, description, status')
      .eq('projectid', numericProjectId)
      .order('activityid', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ activities: data ?? [] }, { status: 200 })
  } catch (error) {
    console.error('GET all activities error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
