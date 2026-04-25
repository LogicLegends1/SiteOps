export type IssuePriority = "low" | "medium" | "high" | "critical"
export type IssueStatus = "open" | "in-progress" | "resolved"

export interface Issue {
  id: string
  activityID: number
  title: string
  description: string
  type: "material-delay" | "equipment-failure" | "labour-shortage" | "safety-issue" | "other"
  priority: IssuePriority
  status: IssueStatus
  owner: string
  createdAt: string
}

export const issues: Issue[] = [
  {
    id: "ISS-001",
    activityID: 1,
    title: "Concrete delivery delay",
    description: "Supplier reported delay for the next concrete batch.",
    type: "material-delay",
    priority: "high",
    status: "open",
    owner: "Site Engineer",
    createdAt: "2026-04-01",
  },
  {
    id: "ISS-002",
    activityID: 2,
    title: "Pile driver maintenance",
    description: "Machine requires inspection before next cycle.",
    type: "equipment-failure",
    priority: "medium",
    status: "in-progress",
    owner: "Maintenance Team",
    createdAt: "2026-04-02",
  },
]

export function getIssuesByActivityId(activityID: number) {
  return issues.filter((issue) => issue.activityID === activityID)
}

export function getPriorityColor(priority: IssuePriority) {
  switch (priority) {
    case "critical":
      return "bg-red-600/20 text-red-400"
    case "high":
      return "bg-destructive/20 text-destructive"
    case "medium":
      return "bg-warning/20 text-warning"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function getIssueStatusColor(status: IssueStatus) {
  switch (status) {
    case "resolved":
      return "bg-success/20 text-success"
    case "in-progress":
      return "bg-primary/20 text-primary"
    default:
      return "bg-muted text-muted-foreground"
  }
}