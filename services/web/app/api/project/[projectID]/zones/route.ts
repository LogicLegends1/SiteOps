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
      .from("project_zone")
      .select(`
        zoneid,
        projectid,
        name,
        description,
        activity,
        status,
        progress,
        posx,
        posy,
        widthpercent,
        heightpercent,
        displayorder,
        imagepath,
        imageurl
      `)
      .eq("projectid", numericProjectId)
      .order("displayorder", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const zones = (data || []).map((zone: any) => ({
      zoneID: zone.zoneid,
      projectID: zone.projectid,
      name: zone.name,
      description: zone.description,
      activity: zone.activity,
      status: zone.status,
      progress: zone.progress,
      posX: Number(zone.posx ?? 0),
      posY: Number(zone.posy ?? 0),
      widthPercent: Number(zone.widthpercent ?? 0),
      heightPercent: Number(zone.heightpercent ?? 0),
      displayOrder: zone.displayorder,
      imagePath: zone.imagepath,
      imageUrl: zone.imageurl,
    }))

    return NextResponse.json({ zones })
  } catch (error) {
    console.error("Get zones error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}