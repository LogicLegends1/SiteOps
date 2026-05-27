import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"

type RouteContext = {
  params: Promise<{
    projectID: string
  }>
}

type DbRow = Record<string, any>

type GapStatus = "understaffed" | "overstaffed" | "ok" | "no-requirements"

type RoleGap = {
  role: string
  required: number
  assigned: number
  delta: number
}

type ActivityAlert = {
  activityid: number
  description: string
  status: string | null
  team: { teamid: number; teamname: string } | null
  totals: {
    required: number
    assigned: number
    missing: number
    extra: number
  }
  statusSummary: GapStatus
  gapsByRole: RoleGap[]
}

const REQUIREMENT_ROLE_COLUMNS = [
  "tower_crane_operators",
  "excavator_operators",
  "crawler_crane_operators",
  "tipper_drivers",
  "surveyors",
  "masons",
  "carpenters",
  "steel_fixers",
  "electricians",
  "general_labors",
  "site_engineers",
] as const

type RequirementRoleColumn = (typeof REQUIREMENT_ROLE_COLUMNS)[number]

function toInt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value)
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return Math.trunc(parsed)
  }
  return 0
}

function normalizeRoleKey(role: unknown): string {
  return (typeof role === "string" ? role : "").trim().toLowerCase()
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { projectID } = await context.params
    const numericProjectId = Number(projectID)

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }

    const { data: activityRowsRaw, error: activitiesError } = await supabase
      .from("activity")
      .select("activityid, description, status")
      .eq("projectid", numericProjectId)

    if (activitiesError) {
      return NextResponse.json({ error: activitiesError.message }, { status: 400 })
    }

    const activityRows = (activityRowsRaw ?? []) as DbRow[]
    const activityIds = activityRows
      .map((a) => toInt(a.activityid))
      .filter((id) => Number.isInteger(id) && id > 0)

    if (activityIds.length === 0) {
      return NextResponse.json({ activities: [] }, { status: 200 })
    }

    // Fetch teams assigned to those activities (0/1 team per activity per user clarification)
    const { data: teamRowsRaw, error: teamsError } = await supabase
      .from("workforce_team")
      .select("teamid, teamname, activityid")
      .in("activityid", activityIds)

    if (teamsError) {
      return NextResponse.json({ error: teamsError.message }, { status: 400 })
    }

    const teamRows = (teamRowsRaw ?? []) as DbRow[]
    const teamByActivityId = new Map<number, { teamid: number; teamname: string }>()

    for (const row of teamRows) {
      const actId = toInt(row.activityid)
      const teamid = toInt(row.teamid)
      const teamname = typeof row.teamname === "string" ? row.teamname : ""
      if (actId > 0 && teamid > 0) {
        teamByActivityId.set(actId, { teamid, teamname: teamname || `Team ${teamid}` })
      }
    }

    // Only show activities which have a team (per user requirement)
    const activitiesWithTeams = activityRows
      .map((row) => {
        const activityid = toInt(row.activityid)
        return {
          activityid,
          description: typeof row.description === "string" ? row.description : "",
          status: typeof row.status === "string" ? row.status : null,
          team: teamByActivityId.get(activityid) ?? null,
        }
      })
      .filter((a) => a.activityid > 0 && a.team)

    if (activitiesWithTeams.length === 0) {
      return NextResponse.json({ activities: [] }, { status: 200 })
    }

    const teamIds = Array.from(new Set(activitiesWithTeams.map((a) => a.team!.teamid)))

    // Requirements per activity
    const { data: reqRowsRaw, error: reqError } = await supabase
      .from("activity_worker_requirements")
      .select(["activity_id", ...REQUIREMENT_ROLE_COLUMNS].join(","))
      .in(
        "activity_id",
        activitiesWithTeams.map((a) => a.activityid)
      )

    if (reqError) {
      return NextResponse.json({ error: reqError.message }, { status: 400 })
    }

    const reqRows = (reqRowsRaw ?? []) as DbRow[]
    const reqByActivityId = new Map<number, DbRow>()

    for (const row of reqRows) {
      const actId = toInt(row.activity_id)
      if (actId > 0) {
        reqByActivityId.set(actId, row)
      }
    }

    // Actual assigned workers by team id
    const { data: workerRowsRaw, error: workersError } = await supabase
      .from("worker")
      .select("id, teamid, role")
      .in("teamid", teamIds)
      .eq("project_id", numericProjectId)

    if (workersError) {
      return NextResponse.json({ error: workersError.message }, { status: 400 })
    }

    const workerRows = (workerRowsRaw ?? []) as DbRow[]
    const roleCountsByTeamId = new Map<number, Map<string, number>>()

    for (const row of workerRows) {
      const teamid = toInt(row.teamid)
      if (teamid <= 0) continue
      const roleKey = normalizeRoleKey(row.role)
      if (!roleKey) continue

      if (!roleCountsByTeamId.has(teamid)) roleCountsByTeamId.set(teamid, new Map())
      const roleCounts = roleCountsByTeamId.get(teamid)!
      roleCounts.set(roleKey, (roleCounts.get(roleKey) ?? 0) + 1)
    }

    const alerts: ActivityAlert[] = activitiesWithTeams.map((activity) => {
      const req = reqByActivityId.get(activity.activityid)
      const team = activity.team!
      const counts = roleCountsByTeamId.get(team.teamid) ?? new Map<string, number>()

      if (!req) {
        const assignedTotal = Array.from(counts.values()).reduce((sum, v) => sum + v, 0)
        return {
          activityid: activity.activityid,
          description: activity.description,
          status: activity.status,
          team,
          totals: {
            required: 0,
            assigned: assignedTotal,
            missing: 0,
            extra: 0,
          },
          statusSummary: "no-requirements",
          gapsByRole: [],
        }
      }

      const gapsByRole: RoleGap[] = REQUIREMENT_ROLE_COLUMNS.map((col) => {
        const role = col as RequirementRoleColumn
        const required = Math.max(0, toInt(req[role]))
        const assigned = Math.max(0, toInt(counts.get(role) ?? 0))
        return {
          role,
          required,
          assigned,
          delta: assigned - required,
        }
      })

      const requiredTotal = gapsByRole.reduce((sum, g) => sum + g.required, 0)
      const assignedTotal = gapsByRole.reduce((sum, g) => sum + g.assigned, 0)
      const missingTotal = gapsByRole.reduce((sum, g) => sum + (g.assigned < g.required ? g.required - g.assigned : 0), 0)
      const extraTotal = gapsByRole.reduce((sum, g) => sum + (g.assigned > g.required ? g.assigned - g.required : 0), 0)

      let statusSummary: GapStatus = "ok"
      if (missingTotal > 0) statusSummary = "understaffed"
      else if (extraTotal > 0) statusSummary = "overstaffed"

      return {
        activityid: activity.activityid,
        description: activity.description,
        status: activity.status,
        team,
        totals: {
          required: requiredTotal,
          assigned: assignedTotal,
          missing: missingTotal,
          extra: extraTotal,
        },
        statusSummary,
        gapsByRole,
      }
    })

    // Sort: biggest missing first, then biggest extra, then name
    alerts.sort((a, b) => {
      const missingDiff = b.totals.missing - a.totals.missing
      if (missingDiff !== 0) return missingDiff
      const extraDiff = b.totals.extra - a.totals.extra
      if (extraDiff !== 0) return extraDiff
      return a.description.localeCompare(b.description)
    })

    return NextResponse.json({ activities: alerts }, { status: 200 })
  } catch (error) {
    console.error("GET workforce allocation alerts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
