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
        lat,
        lng,
        markerlabel
      `)
      .eq("projectid", numericProjectId)
      .order("zoneid", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter zones with valid coordinates and map to camelCase
    const zones = (data || [])
      .filter((zone: any) => zone.lat != null && zone.lng != null)
      .map((zone: any) => ({
        zoneID: zone.zoneid,
        projectID: zone.projectid,
        name: zone.name,
        description: zone.description,
        activity: zone.activity,
        status: zone.status,
        progress: zone.progress,
        lat: Number(zone.lat),
        lng: Number(zone.lng),
        markerLabel: zone.markerlabel || zone.name,
      }))

    return NextResponse.json({ zones })
  } catch (error) {
    console.error("Get zones error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}