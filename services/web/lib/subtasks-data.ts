import type { Activity } from "@/lib/site-data"

export interface SubtaskUpdate {
  id: string
  description: string
  updatedAt: string
  updatedBy: string
}

export interface Subtask {
  id: string
  activityID: number
  title: string
  dueDate: string
  completed: boolean
  order: number
  updates: SubtaskUpdate[]
}

const SUBTASK_TEMPLATES: Record<string, { title: string; offsetDays: number }[]> = {
  foundation: [
    { title: "Site Preparation", offsetDays: 0 },
    { title: "Excavation", offsetDays: 4 },
    { title: "Foundation Concrete", offsetDays: 11 },
    { title: "Curing & Testing", offsetDays: 14 },
  ],
  piling: [
    { title: "Survey & Marking", offsetDays: 0 },
    { title: "Pile Installation", offsetDays: 5 },
    { title: "Load Testing", offsetDays: 12 },
  ],
  electrical: [
    { title: "Conduit Routing", offsetDays: 0 },
    { title: "Panel Installation", offsetDays: 7 },
    { title: "Wiring & Testing", offsetDays: 14 },
  ],
  drainage: [
    { title: "Trench Excavation", offsetDays: 0 },
    { title: "Pipe Laying", offsetDays: 6 },
    { title: "Backfill & Inspection", offsetDays: 12 },
  ],
  default: [
    { title: "Planning & Setup", offsetDays: 0 },
    { title: "Primary Work", offsetDays: 7 },
    { title: "Quality Check", offsetDays: 14 },
    { title: "Final Sign-off", offsetDays: 21 },
  ],
}

function pickTemplate(activity: Activity) {
  const label = `${activity.name} ${activity.activity ?? ""}`.toLowerCase()
  if (label.includes("foundation")) return SUBTASK_TEMPLATES.foundation
  if (label.includes("pil")) return SUBTASK_TEMPLATES.piling
  if (label.includes("electr")) return SUBTASK_TEMPLATES.electrical
  if (label.includes("drain")) return SUBTASK_TEMPLATES.drainage
  return SUBTASK_TEMPLATES.default
}

function addDays(base: Date, days: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

/** Deterministic completion pattern from activity id (until DB-backed subtasks exist). */
function defaultCompleted(activityID: number, index: number, total: number): boolean {
  const completedCount = Math.min(total - 1, (activityID % total) + 1)
  return index < completedCount
}

export function buildSubtasksForActivity(activity: Activity): Subtask[] {
  const template = pickTemplate(activity)
  const baseDate = activity.startDate
    ? new Date(activity.startDate)
    : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  return template.map((item, index) => {
    const completed = defaultCompleted(activity.zoneID, index, template.length)
    return {
      id: `${activity.zoneID}-sub-${index + 1}`,
      activityID: activity.zoneID,
      title: item.title,
      dueDate: addDays(baseDate, item.offsetDays),
      completed,
      order: index + 1,
      updates: completed
        ? [
            {
              id: `${activity.zoneID}-sub-${index + 1}-u1`,
              description: `${item.title} completed on site.`,
              updatedAt: addDays(baseDate, item.offsetDays + 1),
              updatedBy: "Site Engineer",
            },
          ]
        : [],
    }
  })
}

export function buildSubtasksMap(activities: Activity[]): Record<number, Subtask[]> {
  const map: Record<number, Subtask[]> = {}
  for (const activity of activities) {
    map[activity.zoneID] = buildSubtasksForActivity(activity)
  }
  return map
}

export function calculateProgressFromSubtasks(subtasks: Subtask[]): number {
  if (!subtasks.length) return 0
  const completed = subtasks.filter((s) => s.completed).length
  return Math.round((completed / subtasks.length) * 100)
}

export function getSubtaskCounts(subtasks: Subtask[]) {
  const completed = subtasks.filter((s) => s.completed).length
  return { completed, total: subtasks.length }
}

export function getActivityDeadline(activity: Activity): string {
  if (activity.expectedCompletion) return activity.expectedCompletion
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split("T")[0]
}

export function getTrackLabel(progress: number): "On Track" | "At Risk" | "Behind" {
  if (progress >= 50) return "On Track"
  if (progress >= 25) return "At Risk"
  return "Behind"
}
