import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/superbase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Activity name is required' }, { status: 400 })
    }

    if (!body.projectid || !Number.isInteger(body.projectid) || body.projectid <= 0) {
      return NextResponse.json({ error: 'Valid project ID is required' }, { status: 400 })
    }

    if (!body.status || !['pending', 'in_progress', 'completed', 'delayed'].includes(body.status)) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 })
    }

    if (body.progress !== undefined) {
      if (typeof body.progress !== 'number' || body.progress < 0 || body.progress > 100) {
        return NextResponse.json({ error: 'Progress must be a number between 0 and 100' }, { status: 400 })
      }
    }

    // Validate coordinates if provided
    if (body.lat !== undefined && body.lat !== null) {
      if (typeof body.lat !== 'number') {
        return NextResponse.json({ error: 'Latitude must be a number' }, { status: 400 })
      }
    }

    if (body.lng !== undefined && body.lng !== null) {
      if (typeof body.lng !== 'number') {
        return NextResponse.json({ error: 'Longitude must be a number' }, { status: 400 })
      }
    }

    // Build insert data
    const insertData: any = {
      projectid: body.projectid,
      name: body.name.trim(),
      status: body.status,
      progress: body.progress ?? 0,
    }

    // Add optional fields
    if (body.description) {
      insertData.description = body.description
    }

    if (body.lat !== undefined && body.lat !== null) {
      insertData.lat = body.lat
    }

    if (body.lng !== undefined && body.lng !== null) {
      insertData.lng = body.lng
    }

    // Insert into database
    const { data, error } = await supabase
      .from('activity')
      .insert([insertData])
      .select('activityid, projectid, name, description, status, progress, lat, lng, markerlabel')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Map to camelCase for frontend
    const activity = {
      zoneID: data.activityid,
      projectID: data.projectid,
      name: data.name,
      description: data.description,
      status: data.status,
      progress: data.progress,
      lat: data.lat,
      lng: data.lng,
      markerLabel: data.markerlabel || data.name,
    }

    return NextResponse.json({ activity }, { status: 201 })
  } catch (error) {
    console.error('POST activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
