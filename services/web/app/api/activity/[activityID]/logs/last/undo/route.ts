import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest) {
  // TODO: Undo the last activity log entry and restore the previous progress.
  return NextResponse.json({ error: 'Not implemented yet.' }, { status: 501 })
}
