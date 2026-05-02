import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"

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
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }

    const { data: activities, error } = await supabase
      .from("activity")
      .select("activityid, projectid, description, status")
      .eq("projectid", numericProjectId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ activities }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}