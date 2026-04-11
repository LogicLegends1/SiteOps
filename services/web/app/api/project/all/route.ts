import { NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

export async function GET() {
	try {
		const supabase = await createClient()

		const { data, error } = await supabase
			.from('project')
			.select(
				'projectid, name, locationlongitude, locationlatitude, projectdiagram, status'
			)
			.order('projectid', { ascending: true })

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		return NextResponse.json({ projects: data ?? [] }, { status: 200 })
	} catch (error) {
		console.error('GET all projects error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
