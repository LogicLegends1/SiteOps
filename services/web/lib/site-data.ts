export type ZoneStatus = "pending" | "in_progress" | "completed" | "delayed"

export interface Zone {
  zoneID: number
  projectID: number
  name: string
  description: string | null
  activity: string | null
  status: ZoneStatus
  progress: number
  lat: number
  lng: number
  markerLabel: string
  posX?: number | null
  posY?: number | null
  widthPercent?: number | null
  heightPercent?: number | null
  displayOrder?: number | null
  createdAt?: string | null
  updatedAt?: string | null
  imagePath?: string | null
  imageUrl?: string | null
  assignedTeam?: string | null
  assignedSupervisor?: string | null
  startDate?: string
  expectedCompletion?: string
}

export interface Project {
  projectID: number
  name: string
  locationLatitude: number
  locationLongitude: number
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