import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ projectID: string }> }
) {
  try {
    const supabase = await createClient()
    const { projectID } = await context.params
    const numericProjectId = Number(projectID)

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("project")
      .select(`
        projectid,
        name,
        locationlatitude,
        locationlongitude
      `)
      .eq("projectid", numericProjectId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const project = {
      projectID: data.projectid,
      name: data.name,
      locationLatitude: Number(data.locationlatitude ?? 6.9271),
      locationLongitude: Number(data.locationlongitude ?? 80.7789),
    }

    return NextResponse.json({ project })
  } catch (error) {
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
