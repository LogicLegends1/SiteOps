export type ZoneStatus = "pending" | "in_progress" | "completed" | "delayed"

// Lightweight zone metadata used by workforce planning UI.
export interface WorkforceZoneMeta {
  id: string
  name: string
  activity: string
}

export const zones: WorkforceZoneMeta[] = [
  { id: "zone-a", name: "Zone A", activity: "Foundation Work" },
  { id: "zone-b", name: "Zone B", activity: "Piling Section" },
  { id: "zone-c", name: "Zone C", activity: "Electrical Installation" },
  { id: "zone-d", name: "Zone D", activity: "Drainage Setup" },
]

export interface Zone {
  zoneID: number
  projectID: number
  name: string
  description: string | null
  activity: string | null
  status: ZoneStatus
  progress: number
  posX: number
  posY: number
  widthPercent: number
  heightPercent: number
  displayOrder: number
  imagePath?: string | null
  imageUrl?: string | null
}

export function getStatusColor(status: ZoneStatus) {
  switch (status) {
    case "completed":
      return "bg-success"
    case "in_progress":
      return "bg-primary"
    case "delayed":
      return "bg-destructive"
    default:
      return "bg-muted"
  }
}

export function getStatusBorderColor(status: ZoneStatus) {
  switch (status) {
    case "completed":
      return "border-success"
    case "in_progress":
      return "border-primary"
    case "delayed":
      return "border-destructive"
    default:
      return "border-muted"
  }
}