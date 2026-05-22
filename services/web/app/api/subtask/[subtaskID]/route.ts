import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"
import { mapSubtaskRow } from "@/lib/subtasks-db"

type RouteContext = {
  params: Promise<{ subtaskID: string }>
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { subtaskID } = await context.params
    const numericSubtaskId = Number(subtaskID)

    if (!Number.isInteger(numericSubtaskId) || numericSubtaskId <= 0) {
      return NextResponse.json({ error: "Invalid subtask id" }, { status: 400 })
    }

    const body = await req.json()

    if (typeof body.completed !== "boolean") {
      return NextResponse.json({ error: "completed (boolean) is required" }, { status: 400 })
    }

    const updatePayload: Record<string, unknown> = {
      completed: body.completed,
      updatedat: new Date().toISOString(),
    }

    if (body.completed) {
      updatePayload.completedat = new Date().toISOString()
    } else {
      updatePayload.completedat = null
    }

    const { data, error } = await supabase
      .from("subtask")
      .update(updatePayload)
      .eq("subtaskid", numericSubtaskId)
      .select(
        "subtaskid, activityid, title, duedate, completed, displayorder, completedat, createdat, updatedat"
      )
      .single()

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ error: "subtask table not found" }, { status: 503 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 })
    }

    const { data: activityRow } = await supabase
      .from("activity")
      .select("activityid, progress")
      .eq("activityid", data.activityid)
      .single()

    return NextResponse.json(
      {
        subtask: mapSubtaskRow(data, []),
        activity: activityRow
          ? { activityID: activityRow.activityid, progress: activityRow.progress }
          : null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("PATCH subtask error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
