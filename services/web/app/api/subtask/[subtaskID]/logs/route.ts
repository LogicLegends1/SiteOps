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

    const insertPayload: Record<string, unknown> = {
      subtaskid: numericSubtaskId,
      description: body.description.trim(),
      createdby: dbUser.id,
    }

    if (typeof body.evidencePhoto === "string" && body.evidencePhoto.trim()) {
      insertPayload.evidencephoto = body.evidencePhoto.trim()
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

    return NextResponse.json(
      {
        log: mapSubtaskLogRow(data, dbUser.username ?? "Site Engineer"),
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
