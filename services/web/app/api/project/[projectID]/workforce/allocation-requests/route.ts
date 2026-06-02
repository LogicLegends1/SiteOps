import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/superbase/admin"
import {
  WORKER_REQUEST_ROLE_KEYS,
  workerRequestRoleLabels,
  type WorkerAllocationRequest,
  type WorkerAllocationRequestResponse,
} from "@/lib/workforce-live"

type RouteContext = {
  params: Promise<{
    projectID: string
  }>
}

type DbRow = Record<string, unknown>

function toInt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value)
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return Math.trunc(parsed)
  }
  return 0
}

function readString(row: DbRow, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
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

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const supabase = createAdminClient()
    const { projectID } = await context.params
    const numericProjectId = Number(projectID)

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }

    const { data: activityRowsRaw, error: activityError } = await supabase
      .from("activity")
      .select("activityid, name, description, status, projectid")
      .eq("projectid", numericProjectId)

    if (activityError) {
      return NextResponse.json({ error: activityError.message }, { status: 400 })
    }

    const activityRows = (activityRowsRaw ?? []) as DbRow[]
    const activityById = new Map<number, DbRow>()

    for (const row of activityRows) {
      const activityId = toInt(row.activityid)
      if (activityId > 0) {
        activityById.set(activityId, row)
      }
    }

    const activityIds = Array.from(activityById.keys())

    if (activityIds.length === 0) {
      const emptyResponse: WorkerAllocationRequestResponse = {
        summary: { pendingRequests: 0, activities: 0, totalRequested: 0 },
        requests: [],
      }

      return NextResponse.json(emptyResponse, { status: 200 })
    }

    const requestSelect = ["id", "activity_id", ...WORKER_REQUEST_ROLE_KEYS, "is_allocated"].join(",")

    const { data: requestRowsRaw, error: requestError } = await supabase
      .from("activity_worker_requests")
      .select(requestSelect)
      .in("activity_id", activityIds)
      .eq("is_allocated", false)
      .order("id", { ascending: false })

    if (requestError) {
      return NextResponse.json({ error: requestError.message }, { status: 400 })
    }

    const requestRows = (requestRowsRaw ?? []) as DbRow[]
    const requests: WorkerAllocationRequest[] = []

    for (const row of requestRows) {
      const activityId = toInt(row.activity_id)
      const activity = activityById.get(activityId)

      if (!activity) continue

      const roles = WORKER_REQUEST_ROLE_KEYS.map((key) => {
        const count = Math.max(0, toInt(row[key]))
        return {
          key,
          label: workerRequestRoleLabels[key],
          count,
        }
      }).filter((role) => role.count > 0)

      const totalRequested = roles.reduce((sum, role) => sum + role.count, 0)
      if (totalRequested <= 0) continue

      requests.push({
        id: toInt(row.id),
        activityId,
        activityName: readString(activity, ["name"], ""),
        activityDescription: readString(activity, ["description"], ""),
        activityStatus: readNullableString(activity, ["status"]),
        totalRequested,
        roles,
      })
    }

    requests.sort((a, b) => {
      const totalDiff = b.totalRequested - a.totalRequested
      if (totalDiff !== 0) return totalDiff
      const activityDiff = a.activityName.localeCompare(b.activityName)
      if (activityDiff !== 0) return activityDiff
      return b.id - a.id
    })

    const response: WorkerAllocationRequestResponse = {
      summary: {
        pendingRequests: requests.length,
        activities: new Set(requests.map((request) => request.activityId)).size,
        totalRequested: requests.reduce((sum, request) => sum + request.totalRequested, 0),
      },
      requests,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("GET worker allocation requests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}