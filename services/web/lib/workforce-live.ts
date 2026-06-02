export type WorkerDiscipline = "civil" | "electrical" | "mechanical" | "qa" | "safety" | "general" | "it"

export type WorkerRole =
  | "engineer"
  | "supervisor"
  | "technician"
  | "operator"
  | "skilled-labour"
  | "general-labour"
  | "developer"
  | "system-admin"

export type WorkerStatus = "active" | "idle" | "unavailable"

export type ExperienceLevel = "junior" | "mid-level" | "senior" | "expert"

export interface WorkforceWorker {
  id: string
  name: string
  discipline: WorkerDiscipline
  role: WorkerRole
  /**
   * Raw values from the `worker` table.
   * Used for UI display/grouping when the DB stores domain-specific labels.
   */
  disciplineName?: string
  roleName?: string
  experienceYears: number
  experienceLevel: ExperienceLevel
  status: WorkerStatus
  assignedTeamId: string | null
}

export interface WorkforceTeam {
  id: string
  name: string
  leaderId: string | null
  memberIds: string[]
  createdAt: string | null
}

export interface WorkforceSummary {
  total: number
  assigned: number
  idle: number
  unavailable: number
  teams: number
}

export const WORKER_REQUEST_ROLE_KEYS = [
  "tower_crane_operators",
  "excavator_operators",
  "crawler_crane_operators",
  "tipper_drivers",
  "surveyors",
  "masons",
  "carpenters",
  "steel_fixers",
  "electricians",
  "general_labors",
  "site_engineers",
] as const

export type WorkerRequestRoleKey = (typeof WORKER_REQUEST_ROLE_KEYS)[number]

export const workerRequestRoleLabels: Record<WorkerRequestRoleKey, string> = {
  tower_crane_operators: "Tower Crane Operators",
  excavator_operators: "Excavator Operators",
  crawler_crane_operators: "Crawler Crane Operators",
  tipper_drivers: "Tipper Drivers",
  surveyors: "Surveyors",
  masons: "Masons",
  carpenters: "Carpenters",
  steel_fixers: "Steel Fixers",
  electricians: "Electricians",
  general_labors: "General Labors",
  site_engineers: "Site Engineers",
}

export interface WorkerAllocationRequestRole {
  key: WorkerRequestRoleKey
  label: string
  count: number
}

export interface WorkerAllocationRequest {
  id: number
  activityId: number
  activityName: string
  activityDescription: string
  activityStatus: string | null
  totalRequested: number
  roles: WorkerAllocationRequestRole[]
}

export interface WorkerAllocationRequestSummary {
  pendingRequests: number
  activities: number
  totalRequested: number
}

export interface WorkerAllocationRequestResponse {
  summary: WorkerAllocationRequestSummary
  requests: WorkerAllocationRequest[]
}

export interface WorkforceResponse {
  summary: WorkforceSummary
  workers: WorkforceWorker[]
  teams: WorkforceTeam[]
}

export function classifyExperienceLevel(years: number): ExperienceLevel {
  if (years >= 10) {
    return "expert"
  }

  if (years >= 7) {
    return "senior"
  }

  if (years >= 4) {
    return "mid-level"
  }

  return "junior"
}
