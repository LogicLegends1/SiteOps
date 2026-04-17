import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/superbase/server'

type RouteContext = {
  params: Promise<{
    personID: string
  }>
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { personID } = await context.params
    const numericPersonId = Number(personID)

    if (!Number.isInteger(numericPersonId) || numericPersonId <= 0) {
      return NextResponse.json({ error: "Invalid person id" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("person")
      .select("personid, name, position, yearsofexperience, nic")
      .eq("personid", numericPersonId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ person: data }, { status: 200 })
  } catch (error) {
    console.error("GET person error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { personID } = await context.params
    const numericPersonId = Number(personID)

    if (!Number.isInteger(numericPersonId) || numericPersonId <= 0) {
      return NextResponse.json({ error: "Invalid person id" }, { status: 400 })
    }

    const body = await req.json()

    const updateData: {
      name?: string
      position?: string
      yearsofexperience?: number | null
      nic?: string
    } = {}

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json({ error: "Invalid name" }, { status: 400 })
      }
      updateData.name = body.name.trim()
    }

    if (body.position !== undefined) {
      if (typeof body.position !== "string" || !body.position.trim()) {
        return NextResponse.json({ error: "Invalid position" }, { status: 400 })
      }
      updateData.position = body.position.trim()
    }

    if (body.yearsofexperience !== undefined) {
      if (
        body.yearsofexperience !== null &&
        (!Number.isInteger(body.yearsofexperience) || body.yearsofexperience < 0)
      ) {
        return NextResponse.json(
          { error: "Invalid years of experience" },
          { status: 400 }
        )
      }
      updateData.yearsofexperience = body.yearsofexperience
    }

    if (body.nic !== undefined) {
      if (typeof body.nic !== "string" || !body.nic.trim()) {
        return NextResponse.json({ error: "Invalid NIC" }, { status: 400 })
      }
      updateData.nic = body.nic.trim()
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("person")
      .update(updateData)
      .eq("personid", numericPersonId)
      .select("personid, name, position, yearsofexperience, nic")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { message: "Person updated successfully", person: data },
      { status: 200 }
    )
  } catch (error) {
    console.error("PATCH person error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { personID } = await context.params
    const numericPersonId = Number(personID)

    if (!Number.isInteger(numericPersonId) || numericPersonId <= 0) {
      return NextResponse.json({ error: "Invalid person id" }, { status: 400 })
    }

    const { error } = await supabase
      .from("person")
      .delete()
      .eq("personid", numericPersonId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { message: "Person deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("DELETE person error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}