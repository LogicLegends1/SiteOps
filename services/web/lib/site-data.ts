// Database workflow_status enum values
export type ActivityStatus = 
  | "PENDING" 
  | "IN_PROGRESS" 
  | "PAUSED" 
  | "COMPLETED" 
  | "CANCELLED"

// Progress update entry for timeline history
export interface ProgressUpdate {
  id: string
  activityID: number
  title: string
  description: string
  status: ActivityStatus
  updatedBy: string
  updatedAt: string
  images?: string[] // URLs to uploaded images
  notes?: string
}

// Lightweight activity metadata used by workforce planning UI.
export interface WorkforceActivityMeta {
  id: string
  name: string
  activity: string
}

export const activities: WorkforceActivityMeta[] = [
  { id: "activity-a", name: "Activity A", activity: "Foundation Work" },
  { id: "activity-b", name: "Activity B", activity: "Piling Section" },
  { id: "activity-c", name: "Activity C", activity: "Electrical Installation" },
  { id: "activity-d", name: "Activity D", activity: "Drainage Setup" },
]

export interface Activity {
  activityID: number
  zoneID: number
  projectID: number
  name: string
  description: string | null
  activity: string | null
  status: ActivityStatus
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
  deadline?: string | null
  imagePath?: string | null
  imageUrl?: string | null
  assignedTeam?: string | null
  assignedSupervisor?: string | null
  startDate?: string
  expectedCompletion?: string
  deadline?: string | null
  progressUpdates?: ProgressUpdate[]
}

export interface Project {
  projectID: number
  name: string
  locationLatitude: number
  locationLongitude: number
}

export function getStatusColor(status: ActivityStatus) {
  switch (status) {
    case "COMPLETED":
      return "bg-success"
    case "IN_PROGRESS":
      return "bg-primary"
    case "PAUSED":
      return "bg-orange-500"
    case "CANCELLED":
      return "bg-destructive"
    case "PENDING":
      return "bg-gray-500"
    default:
      return "bg-muted"
  }
}

export function getStatusBorderColor(status: ActivityStatus) {
  switch (status) {
    case "COMPLETED":
      return "border-success"
    case "IN_PROGRESS":
      return "border-primary"
    case "PAUSED":
      return "border-orange-500"
    case "CANCELLED":
      return "border-destructive"
    case "PENDING":
      return "border-gray-500"
    default:
      return "border-muted"
  }
}

export function getStatusIcon(status: ActivityStatus) {
  switch (status) {
    case "COMPLETED":
      return "✓"
    case "IN_PROGRESS":
      return "▶"
    case "PAUSED":
      return "⏸"
    case "CANCELLED":
      return "🚫"
    case "PENDING":
      return "○"
    default:
      return "?"
  }
}

export function getStatusLabel(status: ActivityStatus) {
  switch (status) {
    case "PENDING":
      return "Pending"
    case "IN_PROGRESS":
      return "In Progress"
    case "PAUSED":
      return "Paused"
    case "COMPLETED":
      return "Completed"
    case "CANCELLED":
      return "Cancelled"
    default:
      return status
  }
}
