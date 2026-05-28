import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"

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
  const { data, error } = await supabase
    .from("activity_worker_requirements")
    .select(
      "id, activity_id, tower_crane_operators, excavator_operators, crawler_crane_operators, tipper_drivers, surveyors, masons, carpenters, steel_fixers, electricians, general_labors, site_engineers"
    )
    .eq("activity_id", activityId)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return { error: error.message as string }
  }

  return { requirements: data ? mapRequirementsRow(data) : null }
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
    const rawWorkerRequirements = (body.workerRequirements ?? body) as RequirementInput
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

    const { data, error } = await supabase
      .from("activity_worker_requirements")
      .insert([
        {
          activity_id: numericActivityId,
          ...normalized.values,
        },
      ])
      .select(
        "id, activity_id, tower_crane_operators, excavator_operators, crawler_crane_operators, tipper_drivers, surveyors, masons, carpenters, steel_fixers, electricians, general_labors, site_engineers"
      )
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ requirements: mapRequirementsRow(data) }, { status: 201 })
  } catch (error) {
    console.error("POST worker requirements error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
