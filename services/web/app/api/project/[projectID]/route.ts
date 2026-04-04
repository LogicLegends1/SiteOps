import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  // TODO: Fetch a single project by projectID.
  return NextResponse.json({ error: 'Not implemented yet.' }, { status: 501 })
}

export async function PATCH(_req: NextRequest) {
  // TODO: Update a project by projectID.
  return NextResponse.json({ error: 'Not implemented yet.' }, { status: 501 })
}

export async function DELETE(_req: NextRequest) {
  // TODO: Delete a project by projectID.
  return NextResponse.json({ error: 'Not implemented yet.' }, { status: 501 })
}
