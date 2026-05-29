import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"
import {
  classifyExperienceLevel,
  type WorkforceResponse,
  type WorkforceTeam,
  type WorkforceWorker,
  type WorkerDiscipline,
  type WorkerRole,
  type WorkerStatus,
} from "@/lib/workforce-live"

type RouteContext = {
  params: Promise<{
    projectID: string
  }>
}

type DbRow = Record<string, unknown>

function readString(row: DbRow, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }
  }
  return fallback
}

function readBoolean(row: DbRow, keys: string[], fallback = true): boolean {
  for (const key of keys) {
    const value = row[key]

    if (typeof value === "boolean") {
      return value
    }

    if (typeof value === "number") {
      if (value === 1) return true
      if (value === 0) return false
    }

    if (typeof value === "string") {
      const normalized = value.toLowerCase().trim()
      if (normalized === "true" || normalized === "1") return true
      if (normalized === "false" || normalized === "0") return false
    }
  }

  return fallback
}

function readNullableString(row: DbRow, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "string") {
      const trimmed = value.trim()
      if (trimmed.length > 0) {
        return trimmed
      }
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value)
    }
  }
  return null
}

function readNumber(row: DbRow, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "number" && Number.isFinite(value)) {
      return value
    }

    if (typeof value === "string") {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }
  return fallback
}

function normalizeDiscipline(value: string): WorkerDiscipline {
  const normalized = value.toLowerCase().trim()

  // Support domain buckets used in the workforce UI.
  if (normalized.includes("heavy") || normalized.includes("equipment")) return "mechanical"
  if (normalized.includes("transport") || normalized.includes("driver")) return "general"
  if (normalized.includes("general construction")) return "general"
  if (normalized.includes("civil")) return "civil"
  if (normalized.includes("elect")) return "electrical"

  if (normalized.includes("mech")) return "mechanical"
  if (normalized.includes("qa") || normalized.includes("quality")) return "qa"
  if (normalized.includes("safety")) return "safety"
  if (normalized === "it") return "it"

  return "general"
}

function normalizeRole(value: string): WorkerRole {
  const normalized = value.toLowerCase().trim()

  if (normalized.includes("supervisor")) return "supervisor"
  if (normalized.includes("technician") || normalized.includes("tech")) return "technician"
  if (normalized.includes("operator")) return "operator"
  if (normalized.includes("skilled")) return "skilled-labour"
  if (normalized.includes("engineer")) return "engineer"
  if (normalized.includes("developer")) return "developer"
  if (normalized.includes("admin")) return "system-admin"

  return "general-labour"
}

function normalizeStatus(
  value: string,
  assignedTeamId: string | null,
  isAvailable: boolean
): WorkerStatus {
  if (!isAvailable) {
    return "unavailable"
  }

  const normalized = value.toLowerCase().trim()

  if (normalized === "unavailable") {
    return "unavailable"
  }

  return assignedTeamId ? "active" : "idle"
}

async function loadWorkers(supabase: Awaited<ReturnType<typeof createClient>>, projectId: number) {
  // Use the exact column name `project_id` for worker scoping per specification
  const scoped = await supabase.from("worker").select("*").eq("project_id", projectId)

  if (!scoped.error) {
    return scoped
  }

  // Fallback: return all rows if scoping fails to avoid breaking the UI in development
  return supabase.from("worker").select("*")
}

async function loadTeamsByIds(supabase: Awaited<ReturnType<typeof createClient>>, teamIds: string[]) {
  if (!teamIds || teamIds.length === 0) {
    return { data: [], error: null }
  }
  // Query teams by exact `teamid` column
  const scoped = await supabase.from("workforce_team").select("*").in("teamid", teamIds)
  if (!scoped.error) return scoped

  // Fallback: return all teams if the specific query fails
  return supabase.from("workforce_team").select("*")
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { projectID } = await context.params
    const numericProjectId = Number(projectID)

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }

    // Verify project exists — accept either `projectid` or `project_id` column names
    let projectData: any = null
    let projectError: any = null

    const check1 = await supabase.from("project").select("projectid").eq("projectid", numericProjectId).single()
    if (!check1.error && check1.data) {
      projectData = check1.data
    } else {
      const check2 = await supabase.from("project").select("project_id").eq("project_id", numericProjectId).single()
      if (!check2.error && check2.data) {
        projectData = check2.data
      } else {
        projectError = check1.error ?? check2.error
      }
    }

    if (projectError || !projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const workersQuery = await loadWorkers(supabase, numericProjectId)
    if (workersQuery.error) {
      return NextResponse.json({ error: workersQuery.error.message }, { status: 400 })
    }

    const workerRows = (workersQuery.data ?? []) as DbRow[]

    // Derive unique team ids from the worker rows for this project
    const teamIdCandidates = workerRows
      .map((r) => readNullableString(r, ["teamid"]))
      .filter((v): v is string => !!v)
    const uniqueTeamIds = Array.from(new Set(teamIdCandidates))

    const teamsQuery = await loadTeamsByIds(supabase, uniqueTeamIds)
    if (teamsQuery.error) {
      return NextResponse.json({ error: teamsQuery.error.message }, { status: 400 })
    }

    const teamRows = (teamsQuery.data ?? []) as DbRow[]

    const workers: WorkforceWorker[] = workerRows.map((row) => {
      const assignedTeamId = readNullableString(row, ["teamid"])
      const experienceYears = readNumber(row, ["experience"], 0)

      const disciplineRaw = readString(row, ["discipline", "specialization", "category", "position"], "general")
      const roleRaw = readString(row, ["role", "position", "jobtitle", "job_title"], "general-labour")
      const statusRaw = readString(row, ["status"], "")
      const isAvailable = readBoolean(row, ["isavailable", "is_available"], true)

      const workerId =
        readNullableString(row, ["workerid", "worker_id", "id", "personid", "person_id"]) ??
        ""

      return {
        id: workerId,
        name: readString(row, ["name", "workername", "full_name"], "Unknown Worker"),
        disciplineName: disciplineRaw,
        roleName: roleRaw,
        discipline: normalizeDiscipline(disciplineRaw),
        role: normalizeRole(roleRaw),
        experienceYears,
        experienceLevel: classifyExperienceLevel(experienceYears),
        status: normalizeStatus(statusRaw, assignedTeamId, isAvailable),
        assignedTeamId,
      }
    })

    const workerById = new Map(workers.map((worker) => [worker.id, worker]))

    const teams: WorkforceTeam[] = teamRows.map((row) => {
      const teamId = readNullableString(row, ["teamid", "id"]) ?? ""
      const leaderId = readNullableString(row, ["team_lead_id", "leaderid", "leader_id", "teamleaderid"])

      const memberIds = workers
        .filter((worker) => worker.assignedTeamId === teamId)
        .map((worker) => worker.id)

      return {
        id: teamId,
        name: readString(row, ["name", "teamname"], "Unnamed Team"),
        leaderId: leaderId && workerById.has(leaderId) ? leaderId : null,
        memberIds,
        createdAt: readNullableString(row, ["createdat", "created_at"]),
      }
    })

    const assignedCount = workers.filter((worker) => worker.status === "active").length
    const idleCount = workers.filter((worker) => worker.status === "idle").length
    const unavailableCount = workers.filter((worker) => worker.status === "unavailable").length

    const response: WorkforceResponse = {
      summary: {
        total: workers.length,
        assigned: assignedCount,
        idle: idleCount,
        unavailable: unavailableCount,
        teams: teams.length,
      },
      workers,
      teams,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("GET workforce error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
