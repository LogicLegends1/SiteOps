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
