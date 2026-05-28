import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"
import { CurrentUserError, getCurrentDbUser } from "@/lib/superbase/current-user"

type RouteContext = {
  params: Promise<{
    projectID: string
    activityId: string
  }>
}

const REQUIREMENT_FIELDS = [
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

type RequirementKey = (typeof REQUIREMENT_FIELDS)[number]
type RequirementInput = Partial<Record<RequirementKey, unknown>>

const REQUIREMENTS_SELECT =
  "id, activity_id, tower_crane_operators, excavator_operators, crawler_crane_operators, tipper_drivers, surveyors, masons, carpenters, steel_fixers, electricians, general_labors, site_engineers, request_notes, requested_by, created_at"
const LEGACY_REQUIREMENTS_SELECT =
  "id, activity_id, tower_crane_operators, excavator_operators, crawler_crane_operators, tipper_drivers, surveyors, masons, carpenters, steel_fixers, electricians, general_labors, site_engineers"

function toNonNegativeInt(value: unknown) {
  if (value === null || value === undefined || value === "") return 0
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) return null
  return parsed
}

function mapRequirementsRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    activityId: row.activity_id,
    tower_crane_operators: row.tower_crane_operators ?? 0,
    excavator_operators: row.excavator_operators ?? 0,
    crawler_crane_operators: row.crawler_crane_operators ?? 0,
    tipper_drivers: row.tipper_drivers ?? 0,
    surveyors: row.surveyors ?? 0,
    masons: row.masons ?? 0,
    carpenters: row.carpenters ?? 0,
    steel_fixers: row.steel_fixers ?? 0,
    electricians: row.electricians ?? 0,
    general_labors: row.general_labors ?? 0,
    site_engineers: row.site_engineers ?? 0,
    requestNotes: row.request_notes ?? null,
    requestedBy: row.requested_by ?? null,
    requestedByName: row.requestedByName ?? null,
    createdAt: row.created_at ?? null,
  }
}

function normalizeRequirements(input: RequirementInput) {
  const values: Record<RequirementKey, number> = {
    tower_crane_operators: 0,
    excavator_operators: 0,
    crawler_crane_operators: 0,
    tipper_drivers: 0,
    surveyors: 0,
    masons: 0,
    carpenters: 0,
    steel_fixers: 0,
    electricians: 0,
    general_labors: 0,
    site_engineers: 0,
  }

  let total = 0
  for (const key of REQUIREMENT_FIELDS) {
    const parsed = toNonNegativeInt(input[key])
    if (parsed === null) {
      return { error: `Worker requirement '${key}' must be a non-negative integer` }
    }
    values[key] = parsed
    total += parsed
  }

  if (total <= 0) {
    return { error: "At least one worker role must be specified" }
  }

  return { values, total }
}

async function getRequirements(supabase: Awaited<ReturnType<typeof createClient>>, activityId: number) {
  const response = await supabase
    .from("activity_worker_requirements")
    .select(REQUIREMENTS_SELECT)
    .eq("activity_id", activityId)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle()
  let data: Record<string, unknown> | null = response.data
  let error = response.error

  if (error?.code === "42703") {
    const legacy = await supabase
      .from("activity_worker_requirements")
      .select(LEGACY_REQUIREMENTS_SELECT)
      .eq("activity_id", activityId)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle()
    data = legacy.data
    error = legacy.error
  }

  if (error) {
    return { error: error.message as string }
  }

  if (!data) return { requirements: null }

  let requestedByName: string | null = null
  const requestedBy = Number((data as Record<string, unknown>).requested_by)
  if (Number.isInteger(requestedBy) && requestedBy > 0) {
    const { data: userRow } = await supabase
      .from("user")
      .select("username")
      .eq("id", requestedBy)
      .maybeSingle()
    requestedByName = userRow?.username ?? null
  }

  return { requirements: mapRequirementsRow({ ...data, requestedByName }) }
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

    const { requirements, error } = await getRequirements(supabase, numericActivityId)
    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ requirements }, { status: 200 })
  } catch (error) {
    console.error("GET worker requirements error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
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

    const body = await req.json()
    const dbUser = await getCurrentDbUser(supabase)
    const rawWorkerRequirements = (body.workerRequirements ?? body) as RequirementInput
    const requestNotes =
      typeof body.requestNotes === "string"
        ? body.requestNotes.trim()
        : typeof body.notes === "string"
        ? body.notes.trim()
        : ""
    const normalized = normalizeRequirements(rawWorkerRequirements)

    if ("error" in normalized) {
      return NextResponse.json({ error: normalized.error }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from("activity_worker_requirements")
      .delete()
      .eq("activity_id", numericActivityId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    const response = await supabase
      .from("activity_worker_requirements")
      .insert([
        {
          activity_id: numericActivityId,
          ...normalized.values,
          request_notes: requestNotes || null,
          requested_by: dbUser.id,
        },
      ])
      .select(REQUIREMENTS_SELECT)
      .single()
    let data: Record<string, unknown> | null = response.data
    let error = response.error

    if (error?.code === "42703") {
      const legacy = await supabase
        .from("activity_worker_requirements")
        .insert([
          {
            activity_id: numericActivityId,
            ...normalized.values,
          },
        ])
        .select(LEGACY_REQUIREMENTS_SELECT)
        .single()
      data = legacy.data
      error = legacy.error
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { requirements: mapRequirementsRow({ ...data, requestedByName: dbUser.username ?? null }) },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof CurrentUserError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("POST worker requirements error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
