import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/superbase/admin'

const BUCKET_NAME = 'activity-evidence'
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

type RouteContext = {
  params: Promise<{ activityID: string }>
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const supabase = createAdminClient()
    const { activityID } = await context.params
    const numericActivityId = Number(activityID)

    if (!Number.isInteger(numericActivityId) || numericActivityId <= 0) {
      return NextResponse.json({ error: 'Invalid activity id' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: PNG, JPG, WEBP' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const filePath = `${numericActivityId}/${Date.now()}-${safeFileName}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch (error) {
    console.error('Upload evidence photo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
