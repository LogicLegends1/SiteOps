export type EquipmentStatus = "active" | "idle" | "down" | "maintenance" | "unassigned"

export interface TechnicalSpecs {
  max_lift_capacity?: string
  max_reach?: string
  bucket_capacity?: string
  operating_weight?: string
  power_type?: string
  drum_capacity?: string
  chute_length?: string
  max_drilling_depth?: string
  max_torque?: string
  [key: string]: string | undefined
}

export interface MaintenanceLog {
  id: string
  itemId: string
  issueType: "preventive_service" | "breakdown" | "inspection"
  description: string
  reportedAt: string
  resolvedAt: string | null
  downtimeHours: number | null
  resolutionNotes: string | null
}

export interface EquipmentItem {
  id: string
  name: string
  classId: string
  className: string
  serialNumber: string
  status: EquipmentStatus
  nextServiceDate: string | null
  lastServiceDate: string | null
  technicalSpecs: TechnicalSpecs
  reliabilityScore: number // Calculated 0-100
  activeActivityId: string | null
  activeZoneId: string | null
  assignedDate?: string | null
  estimatedEndDate?: string | null
  projectId?: number | string | null
}

export interface EquipmentSummary {
  total: number
  active: number
  idle: number
  underRepair: number
  maintenanceDueCount: number
  unassigned?: number
  serviceDueCount?: number
}

export interface EquipmentResponse {
  summary: EquipmentSummary
  equipment: EquipmentItem[]
  maintenanceLogs: MaintenanceLog[]
  totalCount?: number
  filteredCount?: number
  uniqueClasses?: string[]
  uniqueProjects?: string[]
  uniqueZones?: string[]
  immediateRisks?: EquipmentItem[]
}
