import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"

type RouteContext = {
  params: Promise<{
    projectID: string
    workerID: string
  }>
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { projectID, workerID } = await context.params
    const numericProjectId = Number(projectID)
    const numericWorkerId = Number(workerID)

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }

    if (!Number.isInteger(numericWorkerId) || numericWorkerId <= 0) {
      return NextResponse.json({ error: "Invalid worker id" }, { status: 400 })
    }

    const body = await req.json()
    const { isavailable } = body as { isavailable?: boolean }

    if (typeof isavailable !== "boolean") {
      return NextResponse.json({ error: "isavailable must be boolean" }, { status: 400 })
    }

    // Try strict project scoping first, with schema fallbacks.
    const attempts = [
      () =>
        supabase
          .from("worker")
          .update({ isavailable })
          .eq("id", numericWorkerId)
          .eq("project_id", numericProjectId)
          .select("id, isavailable")
          .maybeSingle(),
      () =>
        supabase
          .from("worker")
          .update({ isavailable })
          .eq("id", numericWorkerId)
          .eq("projectid", numericProjectId)
          .select("id, isavailable")
          .maybeSingle(),
      // Last fallback for legacy schemas where project linkage may not exist on worker row.
      () =>
        supabase
          .from("worker")
          .update({ isavailable })
          .eq("id", numericWorkerId)
          .select("id, isavailable")
          .maybeSingle(),
    ]

    let lastError: string | null = null
    for (const run of attempts) {
      const { data, error } = await run()
      if (!error && data) {
        return NextResponse.json({ worker: data }, { status: 200 })
      }
      if (error) {
        lastError = error.message
      }
    }

    return NextResponse.json(
      { error: lastError ?? "Worker not found or status update failed" },
      { status: 400 }
    )
  } catch (error) {
    console.error("PATCH worker availability error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
