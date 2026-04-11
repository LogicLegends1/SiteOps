import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

const VALID_STATUSES = ['PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED']

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

    const { data, error } = await supabase
      .from('activity')
      .select('activityid, projectid, progress, description, status')
      .eq('activityid', numericActivityId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json({ activity: data }, { status: 200 })
  } catch (error) {
    console.error('GET activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { activityID } = await context.params
    const numericActivityId = Number(activityID)

    if (!Number.isInteger(numericActivityId) || numericActivityId <= 0) {
      return NextResponse.json({ error: 'Invalid activity id' }, { status: 400 })
    }

    const body = await req.json()

    const updateData: {
      projectid?: number
      progress?: number
      description?: string
      status?: string
    } = {}

    if (body.projectID !== undefined) {
      if (!Number.isInteger(body.projectID) || body.projectID <= 0) {
        return NextResponse.json({ error: 'Invalid projectID' }, { status: 400 })
      }
      updateData.projectid = body.projectID
    }

    if (body.progress !== undefined) {
      if (!Number.isInteger(body.progress) || body.progress < 0 || body.progress > 100) {
        return NextResponse.json({ error: 'Invalid progress' }, { status: 400 })
      }
      updateData.progress = body.progress
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string' || !body.description.trim()) {
        return NextResponse.json({ error: 'Invalid description' }, { status: 400 })
      }
      updateData.description = body.description.trim()
    }

    if (body.status !== undefined) {
      if (typeof body.status !== 'string' || !VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.status = body.status
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('activity')
      .update(updateData)
      .eq('activityid', numericActivityId)
      .select('activityid, projectid, progress, description, status')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Activity updated successfully', activity: data }, { status: 200 })
  } catch (error) {
    console.error('PATCH activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { activityID } = await context.params
    const numericActivityId = Number(activityID)

    if (!Number.isInteger(numericActivityId) || numericActivityId <= 0) {
      return NextResponse.json({ error: 'Invalid activity id' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('activity')
      .delete()
      .eq('activityid', numericActivityId)
      .select('activityid')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('DELETE activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
