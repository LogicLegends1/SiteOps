import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'
import { createAdminClient } from '@/lib/superbase/admin'
import { CurrentUserError, getCurrentDbUser } from '@/lib/superbase/current-user'

type RouteContext = {
  params: Promise<{
    activityID: string
  }>
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { activityID } = await context.params
    const numericActivityId = Number(activityID)

    if (!Number.isInteger(numericActivityId) || numericActivityId <= 0) {
      return NextResponse.json({ error: 'Invalid activity id' }, { status: 400 })
    }

    const { data: activityData, error: activityError } = await supabase
      .from('activity')
      .select('activityid')
      .eq('activityid', numericActivityId)
      .single()

    if (activityError || !activityData) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('activity_log_entry')
      .select('logentryid, activityid, timestamp, description, siteengineerid, updatedprogress, evidencephoto')
      .eq('activityid', numericActivityId)
      .order('timestamp', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ logs: data ?? [] }, { status: 200 })
  } catch (error) {
    console.error('GET activity logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { activityID } = await context.params
    const numericActivityId = Number(activityID)

    if (!Number.isInteger(numericActivityId) || numericActivityId <= 0) {
      return NextResponse.json({ error: 'Invalid activity id' }, { status: 400 })
    }

    const dbUser = await getCurrentDbUser(supabase)

    const body = await req.json()

    if (typeof body.description !== 'string' || !body.description.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const effectiveUpdatedProgress =
      body.updatedProgress !== undefined ? body.updatedProgress : body.progress

    if (
      effectiveUpdatedProgress !== undefined &&
      effectiveUpdatedProgress !== null &&
      (!Number.isInteger(effectiveUpdatedProgress) || effectiveUpdatedProgress < 0 || effectiveUpdatedProgress > 100)
    ) {
      return NextResponse.json({ error: 'updatedProgress must be between 0 and 100' }, { status: 400 })
    }

    if (
      body.evidencePhoto !== undefined &&
      body.evidencePhoto !== null &&
      typeof body.evidencePhoto !== 'string'
    ) {
      return NextResponse.json({ error: 'evidencePhoto must be a string or null' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase.rpc('create_activity_log_and_update_progress', {
      p_activity_id: numericActivityId,
      p_description: body.description.trim(),
      p_site_engineer_id: dbUser.id,
      p_updated_progress:
        effectiveUpdatedProgress === undefined ? null : effectiveUpdatedProgress,
      p_evidence_photo:
        body.evidencePhoto === undefined ? null : body.evidencePhoto,
    })

    if (error) {
      if (error.code === 'P0002' || error.message?.toLowerCase().includes('activity not found')) {
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
      }

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const row = Array.isArray(data) ? data[0] : data

    return NextResponse.json(
      {
        logEntry: {
          logEntryID: row.logentryid,
          activityID: row.activityid,
          timestamp: row.timestamp,
          description: row.description,
          siteEngineerID: row.siteengineerid,
          updatedProgress: row.updatedprogress,
          evidencePhoto: row.evidencephoto,
        },
        activity: {
          activityID: row.activityid,
          progress: row.activityprogress,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof CurrentUserError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('POST activity log error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
