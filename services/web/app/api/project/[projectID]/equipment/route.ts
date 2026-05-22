import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase/server"
import {
  type EquipmentItem,
  type EquipmentResponse,
  type MaintenanceLog,
  type TechnicalSpecs,
} from "@/lib/equipment-data"

type RouteContext = {
  params: Promise<{
    projectID: string
  }>
}

type DbRow = Record<string, unknown>

// -- Helpers from Workforce pattern -- //
function readString(row: DbRow, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "string" && value.trim().length > 0) return value.trim()
  }
  return fallback
}

function readNumber(row: DbRow, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "number" && Number.isFinite(value)) return value
    if (typeof value === "string") {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return fallback
}

function readNullableString(row: DbRow, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "string") {
      const trimmed = value.trim()
      if (trimmed.length > 0) return trimmed
    }
  }
  return null
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { projectID } = await context.params
    const numericProjectId = Number(projectID)
    const { searchParams } = new URL(_req.url)
    const filter = searchParams.get('filter') || 'project'
    const summarize = searchParams.get('summarize') || null

    // Lightweight RPC path: return counts per equipment class for the project
    if (summarize === 'classes') {
      const { data: counts, error: countsError } = await supabase.rpc('equipment_count_by_class', { p_project_id: numericProjectId })
      if (countsError) throw countsError
      return NextResponse.json({ classCounts: counts })
    }

    // Lightweight status-only path: return counts without joins or log lookups
    if (summarize === 'status') {
      let query = supabase.from("equipment_item").select("status")
      if (filter === 'project') {
        query = query.eq("projectid", numericProjectId)
      }

      const { data, error } = await query
      if (error) throw error

      const summary = {
        total: 0,
        active: 0,
        idle: 0,
        down: 0,
        maintenance: 0,
        unassigned: 0,
      }

      for (const row of data || []) {
        summary.total += 1

        const status = String(row.status ?? "").toLowerCase().trim()
        if (status === 'active' || status === 'operational') summary.active += 1
        else if (status === 'idle') summary.idle += 1
        else if (status === 'down' || status === 'under_repair' || status === 'broken') summary.down += 1
        else if (status === 'maintenance') summary.maintenance += 1
        else if (status === 'unassigned') summary.unassigned += 1
      }

      return NextResponse.json({ summary })
    }

    // 1. Fetch Equipment with required columns and class name
    const eqSelect = `
      itemid,
      name,
      classid,
      serial_number,
      status,
      next_service_date,
      last_service_date,
      technical_specs,
      equipment_class (name)
    `

    let eqQuery = supabase.from("equipment_item").select(eqSelect)
    if (filter === 'project') {
      eqQuery = eqQuery.eq("projectid", numericProjectId)
    }

    const { data: eqData, error: eqError } = await eqQuery
    if (eqError) throw eqError

    // If no equipment for this filter/project, return early (avoid extra DB calls)
    const itemIds = (eqData ?? []).map((r: any) => r.itemid).filter(Boolean)
    if (itemIds.length === 0) {
      const response: EquipmentResponse = {
        summary: { total: 0, active: 0, idle: 0, underRepair: 0, maintenanceDueCount: 0 },
        equipment: [],
        maintenanceLogs: []
      }
      return NextResponse.json(response)
    }

    // 2. Fetch Active Assignments -- only for the items we care about
    const { data: assignData, error: assignError } = await supabase
      .from("equipment_assignment")
      .select("itemid, activityid, zoneid, start_date, end_date")
      .is("end_date", null)
      .in("itemid", itemIds)

    if (assignError) throw assignError

    // 3. Fetch Maintenance Logs for these items, limited to recent window and only needed columns
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const { data: logData, error: logError } = await supabase
      .from("equipment_maintenance_log")
      .select("logid, itemid, issue_type, description, reported_at, resolved_at, downtime_hours, resolution_notes")
      .in("itemid", itemIds)
      .gte("reported_at", cutoff)
      .order("reported_at", { ascending: false })

    if (logError) throw logError

    // -- Map to our Interface -- //
    const maintenanceLogs: MaintenanceLog[] = (logData ?? []).map(row => ({
      id: String(row.logid),
      itemId: String(row.itemid),
      issueType: row.issue_type as any,
      description: row.description,
      reportedAt: row.reported_at,
      resolvedAt: row.resolved_at,
      downtimeHours: row.downtime_hours,
      resolutionNotes: row.resolution_notes
    }))

    const equipment: EquipmentItem[] = (eqData ?? []).map(row => {
      const id = String(row.itemid)
      const logs = maintenanceLogs.filter(l => l.itemId === id)
      
      // Basic Reliability Calculation: 100 - (10 for each breakdown in last 90 days)
      const recentBreakdowns = logs.filter(l => l.issueType === "breakdown").length
      const reliabilityScore = Math.max(0, 100 - (recentBreakdowns * 15))

      const activeAssign = (assignData ?? []).find(a => String(a.itemid) === id)

      return {
        id,
        name: readString(row, ["name"]),
        classId: String(row.classid),
        className: (row.equipment_class as any)?.name ?? "Unknown",
        serialNumber: readString(row, ["serial_number"]),
        status: row.status as any,
        nextServiceDate: readNullableString(row, ["next_service_date"]),
        lastServiceDate: readNullableString(row, ["last_service_date"]),
        technicalSpecs: (row.technical_specs as TechnicalSpecs) ?? {},
        reliabilityScore,
        activeActivityId: activeAssign ? String(activeAssign.activityid) : null,
        activeZoneId: activeAssign ? String(activeAssign.zoneid) : null,
        assignedDate: activeAssign?.start_date ? String(activeAssign.start_date) : null,
        estimatedEndDate: activeAssign?.start_date 
          ? new Date(new Date(activeAssign.start_date).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
          : null
      }
    })

    // -- Summary Stats (Human-Reported Model) -- //
    const total = equipment.length
    const active = equipment.filter(e => e.status === "active").length
    const idle = equipment.filter(e => e.status === "idle").length
    const down = equipment.filter(e => e.status === "down").length
    const maintenance = equipment.filter(e => e.status === "maintenance").length
    const unassigned = equipment.filter(e => e.status === "unassigned").length

    const response: EquipmentResponse = {
      summary: { 
        total, 
        active, 
        idle, 
        underRepair: down, 
        maintenanceDueCount: maintenance 
      },
      equipment,
      maintenanceLogs
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("GET equipment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
