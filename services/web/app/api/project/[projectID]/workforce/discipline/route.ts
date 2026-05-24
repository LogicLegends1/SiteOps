import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"

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

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { projectID } = await context.params
    const numericProjectId = Number(projectID)

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }

    const { data: projectRows, error: projectError } = await supabase
      .from("project")
      .select("projectid")
      .eq("projectid", numericProjectId)
      .limit(1)

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 400 })
    }

    if (!projectRows || projectRows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const { data: workerRowsRaw, error: workersError } = await supabase
      .from("worker")
      .select("discipline")
      .eq("project_id", numericProjectId)

    if (workersError) {
      return NextResponse.json({ error: workersError.message }, { status: 500 })
    }

    const workerRows = (workerRowsRaw ?? []) as DbRow[]
    const byDiscipline: Record<string, number> = {}

    for (const row of workerRows) {
      const discipline = readString(row, ["discipline"], "")
      if (!discipline) continue

      byDiscipline[discipline] = (byDiscipline[discipline] ?? 0) + 1
    }

    return NextResponse.json(
      {
        summary: {
          total: workerRows.length,
          byDiscipline,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("GET workforce discipline summary error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}