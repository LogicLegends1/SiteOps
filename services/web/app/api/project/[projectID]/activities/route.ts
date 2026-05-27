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

    const unassignedTeamOnlyParam = _req.nextUrl.searchParams.get("unassignedTeamOnly")
    const unassignedTeamOnly =
      unassignedTeamOnlyParam === "1" ||
      unassignedTeamOnlyParam?.toLowerCase() === "true" ||
      unassignedTeamOnlyParam?.toLowerCase() === "yes"

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }

    const { data: activities, error } = await supabase
      .from("activity")
      .select("*")
      .eq("projectid", numericProjectId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!unassignedTeamOnly) {
      return NextResponse.json({ activities }, { status: 200 })
    }

    const activityIds = (activities ?? [])
      .map((a: any) => {
        const raw = a?.activityid
        const parsed = typeof raw === "number" ? raw : Number(raw)
        return Number.isFinite(parsed) ? parsed : null
      })
      .filter((v: number | null): v is number => v != null)

    if (activityIds.length === 0) {
      return NextResponse.json({ activities: [] }, { status: 200 })
    }

    const { data: teams, error: teamsError } = await supabase
      .from("workforce_team")
      .select("activityid")
      .in("activityid", activityIds)

    if (teamsError) {
      return NextResponse.json({ error: teamsError.message }, { status: 400 })
    }

    const assignedActivityIds = new Set(
      (teams ?? [])
        .map((t: any) => {
          const raw = t?.activityid
          const parsed = typeof raw === "number" ? raw : Number(raw)
          return Number.isFinite(parsed) ? parsed : null
        })
        .filter((v: number | null): v is number => v != null)
    )

    const filtered = (activities ?? []).filter((a: any) => {
      const raw = a?.activityid
      const parsed = typeof raw === "number" ? raw : Number(raw)
      return Number.isFinite(parsed) && !assignedActivityIds.has(parsed)
    })

    return NextResponse.json({ activities: filtered }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}