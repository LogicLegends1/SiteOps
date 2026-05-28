import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"
import { CurrentUserError, getCurrentDbUser } from "@/lib/superbase/current-user"

type RouteContext = {
  params: Promise<{
    projectID: string
    activityId: string
  }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { projectID: rawProjectID, activityId: rawActivityId } = await context.params
  const projectID = Number(rawProjectID)
  const activityId = Number(rawActivityId)

  if (Number.isNaN(projectID) || Number.isNaN(activityId)) {
    return NextResponse.json({ error: "Invalid project or activity id" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("equipment_requests")
    .select("*")
    .eq("projectid", projectID)
    .eq("activity_id", activityId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = data ?? []
  const requestedByIds = Array.from(
    new Set(
      rows
        .map((row) => Number(row.requested_by))
        .filter((id) => Number.isInteger(id) && id > 0)
    )
  )
  const userNames = new Map<number, string>()

  if (requestedByIds.length > 0) {
    const { data: users } = await supabase
      .from("user")
      .select("id, username")
      .in("id", requestedByIds)

    for (const user of users ?? []) {
      userNames.set(Number(user.id), user.username ?? "User")
    }
  }

  return NextResponse.json({
    requests: rows.map((row) => ({
      ...row,
      requestedBy: row.requested_by ?? null,
      requestedByName: userNames.get(Number(row.requested_by)) ?? null,
    })),
  })
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { projectID: rawProjectID, activityId: rawActivityId } = await context.params
    const body = await request.json().catch(() => null)
    const projectID = Number(body?.projectID ?? body?.projectId ?? rawProjectID)
    const activityId = Number(body?.activityId ?? body?.activityID ?? body?.zoneID ?? rawActivityId)

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
    const dbUser = await getCurrentDbUser(supabase)

    const { data, error } = await supabase
      .from("equipment_requests")
      .insert([
        {
          projectid: projectID,
          activity_id: activityId,
          details,
          quantity: typeof quantity === "number" && Number.isFinite(quantity) ? Math.floor(quantity) : null,
          requested_by: dbUser.id,
        },
      ])
      .select()
      .limit(1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        request: data?.[0]
          ? {
              ...data[0],
              requestedBy: dbUser.id,
              requestedByName: dbUser.username ?? null,
            }
          : null,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof CurrentUserError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error("POST equipment request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
