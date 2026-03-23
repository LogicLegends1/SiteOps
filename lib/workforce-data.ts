export type WorkerDiscipline = "civil" | "electrical" | "mechanical" | "qa" | "safety" | "general"

export type WorkerRole = "engineer" | "supervisor" | "technician" | "operator" | "skilled-labour" | "general-labour"

export type WorkerStatus = "assigned" | "idle" | "unavailable"

export type ExperienceLevel = "junior" | "mid-level" | "senior" | "expert"

export type StaffingStatus = "understaffed" | "optimal" | "overstaffed"

export interface Worker {
  id: string
  name: string
  discipline: WorkerDiscipline
  role: WorkerRole
  experienceYears: number
  experienceLevel: ExperienceLevel
  status: WorkerStatus
  assignedTeamId: string | null
  assignedActivityId: string | null
  contactNumber: string
  skills: string[]
  certifications: string[]
  dailyRate: number
}

export interface Team {
  id: string
  name: string
  leaderId: string
  memberIds: string[]
  assignedZoneId: string | null
  assignedActivityId: string | null
  createdAt: string
}

export interface ActivityWorkforceRequirement {
  activityId: string
  activityName: string
  zoneName: string
  zoneId: string
  requirements: {
    discipline: WorkerDiscipline
    role: WorkerRole
    requiredCount: number
    assignedCount: number
    status: StaffingStatus
  }[]
  totalRequired: number
  totalAssigned: number
  overallStatus: StaffingStatus
  assignedTeamId: string | null
}

export const workers: Worker[] = [
  // Civil Engineers
  {
    id: "W001",
    name: "Rajesh Kumar",
    discipline: "civil",
    role: "engineer",
    experienceYears: 12,
    experienceLevel: "expert",
    status: "assigned",
    assignedTeamId: "team-alpha",
    assignedActivityId: "ACT-001",
    contactNumber: "+94-77-123-4567",
    skills: ["Structural Design", "Foundation Work", "Project Planning"],
    certifications: ["PMP", "LEED AP"],
    dailyRate: 15000,
  },
  {
    id: "W002",
    name: "Priya Sharma",
    discipline: "civil",
    role: "engineer",
    experienceYears: 5,
    experienceLevel: "mid-level",
    status: "assigned",
    assignedTeamId: "team-beta",
    assignedActivityId: "ACT-002",
    contactNumber: "+94-77-234-5678",
    skills: ["Concrete Technology", "Quality Control"],
    certifications: ["ACI Certified"],
    dailyRate: 10000,
  },
  {
    id: "W003",
    name: "Amal Perera",
    discipline: "civil",
    role: "engineer",
    experienceYears: 2,
    experienceLevel: "junior",
    status: "idle",
    assignedTeamId: null,
    assignedActivityId: null,
    contactNumber: "+94-77-345-6789",
    skills: ["AutoCAD", "Site Survey"],
    certifications: [],
    dailyRate: 6000,
  },
  // Electrical
  {
    id: "W004",
    name: "Sunil Fernando",
    discipline: "electrical",
    role: "engineer",
    experienceYears: 8,
    experienceLevel: "senior",
    status: "assigned",
    assignedTeamId: "team-gamma",
    assignedActivityId: "ACT-003",
    contactNumber: "+94-77-456-7890",
    skills: ["Electrical Systems", "Panel Design", "Load Calculation"],
    certifications: ["Licensed Electrician", "OSHA"],
    dailyRate: 12000,
  },
  {
    id: "W005",
    name: "Nimal Silva",
    discipline: "electrical",
    role: "technician",
    experienceYears: 6,
    experienceLevel: "mid-level",
    status: "assigned",
    assignedTeamId: "team-gamma",
    assignedActivityId: "ACT-003",
    contactNumber: "+94-77-567-8901",
    skills: ["Wiring", "Troubleshooting", "Installation"],
    certifications: ["NVQ Level 4"],
    dailyRate: 5000,
  },
  // Mechanical
  {
    id: "W006",
    name: "Kasun Jayawardena",
    discipline: "mechanical",
    role: "engineer",
    experienceYears: 10,
    experienceLevel: "senior",
    status: "idle",
    assignedTeamId: null,
    assignedActivityId: null,
    contactNumber: "+94-77-678-9012",
    skills: ["HVAC", "Plumbing Systems", "Equipment Installation"],
    certifications: ["PE License"],
    dailyRate: 13000,
  },
  {
    id: "W007",
    name: "Chaminda Rathnayake",
    discipline: "mechanical",
    role: "operator",
    experienceYears: 15,
    experienceLevel: "expert",
    status: "assigned",
    assignedTeamId: "team-beta",
    assignedActivityId: "ACT-002",
    contactNumber: "+94-77-789-0123",
    skills: ["Crane Operation", "Heavy Equipment", "Piling Rig"],
    certifications: ["Heavy Equipment License", "Safety Certified"],
    dailyRate: 8000,
  },
  // Supervisors
  {
    id: "W008",
    name: "John Smith",
    discipline: "civil",
    role: "supervisor",
    experienceYears: 18,
    experienceLevel: "expert",
    status: "assigned",
    assignedTeamId: "team-alpha",
    assignedActivityId: "ACT-001",
    contactNumber: "+94-77-890-1234",
    skills: ["Team Leadership", "Quality Assurance", "Safety Management"],
    certifications: ["OSHA 30", "First Aid"],
    dailyRate: 18000,
  },
  {
    id: "W009",
    name: "Sarah Johnson",
    discipline: "civil",
    role: "supervisor",
    experienceYears: 14,
    experienceLevel: "expert",
    status: "assigned",
    assignedTeamId: "team-beta",
    assignedActivityId: "ACT-002",
    contactNumber: "+94-77-901-2345",
    skills: ["Piling Supervision", "Schedule Management"],
    certifications: ["OSHA 30", "PMP"],
    dailyRate: 17000,
  },
  {
    id: "W010",
    name: "Mike Chen",
    discipline: "electrical",
    role: "supervisor",
    experienceYears: 11,
    experienceLevel: "senior",
    status: "assigned",
    assignedTeamId: "team-gamma",
    assignedActivityId: "ACT-003",
    contactNumber: "+94-77-012-3456",
    skills: ["Electrical Supervision", "Code Compliance"],
    certifications: ["Master Electrician"],
    dailyRate: 16000,
  },
  // Skilled Labour
  {
    id: "W011",
    name: "Ruwan Bandara",
    discipline: "civil",
    role: "skilled-labour",
    experienceYears: 7,
    experienceLevel: "mid-level",
    status: "assigned",
    assignedTeamId: "team-alpha",
    assignedActivityId: "ACT-001",
    contactNumber: "+94-77-111-2222",
    skills: ["Concrete Work", "Formwork", "Rebar Tying"],
    certifications: [],
    dailyRate: 3500,
  },
  {
    id: "W012",
    name: "Saman Kumara",
    discipline: "civil",
    role: "skilled-labour",
    experienceYears: 9,
    experienceLevel: "senior",
    status: "assigned",
    assignedTeamId: "team-alpha",
    assignedActivityId: "ACT-001",
    contactNumber: "+94-77-222-3333",
    skills: ["Masonry", "Plastering", "Finishing"],
    certifications: ["NVQ Level 3"],
    dailyRate: 4000,
  },
  {
    id: "W013",
    name: "Nuwan Perera",
    discipline: "civil",
    role: "skilled-labour",
    experienceYears: 4,
    experienceLevel: "mid-level",
    status: "assigned",
    assignedTeamId: "team-beta",
    assignedActivityId: "ACT-002",
    contactNumber: "+94-77-333-4444",
    skills: ["Piling Work", "Ground Work"],
    certifications: [],
    dailyRate: 3500,
  },
  {
    id: "W014",
    name: "Lakmal Fernando",
    discipline: "civil",
    role: "skilled-labour",
    experienceYears: 3,
    experienceLevel: "junior",
    status: "idle",
    assignedTeamId: null,
    assignedActivityId: null,
    contactNumber: "+94-77-444-5555",
    skills: ["General Construction"],
    certifications: [],
    dailyRate: 3000,
  },
  // General Labour
  {
    id: "W015",
    name: "Kamal Dissanayake",
    discipline: "general",
    role: "general-labour",
    experienceYears: 2,
    experienceLevel: "junior",
    status: "assigned",
    assignedTeamId: "team-alpha",
    assignedActivityId: "ACT-001",
    contactNumber: "+94-77-555-6666",
    skills: ["Material Handling", "Site Cleaning"],
    certifications: [],
    dailyRate: 2500,
  },
  {
    id: "W016",
    name: "Dinesh Rajapaksa",
    discipline: "general",
    role: "general-labour",
    experienceYears: 1,
    experienceLevel: "junior",
    status: "assigned",
    assignedTeamId: "team-beta",
    assignedActivityId: "ACT-002",
    contactNumber: "+94-77-666-7777",
    skills: ["Material Handling"],
    certifications: [],
    dailyRate: 2500,
  },
  {
    id: "W017",
    name: "Asanka Wijesekara",
    discipline: "general",
    role: "general-labour",
    experienceYears: 3,
    experienceLevel: "junior",
    status: "idle",
    assignedTeamId: null,
    assignedActivityId: null,
    contactNumber: "+94-77-777-8888",
    skills: ["Material Handling", "Equipment Support"],
    certifications: [],
    dailyRate: 2500,
  },
  // QA/Safety
  {
    id: "W018",
    name: "Dilshan Mendis",
    discipline: "qa",
    role: "engineer",
    experienceYears: 6,
    experienceLevel: "mid-level",
    status: "assigned",
    assignedTeamId: "team-alpha",
    assignedActivityId: "ACT-001",
    contactNumber: "+94-77-888-9999",
    skills: ["Quality Inspection", "Documentation", "Testing"],
    certifications: ["ISO 9001 Auditor"],
    dailyRate: 9000,
  },
  {
    id: "W019",
    name: "Thilina Jayasuriya",
    discipline: "safety",
    role: "engineer",
    experienceYears: 8,
    experienceLevel: "senior",
    status: "assigned",
    assignedTeamId: "team-beta",
    assignedActivityId: "ACT-002",
    contactNumber: "+94-77-999-0000",
    skills: ["Safety Audits", "Risk Assessment", "Training"],
    certifications: ["NEBOSH", "OSHA 500"],
    dailyRate: 11000,
  },
  {
    id: "W020",
    name: "Malith Gunasekara",
    discipline: "safety",
    role: "technician",
    experienceYears: 4,
    experienceLevel: "mid-level",
    status: "unavailable",
    assignedTeamId: null,
    assignedActivityId: null,
    contactNumber: "+94-77-000-1111",
    skills: ["First Aid", "Fire Safety", "PPE Management"],
    certifications: ["First Aid Certified"],
    dailyRate: 5000,
  },
]

export const teams: Team[] = [
  {
    id: "team-alpha",
    name: "Team Alpha",
    leaderId: "W008",
    memberIds: ["W001", "W008", "W011", "W012", "W015", "W018"],
    assignedZoneId: "zone-a",
    assignedActivityId: "ACT-001",
    createdAt: "2026-01-15",
  },
  {
    id: "team-beta",
    name: "Team Beta",
    leaderId: "W009",
    memberIds: ["W002", "W007", "W009", "W013", "W016", "W019"],
    assignedZoneId: "zone-b",
    assignedActivityId: "ACT-002",
    createdAt: "2026-02-01",
  },
  {
    id: "team-gamma",
    name: "Team Gamma",
    leaderId: "W010",
    memberIds: ["W004", "W005", "W010"],
    assignedZoneId: "zone-c",
    assignedActivityId: "ACT-003",
    createdAt: "2026-01-10",
  },
]

export const activityWorkforceRequirements: ActivityWorkforceRequirement[] = [
  {
    activityId: "ACT-001",
    activityName: "Foundation Work",
    zoneName: "Zone A",
    zoneId: "zone-a",
    requirements: [
      { discipline: "civil", role: "engineer", requiredCount: 2, assignedCount: 1, status: "understaffed" },
      { discipline: "civil", role: "supervisor", requiredCount: 1, assignedCount: 1, status: "optimal" },
      { discipline: "civil", role: "skilled-labour", requiredCount: 4, assignedCount: 2, status: "understaffed" },
      { discipline: "general", role: "general-labour", requiredCount: 3, assignedCount: 1, status: "understaffed" },
      { discipline: "qa", role: "engineer", requiredCount: 1, assignedCount: 1, status: "optimal" },
    ],
    totalRequired: 11,
    totalAssigned: 6,
    overallStatus: "understaffed",
    assignedTeamId: "team-alpha",
  },
  {
    activityId: "ACT-002",
    activityName: "Piling Section",
    zoneName: "Zone B",
    zoneId: "zone-b",
    requirements: [
      { discipline: "civil", role: "engineer", requiredCount: 2, assignedCount: 1, status: "understaffed" },
      { discipline: "civil", role: "supervisor", requiredCount: 1, assignedCount: 1, status: "optimal" },
      { discipline: "mechanical", role: "operator", requiredCount: 2, assignedCount: 1, status: "understaffed" },
      { discipline: "civil", role: "skilled-labour", requiredCount: 6, assignedCount: 1, status: "understaffed" },
      { discipline: "general", role: "general-labour", requiredCount: 4, assignedCount: 1, status: "understaffed" },
      { discipline: "safety", role: "engineer", requiredCount: 1, assignedCount: 1, status: "optimal" },
    ],
    totalRequired: 16,
    totalAssigned: 6,
    overallStatus: "understaffed",
    assignedTeamId: "team-beta",
  },
  {
    activityId: "ACT-003",
    activityName: "Electrical Installation",
    zoneName: "Zone C",
    zoneId: "zone-c",
    requirements: [
      { discipline: "electrical", role: "engineer", requiredCount: 1, assignedCount: 1, status: "optimal" },
      { discipline: "electrical", role: "supervisor", requiredCount: 1, assignedCount: 1, status: "optimal" },
      { discipline: "electrical", role: "technician", requiredCount: 2, assignedCount: 1, status: "understaffed" },
    ],
    totalRequired: 4,
    totalAssigned: 3,
    overallStatus: "understaffed",
    assignedTeamId: "team-gamma",
  },
  {
    activityId: "ACT-004",
    activityName: "Drainage Setup",
    zoneName: "Zone D",
    zoneId: "zone-d",
    requirements: [
      { discipline: "civil", role: "engineer", requiredCount: 1, assignedCount: 0, status: "understaffed" },
      { discipline: "civil", role: "supervisor", requiredCount: 1, assignedCount: 0, status: "understaffed" },
      { discipline: "civil", role: "skilled-labour", requiredCount: 3, assignedCount: 0, status: "understaffed" },
      { discipline: "general", role: "general-labour", requiredCount: 2, assignedCount: 0, status: "understaffed" },
    ],
    totalRequired: 7,
    totalAssigned: 0,
    overallStatus: "understaffed",
    assignedTeamId: null,
  },
  {
    activityId: "ACT-005",
    activityName: "Structural Steel Erection",
    zoneName: "Zone A",
    zoneId: "zone-a",
    requirements: [
      { discipline: "civil", role: "engineer", requiredCount: 2, assignedCount: 1, status: "understaffed" },
      { discipline: "civil", role: "supervisor", requiredCount: 1, assignedCount: 1, status: "optimal" },
      { discipline: "civil", role: "skilled-labour", requiredCount: 5, assignedCount: 2, status: "understaffed" },
      { discipline: "mechanical", role: "operator", requiredCount: 2, assignedCount: 0, status: "understaffed" },
    ],
    totalRequired: 10,
    totalAssigned: 4,
    overallStatus: "understaffed",
    assignedTeamId: "team-alpha",
  },
  {
    activityId: "ACT-006",
    activityName: "Concrete Pouring",
    zoneName: "Zone B",
    zoneId: "zone-b",
    requirements: [
      { discipline: "civil", role: "engineer", requiredCount: 1, assignedCount: 1, status: "optimal" },
      { discipline: "civil", role: "supervisor", requiredCount: 1, assignedCount: 1, status: "optimal" },
      { discipline: "civil", role: "skilled-labour", requiredCount: 4, assignedCount: 1, status: "understaffed" },
      { discipline: "general", role: "general-labour", requiredCount: 3, assignedCount: 1, status: "understaffed" },
    ],
    totalRequired: 9,
    totalAssigned: 4,
    overallStatus: "understaffed",
    assignedTeamId: "team-beta",
  },
]

// Helper functions
export function getDisciplineLabel(discipline: WorkerDiscipline): string {
  const labels: Record<WorkerDiscipline, string> = {
    civil: "Civil",
    electrical: "Electrical",
    mechanical: "Mechanical",
    qa: "QA/QC",
    safety: "Safety",
    general: "General",
  }
  return labels[discipline]
}

export function getRoleLabel(role: WorkerRole): string {
  const labels: Record<WorkerRole, string> = {
    engineer: "Engineer",
    supervisor: "Supervisor",
    technician: "Technician",
    operator: "Machine Operator",
    "skilled-labour": "Skilled Labour",
    "general-labour": "General Labour",
  }
  return labels[role]
}

export function getStatusColor(status: WorkerStatus): string {
  switch (status) {
    case "assigned":
      return "bg-primary text-primary-foreground"
    case "idle":
      return "bg-success text-success-foreground"
    case "unavailable":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function getStaffingStatusColor(status: StaffingStatus): string {
  switch (status) {
    case "optimal":
      return "bg-success text-success-foreground"
    case "understaffed":
      return "bg-destructive text-destructive-foreground"
    case "overstaffed":
      return "bg-warning text-warning-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function getExperienceLevelColor(level: ExperienceLevel): string {
  switch (level) {
    case "expert":
      return "bg-amber-500 text-white"
    case "senior":
      return "bg-primary text-primary-foreground"
    case "mid-level":
      return "bg-secondary text-secondary-foreground"
    case "junior":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function getWorkerById(id: string): Worker | undefined {
  return workers.find((w) => w.id === id)
}

export function getTeamById(id: string): Team | undefined {
  return teams.find((t) => t.id === id)
}

export function getWorkersByDiscipline(discipline: WorkerDiscipline): Worker[] {
  return workers.filter((w) => w.discipline === discipline)
}

export function getWorkersByRole(role: WorkerRole): Worker[] {
  return workers.filter((w) => w.role === role)
}

export function getWorkersByStatus(status: WorkerStatus): Worker[] {
  return workers.filter((w) => w.status === status)
}

export function getIdleWorkers(): Worker[] {
  return workers.filter((w) => w.status === "idle")
}

export function getWorkforceSummary() {
  const total = workers.length
  const assigned = workers.filter((w) => w.status === "assigned").length
  const idle = workers.filter((w) => w.status === "idle").length
  const unavailable = workers.filter((w) => w.status === "unavailable").length

  const byDiscipline = {
    civil: workers.filter((w) => w.discipline === "civil").length,
    electrical: workers.filter((w) => w.discipline === "electrical").length,
    mechanical: workers.filter((w) => w.discipline === "mechanical").length,
    qa: workers.filter((w) => w.discipline === "qa").length,
    safety: workers.filter((w) => w.discipline === "safety").length,
    general: workers.filter((w) => w.discipline === "general").length,
  }

  const byRole = {
    engineer: workers.filter((w) => w.role === "engineer").length,
    supervisor: workers.filter((w) => w.role === "supervisor").length,
    technician: workers.filter((w) => w.role === "technician").length,
    operator: workers.filter((w) => w.role === "operator").length,
    "skilled-labour": workers.filter((w) => w.role === "skilled-labour").length,
    "general-labour": workers.filter((w) => w.role === "general-labour").length,
  }

  const totalGap = activityWorkforceRequirements.reduce((acc, req) => {
    return acc + (req.totalRequired - req.totalAssigned)
  }, 0)

  return { total, assigned, idle, unavailable, byDiscipline, byRole, totalGap }
}
