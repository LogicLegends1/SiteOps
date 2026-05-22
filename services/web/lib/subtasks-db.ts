import type { Subtask, SubtaskUpdate } from "@/lib/subtasks-data"
import { parseDateOnlyLocal } from "@/lib/subtasks-data"

type DbRow = Record<string, unknown>

function readString(row: DbRow, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "string" && value.trim().length > 0) return value.trim()
  }
  return fallback
}

function readNumber(row: DbRow, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "number" && Number.isFinite(value)) return value
    if (typeof value === "string") {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return fallback
}

function readBoolean(row: DbRow, keys: string[], fallback = false): boolean {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "boolean") return value
    if (value === 1 || value === "1" || value === "true") return true
    if (value === 0 || value === "0" || value === "false") return false
  }
  return fallback
}

function formatDateOnly(value: unknown): string {
  const parsed = parseDateOnlyLocal(value)
  if (parsed) {
    const y = parsed.getFullYear()
    const m = String(parsed.getMonth() + 1).padStart(2, "0")
    const d = String(parsed.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }
  if (typeof value === "string" && value.trim()) {
    return value.split("T")[0]
  }
  return ""
}

function formatTimestamp(value: unknown): string {
  if (!value) return new Date().toISOString()
  if (typeof value === "string") return value
  return new Date(value as string | number).toISOString()
}

export function mapSubtaskLogRow(row: DbRow, engineerName = "Site Engineer"): SubtaskUpdate {
  const evidence = readString(row, ["evidencephoto", "evidence_photo"], "")
  return {
    id: String(readNumber(row, ["logentryid", "log_entry_id"], 0)),
    description: readString(row, ["description"], ""),
    updatedAt: formatTimestamp(row.createdat ?? row.timestamp),
    updatedBy: engineerName,
    images: evidence ? [evidence] : undefined,
  }
}

export function mapSubtaskRow(
  row: DbRow,
  logs: SubtaskUpdate[] = []
): Subtask {
  const activityId = readNumber(row, ["activityid", "activity_id"], 0)
  const subtaskId = readNumber(row, ["subtaskid", "subtask_id"], 0)

  return {
    id: String(subtaskId),
    activityID: activityId,
    title: readString(row, ["title"], "Untitled subtask"),
    dueDate: formatDateOnly(row.duedate ?? row.due_date),
    completed: readBoolean(row, ["completed"], false),
    order: readNumber(row, ["displayorder", "display_order"], 0) || 1,
    updates: logs,
  }
}

export function groupSubtasksByActivity(
  subtaskRows: DbRow[],
  logRows: DbRow[],
  engineerNames: Map<number, string> = new Map()
): Record<number, Subtask[]> {
  const logsBySubtask = new Map<number, SubtaskUpdate[]>()

  for (const log of logRows) {
    const subtaskId = readNumber(log, ["subtaskid", "subtask_id"], 0)
    const createdBy = readNumber(log, ["createdby", "created_by"], 0)
    const engineerName = engineerNames.get(createdBy) ?? "Site Engineer"
    const mapped = mapSubtaskLogRow(log, engineerName)
    const existing = logsBySubtask.get(subtaskId) ?? []
    existing.push(mapped)
    logsBySubtask.set(subtaskId, existing)
  }

  for (const [, logs] of logsBySubtask) {
    logs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  const byActivity: Record<number, Subtask[]> = {}

  for (const row of subtaskRows) {
    const subtaskId = readNumber(row, ["subtaskid", "subtask_id"], 0)
    const activityId = readNumber(row, ["activityid", "activity_id"], 0)
    const mapped = mapSubtaskRow(row, logsBySubtask.get(subtaskId) ?? [])
    if (!byActivity[activityId]) byActivity[activityId] = []
    byActivity[activityId].push(mapped)
  }

  for (const activityId of Object.keys(byActivity)) {
    byActivity[Number(activityId)].sort((a, b) => a.order - b.order)
  }

  return byActivity
}
