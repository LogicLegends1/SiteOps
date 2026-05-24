import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'
import { CurrentUserError, getCurrentDbUser } from '@/lib/superbase/current-user'

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ projectID: string }> }
) {
  try {
    const supabase = await createClient()
    const dbUser = await getCurrentDbUser(supabase)
    const { projectID } = await context.params
    const numericProjectId = Number(projectID)

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }

    if (dbUser.role !== 'OPERATION_MANAGER') {
      const { data: assignment, error: assignmentError } = await supabase
        .from('project_assignment')
        .select('assignmentid')
        .eq('projectid', numericProjectId)
        .eq('personid', dbUser.personid)
        .maybeSingle()

      if (assignmentError) {
        return NextResponse.json({ error: assignmentError.message }, { status: 500 })
      }

      if (!assignment) {
        return NextResponse.json({ error: "Project not found" }, { status: 403 })
      }
    }

    const { data, error } = await supabase
      .from("project")
      .select(`
        *
      `)
      .eq("projectid", numericProjectId)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }



    return NextResponse.json({ project: data })
  } catch (error) {
    if (error instanceof CurrentUserError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("Get project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(_req: NextRequest) {
  // TODO: Update a project by projectID.
  return NextResponse.json({ error: 'Not implemented yet.' }, { status: 501 })
}

export async function DELETE(_req: NextRequest) {
  // TODO: Delete a project by projectID.
  return NextResponse.json({ error: 'Not implemented yet.' }, { status: 501 })
}
