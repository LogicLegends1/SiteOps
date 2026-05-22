import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/superbase/server'


export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ projectID: string }> }
) {
  try {
    const supabase = await createClient()
    const { projectID } = await context.params
    const numericProjectId = Number(projectID)

    if (!Number.isInteger(numericProjectId) || numericProjectId <= 0) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("activity")
      .select(`
        activityid,
        projectid,
        name,
        description,
        progress,
        lat,
        lng,
        markerlabel,
        status,
        posx,
        posy,
        widthpercent,
        heightpercent,
        displayorder,
        createdat,
        updatedat,
        imagepath,
        imageurl,
        deadline
      `)
      .eq("projectid", numericProjectId)
      .order("displayorder", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter activities with valid coordinates and map to camelCase
    const activities = (data || [])
      .filter((activity: any) => activity.lat != null && activity.lng != null)
      .map((activity: any) => ({
        zoneID: activity.activityid,
        projectID: activity.projectid,
        name: activity.name,
        description: activity.description,
        activity: activity.description,
        status: activity.status,
        progress: activity.progress,
        lat: Number(activity.lat),
        lng: Number(activity.lng),
        markerLabel: activity.markerlabel || activity.name,
        posX: activity.posx,
        posY: activity.posy,
        widthPercent: activity.widthpercent,
        heightPercent: activity.heightpercent,
        displayOrder: activity.displayorder,
        createdAt: activity.createdat,
        updatedAt: activity.updatedat,
        imagePath: activity.imagepath,
        imageUrl: activity.imageurl,
        deadline: activity.deadline ?? null,
        expectedCompletion: activity.deadline ?? null,
      }))

    return NextResponse.json({ zones: activities })
  } catch (error) {
    console.error("Get activities error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}