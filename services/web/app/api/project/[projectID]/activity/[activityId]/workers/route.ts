import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"

type RouteContext = {
  params: Promise<{
    projectID: string
    activityId: string
  }>
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { projectID, activityId } = await context.params
    const numericProjectId = Number(projectID)
    const numericActivityId = Number(activityId)

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }
    if (!Number.isInteger(numericActivityId) || numericActivityId <= 0) {
      return NextResponse.json({ error: "Invalid activity id" }, { status: 400 })
    }

    // 1. Find teams assigned to this activity
    const { data: teams, error: teamsError } = await supabase
      .from("workforce_team")
      .select("teamid, teamname, team_lead_id")
      .eq("activityid", numericActivityId)

    if (teamsError) {
      return NextResponse.json({ error: teamsError.message }, { status: 500 })
    }

    const teamIds = (teams ?? []).map((t) => t.teamid).filter((id): id is number => typeof id === "number")

    if (teamIds.length === 0) {
      return NextResponse.json({ workers: [], roleCounts: {}, total: 0 }, { status: 200 })
    }

    // 2. Get all workers in those teams
    const { data: workers, error: workersError } = await supabase
      .from("worker")
      .select("id, name, role, discipline, experience, teamid, isavailable")
      .in("teamid", teamIds)

    if (workersError) {
      return NextResponse.json({ error: workersError.message }, { status: 500 })
    }

    const workerRows = workers ?? []

    // 3. Compute role counts
    const roleCounts: Record<string, number> = {}
    for (const w of workerRows) {
      const role = (w.role as string) || "other"
      roleCounts[role] = (roleCounts[role] || 0) + 1
    }

    // 4. Map workers to a clean response
    const mappedWorkers = workerRows.map((w) => ({
      id: w.id,
      name: w.name || "Unknown",
      role: w.role || "general-labour",
      discipline: w.discipline || "general",
      experience: w.experience || 0,
      teamId: w.teamid,
      teamName: teams?.find((t) => t.teamid === w.teamid)?.teamname || null,
      isAvailable: w.isavailable ?? true,
    }))

    return NextResponse.json(
      {
        workers: mappedWorkers,
        roleCounts,
        total: mappedWorkers.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("GET activity workers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
