import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"

type RouteContext = {
  params: Promise<{ projectID: string }>
}

type DbRow = Record<string, unknown>

function readString(row: DbRow, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "string" && value.trim().length > 0) return value.trim()
  }
  return fallback
}

function readBoolean(row: DbRow, keys: string[], fallback = true): boolean {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "boolean") return value
    if (value === 1 || value === "1" || value === "true") return true
    if (value === 0 || value === "0" || value === "false") return false
  }
  return fallback
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "??"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function presenceStatus(isAvailable: boolean, hasActivity: boolean): "online" | "away" | "offline" {
  if (!isAvailable) return "away"
  if (hasActivity) return "online"
  return "offline"
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { projectID } = await context.params
    const numericProjectId = Number(projectID)

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }

    const { data: workers, error: workersError } = await supabase
      .from("worker")
      .select("id, name, role, discipline, teamid, isavailable, project_id")
      .eq("project_id", numericProjectId)

    if (workersError) {
      return NextResponse.json({ error: workersError.message }, { status: 500 })
    }

    const workerRows = (workers ?? []) as DbRow[]
    const teamIds = [
      ...new Set(
        workerRows
          .map((w) => w.teamid)
          .filter((id): id is number => typeof id === "number" && id > 0)
      ),
    ]

    const teamById = new Map<number, DbRow>()
    const activityById = new Map<number, DbRow>()

    if (teamIds.length > 0) {
      const { data: teams, error: teamsError } = await supabase
        .from("workforce_team")
        .select("teamid, teamname, activityid")
        .in("teamid", teamIds)

      if (teamsError) {
        return NextResponse.json({ error: teamsError.message }, { status: 500 })
      }

      for (const team of (teams ?? []) as DbRow[]) {
        const teamId = team.teamid as number
        if (typeof teamId === "number") teamById.set(teamId, team)
      }

      const activityIds = [
        ...new Set(
          (teams ?? [])
            .map((t: DbRow) => t.activityid)
            .filter((id): id is number => typeof id === "number" && id > 0)
        ),
      ]

      if (activityIds.length > 0) {
        const { data: activities, error: activitiesError } = await supabase
          .from("activity")
          .select("activityid, name, markerlabel")
          .in("activityid", activityIds)

        if (activitiesError) {
          return NextResponse.json({ error: activitiesError.message }, { status: 500 })
        }

        for (const activity of (activities ?? []) as DbRow[]) {
          const activityId = activity.activityid as number
          if (typeof activityId === "number") activityById.set(activityId, activity)
        }
      }
    }

    const members = workerRows.map((row) => {
      const name = readString(row, ["name"], "Unknown Worker")
      const role = readString(row, ["role", "discipline"], "Worker")
      const teamId = row.teamid as number | null
      const team = typeof teamId === "number" ? teamById.get(teamId) : undefined
      const activityId = team?.activityid as number | null | undefined
      const activity =
        typeof activityId === "number" ? activityById.get(activityId) : undefined
      const activityName = activity
        ? readString(activity, ["name", "markerlabel"], "Unnamed activity")
        : null
      const teamName = team ? readString(team, ["teamname"], "") : ""
      const isAvailable = readBoolean(row, ["isavailable", "is_available"], true)

      let location = "Unassigned"
      if (activityName && teamName) {
        location = `${activityName} — ${teamName}`
      } else if (activityName) {
        location = activityName
      } else if (teamName) {
        location = teamName
      }

      return {
        id: String(row.id ?? ""),
        name,
        initials: initialsFromName(name),
        role,
        status: presenceStatus(isAvailable, !!activityName),
        location,
        activityId: activityId ?? null,
        teamId: teamId ?? null,
      }
    })

    const online = members.filter((m) => m.status === "online").length
    const away = members.filter((m) => m.status === "away").length

    return NextResponse.json(
      {
        summary: { online, away, total: members.length },
        members,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("GET workforce on-site error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
