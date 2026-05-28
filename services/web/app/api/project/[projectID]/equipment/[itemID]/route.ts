import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"

type RouteContext = {
  params: Promise<{
    projectID: string
    itemID: string
  }>
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { projectID, itemID } = await context.params
    const numericProjectId = Number(projectID)
    const numericItemId = Number(itemID)

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }
    if (!Number.isInteger(numericItemId) || numericItemId <= 0) {
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 })
    }

    const body = await req.json()
    const nextStatus = typeof body.status === "string" ? body.status : null
    if (!nextStatus) {
      return NextResponse.json({ error: "status (string) is required" }, { status: 400 })
    }

    const updatePayload: Record<string, unknown> = {
      status: nextStatus,
    }

    const { data, error } = await supabase
      .from("equipment_item")
      .update(updatePayload)
      .eq("itemid", numericItemId)
      .select("itemid, name, status, projectid, serial_number, created_at")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ item: data }, { status: 200 })
  } catch (error) {
    console.error("PATCH equipment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
