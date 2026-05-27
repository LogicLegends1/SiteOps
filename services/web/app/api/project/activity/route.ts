import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"
import { mapSubtaskRow } from "@/lib/subtasks-db"

type SubtaskInput = {
  title: string
  duedate?: string | null
  displayorder?: number
}

type WorkerRequirementsInput = {
  tower_crane_operators?: unknown
  excavator_operators?: unknown
  crawler_crane_operators?: unknown
  tipper_drivers?: unknown
  surveyors?: unknown
  masons?: unknown
  carpenters?: unknown
  steel_fixers?: unknown
  electricians?: unknown
  general_labors?: unknown
  site_engineers?: unknown
}

const workerRequirementKeys = [
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

function toNonNegativeInt(value: unknown) {
  if (value === null || value === undefined) return 0
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  if (!Number.isInteger(value) || value < 0) return null
  return value
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Activity name is required" }, { status: 400 })
    }

    if (!body.projectid || !Number.isInteger(body.projectid) || body.projectid <= 0) {
      return NextResponse.json({ error: "Valid project ID is required" }, { status: 400 })
    }

    if (
      !body.status ||
      !["PENDING", "IN_PROGRESS", "PAUSED", "COMPLETED", "CANCELLED"].includes(body.status)
    ) {
      return NextResponse.json({ error: "Valid status is required" }, { status: 400 })
    }

    if (body.lat !== undefined && body.lat !== null && typeof body.lat !== "number") {
      return NextResponse.json({ error: "Latitude must be a number" }, { status: 400 })
    }

    if (body.lng !== undefined && body.lng !== null && typeof body.lng !== "number") {
      return NextResponse.json({ error: "Longitude must be a number" }, { status: 400 })
    }

    const description =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : body.name.trim()

    const insertData: Record<string, unknown> = {
      projectid: body.projectid,
      name: body.name.trim(),
      description,
      status: body.status,
      progress: 0,
    }

    if (body.lat !== undefined && body.lat !== null) insertData.lat = body.lat
    if (body.lng !== undefined && body.lng !== null) insertData.lng = body.lng
    if (body.deadline) insertData.deadline = body.deadline
    const { data, error } = await supabase
      .from("activity")
      .insert([insertData])
      .select(
        "activityid, projectid, name, description, status, progress, lat, lng, deadline"
      )
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const activityId = data.activityid as number

    // Worker requirements are mandatory: at least one role must be > 0
    const rawWorkerRequirements = (body.workerRequirements ?? null) as WorkerRequirementsInput | null
    if (!rawWorkerRequirements || typeof rawWorkerRequirements !== "object") {
      return NextResponse.json(
        { error: "Worker requirements are required" },
        { status: 400 }
      )
    }

    const workerInsert: Record<string, number> = {}
    let totalWorkers = 0
    for (const key of workerRequirementKeys) {
      const parsed = toNonNegativeInt((rawWorkerRequirements as Record<string, unknown>)[key])
      if (parsed === null) {
        return NextResponse.json(
          { error: `Worker requirement '${key}' must be a non-negative integer` },
          { status: 400 }
        )
      }
      workerInsert[key] = parsed
      totalWorkers += parsed
    }

    if (totalWorkers <= 0) {
      return NextResponse.json(
        { error: "At least one worker role must be specified" },
        { status: 400 }
      )
    }

    let workerRequirementsRow: Record<string, unknown> | null = null
    let workerRequirementsError: string | null = null

    const { data: wrData, error: wrError } = await supabase
      .from("activity_worker_requirements")
      .insert([
        {
          activity_id: activityId,
          ...workerInsert,
        },
      ])
      .select(
        "id, activity_id, tower_crane_operators, excavator_operators, crawler_crane_operators, tipper_drivers, surveyors, masons, carpenters, steel_fixers, electricians, general_labors, site_engineers"
      )
      .single()

    if (wrError) {
      workerRequirementsError = wrError.message
    } else {
      workerRequirementsRow = wrData
    }

    const subtaskInputs: SubtaskInput[] = Array.isArray(body.subtasks) ? body.subtasks : []
    const createdSubtasks = []

    if (subtaskInputs.length > 0) {
      const rows = subtaskInputs
        .filter((s) => typeof s.title === "string" && s.title.trim())
        .map((s, index) => ({
          activityid: activityId,
          title: s.title.trim(),
          duedate: s.duedate ?? null,
          completed: false,
          displayorder: s.displayorder ?? index + 1,
        }))

      if (rows.length > 0) {
        const { data: subtaskData, error: subtaskError } = await supabase
          .from("subtask")
          .insert(rows)
          .select(
            "subtaskid, activityid, title, duedate, completed, displayorder, completedat, createdat, updatedat"
          )

        if (subtaskError) {
          return NextResponse.json(
            {
              error:
                workerRequirementsError != null
                  ? `Activity created but worker requirements failed: ${workerRequirementsError}. Subtasks failed: ${subtaskError.message}`
                  : `Activity created but subtasks failed: ${subtaskError.message}`,
              activity: mapActivityRow(data),
              workerRequirements: workerRequirementsRow,
            },
            { status: 207 }
          )
        }

        for (const row of subtaskData ?? []) {
          createdSubtasks.push(mapSubtaskRow(row, []))
        }
      }
    }

    const { data: refreshedActivity } = await supabase
      .from("activity")
      .select("activityid, progress")
      .eq("activityid", activityId)
      .single()

    const activity = mapActivityRow(data)
    if (refreshedActivity?.progress != null) {
      activity.progress = refreshedActivity.progress
    }

    if (workerRequirementsError != null) {
      return NextResponse.json(
        {
          error: `Activity created but worker requirements failed: ${workerRequirementsError}`,
          activity,
          workerRequirements: workerRequirementsRow,
          subtasks: createdSubtasks,
        },
        { status: 207 }
      )
    }

    return NextResponse.json(
      { activity, workerRequirements: workerRequirementsRow, subtasks: createdSubtasks },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST activity error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function mapActivityRow(data: Record<string, unknown>) {
  return {
    zoneID: data.activityid,
    projectID: data.projectid,
    name: data.name,
    description: data.description,
    activity: data.description,
    status: data.status,
    progress: data.progress ?? 0,
    lat: data.lat != null ? Number(data.lat) : null,
    lng: data.lng != null ? Number(data.lng) : null,
    markerLabel: data.name as string,
    deadline: data.deadline ?? null,
    expectedCompletion: data.deadline ?? null,
  }
}
