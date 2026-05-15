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

    // 1. Fetch Equipment with Classes
    const { data: eqData, error: eqError } = await supabase
      .from("equipment_item")
      .select(`
        *,
        equipment_class (name)
      `)
      .eq("projectid", numericProjectId)

    if (eqError) throw eqError

    // 2. Fetch Active Assignments
    const { data: assignData, error: assignError } = await supabase
      .from("equipment_assignment")
      .select("*")
      .is("end_date", null)

    if (assignError) throw assignError

    // 3. Fetch Maintenance Logs for these items
    const itemIds = (eqData ?? []).map(r => r.itemid)
    const { data: logData, error: logError } = await supabase
      .from("equipment_maintenance_log")
      .select("*")
      .in("itemid", itemIds)
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
        activeZoneId: activeAssign ? String(activeAssign.zoneid) : null
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
