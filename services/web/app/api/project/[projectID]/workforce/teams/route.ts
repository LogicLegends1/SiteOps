import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"

type RouteContext = {
  params: Promise<{
    projectID: string
  }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { projectID } = await context.params
    const numericProjectId = Number(projectID)

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }

    const body = await req.json()
    const { teamname, activityid, team_lead_id, workerIds } = body

    if (!teamname || !Array.isArray(workerIds)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 1. Insert into workforce_team
    const { data: teamData, error: teamError } = await supabase
      .from("workforce_team")
      .insert({
        teamname,
        activityid: activityid || null,
        team_lead_id: team_lead_id || null,
      })
      .select("teamid")
      .single()

    if (teamError) {
      console.error("Error creating team:", teamError)
      return NextResponse.json({ error: teamError.message }, { status: 400 })
    }

    const generatedTeamId = teamData.teamid

    // 2. Update workers with the new teamid
    if (workerIds.length > 0) {
      const { error: workerError } = await supabase
        .from("worker")
        .update({ teamid: generatedTeamId })
        .in("id", workerIds)

      if (workerError) {
        console.error("Error updating workers:", workerError)
        return NextResponse.json({ error: workerError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true, teamid: generatedTeamId }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}