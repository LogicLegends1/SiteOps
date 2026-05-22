import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"
import { groupSubtasksByActivity } from "@/lib/subtasks-db"

type RouteContext = {
  params: Promise<{ projectID: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { projectID } = await context.params
    const numericProjectId = Number(projectID)

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }

    const { data: activities, error: activitiesError } = await supabase
      .from("activity")
      .select("activityid")
      .eq("projectid", numericProjectId)

    if (activitiesError) {
      return NextResponse.json({ error: activitiesError.message }, { status: 500 })
    }

    const activityIds = (activities ?? []).map((a: { activityid: number }) => a.activityid)

    if (activityIds.length === 0) {
      return NextResponse.json({ subtasksByActivity: {} }, { status: 200 })
    }

    const { data: subtaskRows, error: subtasksError } = await supabase
      .from("subtask")
      .select(
        "subtaskid, activityid, title, duedate, completed, displayorder, completedat, createdat, updatedat"
      )
      .in("activityid", activityIds)
      .order("displayorder", { ascending: true })

    if (subtasksError) {
      if (subtasksError.code === "42P01") {
        return NextResponse.json(
          { error: "subtask table not found — run migration 008_site_progress_subtasks.sql" },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: subtasksError.message }, { status: 500 })
    }

    const subtaskIds = (subtaskRows ?? []).map((s: { subtaskid: number }) => s.subtaskid)
    let logRows: Record<string, unknown>[] = []

    if (subtaskIds.length > 0) {
      const { data: logs, error: logsError } = await supabase
        .from("subtask_log_entry")
        .select("logentryid, subtaskid, description, createdby, evidencephoto, createdat")
        .in("subtaskid", subtaskIds)
        .order("createdat", { ascending: false })

      if (logsError) {
        if (logsError.code !== "42P01") {
          return NextResponse.json({ error: logsError.message }, { status: 500 })
        }
      } else {
        logRows = logs ?? []
      }
    }

    const engineerIds = [
      ...new Set(
        logRows
          .map((l) => l.createdby as number | null)
          .filter((id): id is number => typeof id === "number" && id > 0)
      ),
    ]

    const engineerNames = new Map<number, string>()
    if (engineerIds.length > 0) {
      const { data: users } = await supabase
        .from("user")
        .select("id, username")
        .in("id", engineerIds)

      for (const user of users ?? []) {
        engineerNames.set(user.id, user.username ?? "Site Engineer")
      }
    }

    const subtasksByActivity = groupSubtasksByActivity(
      subtaskRows ?? [],
      logRows,
      engineerNames
    )

    return NextResponse.json({ subtasksByActivity }, { status: 200 })
  } catch (error) {
    console.error("GET project subtasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
