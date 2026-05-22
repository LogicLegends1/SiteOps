import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/superbase/admin"
import { createClient } from "@/lib/superbase/server"

const BUCKET_NAME = "activity-evidence"
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]

type RouteContext = {
  params: Promise<{ subtaskID: string }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const admin = createAdminClient()
    const { subtaskID } = await context.params
    const numericSubtaskId = Number(subtaskID)

    if (!Number.isInteger(numericSubtaskId) || numericSubtaskId <= 0) {
      return NextResponse.json({ error: "Invalid subtask id" }, { status: 400 })
    }

    const { data: subtaskRow, error: subtaskError } = await supabase
      .from("subtask")
      .select("subtaskid, activityid")
      .eq("subtaskid", numericSubtaskId)
      .single()

    if (subtaskError || !subtaskRow) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 })
    }

    const activityId = subtaskRow.activityid as number
    const formData = await req.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PNG, JPG, WEBP" },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
    const filePath = `${activityId}/subtasks/${numericSubtaskId}/${Date.now()}-${safeFileName}`

    const { error: uploadError } = await admin.storage.from(BUCKET_NAME).upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const {
      data: { publicUrl },
    } = admin.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch (error) {
    console.error("Upload subtask evidence error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
