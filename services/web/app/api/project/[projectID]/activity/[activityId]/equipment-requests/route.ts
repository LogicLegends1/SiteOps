import { NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"

type Params = { params: { projectID: string; activityId: string } }

export async function GET(_request: Request, { params }: Params) {
  const projectID = Number(params.projectID)
  const activityId = Number(params.activityId)

  if (Number.isNaN(projectID) || Number.isNaN(activityId)) {
    return NextResponse.json({ error: "Invalid project or activity id" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("equipment_requests")
    .select("*")
    .eq("activity_id", activityId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ requests: data ?? [] })
}

export async function POST(request: Request, { params }: Params) {
  const body = await request.json().catch(() => null)
  const projectID = Number(body?.projectID ?? body?.projectId ?? params.projectID)
  const activityId = Number(body?.activityId ?? body?.activityID ?? body?.zoneID ?? params.activityId)

  if (Number.isNaN(projectID) || Number.isNaN(activityId)) {
    return NextResponse.json({ error: "Invalid project or activity id" }, { status: 400 })
  }

  const rawDetails = typeof body?.details === "string" ? body.details.trim() : ""
  const items: Array<{ type?: string; quantity?: number }> = Array.isArray(body?.items) ? body.items : []

  let details = rawDetails
  let quantity: number | null = null

  if (items.length > 0) {
    if (!details) {
      details = items.map((item) => `${item.type ?? "item"} x${Number(item.quantity ?? 0)}`).join(", ")
    }

    const sum = items.reduce(
      (total, item) => total + (Number.isFinite(Number(item.quantity)) ? Math.max(0, Math.floor(Number(item.quantity))) : 0),
      0
    )
    quantity = sum > 0 ? sum : null
  } else {
    quantity = body?.quantity ? Number(body.quantity) : null
  }

  if (!details) {
    return NextResponse.json({ error: "Details are required" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("equipment_requests")
    .insert([
      {
        projectid: projectID,
        activity_id: activityId,
        details,
        quantity: Number.isFinite(quantity) ? Math.floor(quantity) : null,
      },
    ])
    .select()
    .limit(1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ request: data?.[0] ?? null }, { status: 201 })
}
