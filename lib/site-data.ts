export type ZoneStatus = "not-started" | "in-progress" | "delayed" | "completed"

export type IssuePriority = "low" | "medium" | "high" | "critical"

export type IssueStatus = "open" | "in-progress" | "resolved"

export interface TeamMember {
  id: string
  name: string
  role: string
}

export interface Issue {
  id: string
  title: string
  description: string
  type: "material-delay" | "equipment-failure" | "labour-shortage" | "safety-issue" | "other"
  priority: IssuePriority
  status: IssueStatus
  owner: string
  createdAt: string
  zoneId: string
}

export interface Zone {
  id: string
  name: string
  activity: string
  status: ZoneStatus
  progress: number
  assignedTeam: string
  assignedSupervisor: string
  expectedCompletion: string
  startDate: string
  description: string
  coordinates: {
    x: number
    y: number
    width: number
    height: number
  }
}

export const zones: Zone[] = [
  {
    id: "zone-a",
    name: "Zone A",
    activity: "Foundation Work",
    status: "in-progress",
    progress: 75,
    assignedTeam: "Team Alpha",
    assignedSupervisor: "John Smith",
    expectedCompletion: "2026-04-15",
    startDate: "2026-02-01",
    description: "Foundation concrete pouring and curing for main building structure",
    coordinates: { x: 10, y: 10, width: 35, height: 35 },
  },
  {
    id: "zone-b",
    name: "Zone B",
    activity: "Piling Section",
    status: "delayed",
    progress: 40,
    assignedTeam: "Team Beta",
    assignedSupervisor: "Sarah Johnson",
    expectedCompletion: "2026-05-01",
    startDate: "2026-02-15",
    description: "Deep foundation piling work for tower section",
    coordinates: { x: 55, y: 10, width: 35, height: 35 },
  },
  {
    id: "zone-c",
    name: "Zone C",
    activity: "Electrical Installation",
    status: "completed",
    progress: 100,
    assignedTeam: "Team Gamma",
    assignedSupervisor: "Mike Chen",
    expectedCompletion: "2026-03-01",
    startDate: "2026-01-15",
    description: "Primary electrical conduit and panel installation",
    coordinates: { x: 10, y: 55, width: 35, height: 35 },
  },
  {
    id: "zone-d",
    name: "Zone D",
    activity: "Drainage Setup",
    status: "not-started",
    progress: 0,
    assignedTeam: "Unassigned",
    assignedSupervisor: "Pending",
    expectedCompletion: "2026-06-01",
    startDate: "2026-04-20",
    description: "Storm water drainage system and underground piping",
    coordinates: { x: 55, y: 55, width: 35, height: 35 },
  },
]

export const issues: Issue[] = [
  {
    id: "ISS-001",
    title: "Material Delay - Steel Rebar",
    description: "Steel rebar delivery delayed by supplier. Expected 2 week delay.",
    type: "material-delay",
    priority: "high",
    status: "open",
    owner: "Procurement Team",
    createdAt: "2026-03-18",
    zoneId: "zone-b",
  },
  {
    id: "ISS-002",
    title: "Equipment Failure - Crane #2",
    description: "Hydraulic system malfunction. Maintenance team dispatched.",
    type: "equipment-failure",
    priority: "critical",
    status: "in-progress",
    owner: "Maintenance Team",
    createdAt: "2026-03-20",
    zoneId: "zone-b",
  },
  {
    id: "ISS-003",
    title: "Labour Shortage",
    description: "Need 5 additional skilled workers for piling work.",
    type: "labour-shortage",
    priority: "medium",
    status: "open",
    owner: "HR Department",
    createdAt: "2026-03-19",
    zoneId: "zone-b",
  },
  {
    id: "ISS-004",
    title: "Safety Concern - Scaffolding",
    description: "Scaffolding inspection required before next phase.",
    type: "safety-issue",
    priority: "high",
    status: "open",
    owner: "Safety Officer",
    createdAt: "2026-03-21",
    zoneId: "zone-a",
  },
]

export function getZoneById(id: string): Zone | undefined {
  return zones.find((zone) => zone.id === id)
}

export function getIssuesByZoneId(zoneId: string): Issue[] {
  return issues.filter((issue) => issue.zoneId === zoneId)
}

export function getStatusColor(status: ZoneStatus): string {
  switch (status) {
    case "completed":
      return "bg-success"
    case "in-progress":
      return "bg-primary"
    case "delayed":
      return "bg-destructive"
    case "not-started":
      return "bg-muted"
    default:
      return "bg-muted"
  }
}

export function getStatusBorderColor(status: ZoneStatus): string {
  switch (status) {
    case "completed":
      return "border-success"
    case "in-progress":
      return "border-primary"
    case "delayed":
      return "border-destructive"
    case "not-started":
      return "border-muted-foreground"
    default:
      return "border-muted"
  }
}

export function getPriorityColor(priority: IssuePriority): string {
  switch (priority) {
    case "critical":
      return "bg-destructive text-destructive-foreground"
    case "high":
      return "bg-warning text-warning-foreground"
    case "medium":
      return "bg-primary text-primary-foreground"
    case "low":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function getIssueStatusColor(status: IssueStatus): string {
  switch (status) {
    case "resolved":
      return "bg-success text-success-foreground"
    case "in-progress":
      return "bg-primary text-primary-foreground"
    case "open":
      return "bg-warning text-warning-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}
