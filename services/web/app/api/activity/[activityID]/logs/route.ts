import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest) {
  // TODO: Add an activity log and update activity progress.
  return NextResponse.json({ error: 'Not implemented yet.' }, { status: 501 })
}
