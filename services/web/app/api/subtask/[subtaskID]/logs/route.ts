import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"
import { CurrentUserError, getCurrentDbUser } from "@/lib/superbase/current-user"
import { mapSubtaskLogRow } from "@/lib/subtasks-db"

type RouteContext = {
  params: Promise<{ subtaskID: string }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { subtaskID } = await context.params
    const numericSubtaskId = Number(subtaskID)

    if (!Number.isInteger(numericSubtaskId) || numericSubtaskId <= 0) {
      return NextResponse.json({ error: "Invalid subtask id" }, { status: 400 })
    }

    const dbUser = await getCurrentDbUser(supabase)
    const body = await req.json()

    if (typeof body.description !== "string" || !body.description.trim()) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    const { data: subtaskRow, error: subtaskError } = await supabase
      .from("subtask")
      .select("subtaskid")
      .eq("subtaskid", numericSubtaskId)
      .single()

    if (subtaskError || !subtaskRow) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 })
    }

    const photoUrls: string[] = Array.isArray(body.photoUrls)
      ? body.photoUrls.filter((u: unknown) => typeof u === "string" && u.trim()).map((u: string) => u.trim())
      : []

    const insertPayload: Record<string, unknown> = {
      subtaskid: numericSubtaskId,
      description: body.description.trim(),
      createdby: dbUser.id,
    }

    if (photoUrls.length > 0) {
      insertPayload.evidencephoto = photoUrls[0]
    }

    const { data, error } = await supabase
      .from("subtask_log_entry")
      .insert(insertPayload)
      .select("logentryid, subtaskid, description, createdby, evidencephoto, createdat")
      .single()

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ error: "subtask_log_entry table not found" }, { status: 503 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const logEntryId = data.logentryid as number
    const extraPhotos = photoUrls.slice(1)

    if (extraPhotos.length > 0) {
      const photoInserts = extraPhotos.map((url) => ({
        logentryid: logEntryId,
        photourl: url,
      }))
      await supabase.from("subtask_log_photos").insert(photoInserts)
    }

    return NextResponse.json(
      {
        log: mapSubtaskLogRow(data, dbUser.username ?? "Site Engineer", extraPhotos),
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof CurrentUserError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("POST subtask log error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
