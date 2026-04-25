import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/superbase/server'


const BUCKET_NAME = "site-maps"
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ zoneId: string }> }
) {
  try {
    const supabase = await createClient()
    const { zoneId } = await context.params
    const numericZoneId = Number(zoneId)

    if (!Number.isInteger(numericZoneId) || numericZoneId <= 0) {
      return NextResponse.json({ error: "Invalid activity id" }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    const { data: zone, error: zoneError } = await supabase
      .from("activity")
      .select("activityid, projectid")
      .eq("activityid", numericZoneId)
      .single()

    if (zoneError || !zone) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 })
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
    const filePath = `projects/${zone.projectid}/activities/${zone.activityid}/${Date.now()}-${safeFileName}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from("activity")
      .update({
        imagepath: filePath,
        imageurl: publicUrl,
      })
      .eq("activityid", numericZoneId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imagepath: filePath,
      imageurl: publicUrl,
    })
  } catch (error) {
    console.error("Upload activity image error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}