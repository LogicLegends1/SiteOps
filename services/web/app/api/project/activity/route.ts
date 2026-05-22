import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"
import { mapSubtaskRow } from "@/lib/subtasks-db"

type SubtaskInput = {
  title: string
  duedate?: string | null
  displayorder?: number
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
    if (body.markerlabel) insertData.markerlabel = body.markerlabel

    const { data, error } = await supabase
      .from("activity")
      .insert([insertData])
      .select(
        "activityid, projectid, name, description, status, progress, lat, lng, markerlabel, deadline"
      )
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const activityId = data.activityid as number
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
              error: `Activity created but subtasks failed: ${subtaskError.message}`,
              activity: mapActivityRow(data),
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

    return NextResponse.json({ activity, subtasks: createdSubtasks }, { status: 201 })
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
    markerLabel: data.markerlabel || data.name,
    deadline: data.deadline ?? null,
    expectedCompletion: data.deadline ?? null,
  }
}
