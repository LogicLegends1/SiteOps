import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"

type RouteContext = {
  params: Promise<{
    projectID: string
  }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { projectID } = await context.params
    const numericProjectId = Number(projectID)

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }

    const body = await req.json()
    const { name, discipline, role, experience, isavailable, teamid } = body

    if (!name || !discipline || !role || experience === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("worker")
      .insert([
        {
          name,
          discipline,
          role,
          experience,
          isavailable: isavailable ?? true,
          teamid: teamid ?? null,
          project_id: numericProjectId,
        },
      ])
      .select()
      .single()

    if (error) {
      // If project_id fails, fallback to projectid column name
      if (error.message.toLowerCase().includes("column") || error.message.toLowerCase().includes("project_id")) {
         const fallbackRes = await supabase
          .from("worker")
          .insert([
            {
              name,
              discipline,
              role,
              experience,
              isavailable: isavailable ?? true,
              teamid: teamid ?? null,
              projectid: numericProjectId,
            },
          ])
          .select()
          .single()
          
          if (fallbackRes.error) {
             return NextResponse.json({ error: fallbackRes.error.message }, { status: 400 })
          }
          return NextResponse.json(fallbackRes.data, { status: 201 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("POST worker error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}