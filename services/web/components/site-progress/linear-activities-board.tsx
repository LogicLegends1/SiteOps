"use client"

import { useState, useMemo, useEffect } from "react"
import { type Activity, type ActivityStatus } from "@/lib/site-data"
import {
  type Subtask,
  calculateProgressFromSubtasks,
  getTrackLabelFromSubtasks,
} from "@/lib/subtasks-data"
import { getIssuesByActivityId } from "@/lib/issues-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Circle,
  CircleDot,
  CheckCircle2,
  PauseCircle,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  ListTodo,
  MapPin,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SubtaskProgressModal } from "@/components/site-progress/subtask-progress-modal"

interface WorkerSummary {
  id: number
  name: string
  role: string
}

interface LinearActivitiesBoardProps {
  activities: Activity[]
  subtasksByActivity: Record<number, Subtask[]>
  onActivitySelect: (activity: Activity) => void
  onViewOnMap: (activity: Activity) => void
  onAddActivity: () => void
  onStatusChange?: (activityId: number, newStatus: ActivityStatus) => void
  onToggleSubtask?: (activityId: number, subtaskId: string) => void
  onSubtaskUpdate?: (activityId: number, subtaskId: string, description: string, evidencePhotoUrl?: string) => void
  selectedActivityId?: number
  activityWorkersDetail?: Record<number, WorkerSummary[]>
}

type FilterType = "all" | "on-track" | "behind" | "completed"


function getStatusIcon(status: ActivityStatus) {
  switch (status) {
    case "PENDING":
      return <Circle className="h-3.5 w-3.5 text-muted-foreground" />
    case "IN_PROGRESS":
      return <CircleDot className="h-3.5 w-3.5 text-blue-400" />
    case "PAUSED":
      return <PauseCircle className="h-3.5 w-3.5 text-orange-400" />
    case "COMPLETED":
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
    case "CANCELLED":
      return <XCircle className="h-4 w-4 text-red-400" />
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />
  }
}

// â”€â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function formatDateShort(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getLastUpdate(subtasks: Subtask[]): Date | null {
  const allUpdates = subtasks.flatMap((s) => s.updates)
  if (!allUpdates.length) return null
  return new Date(Math.max(...allUpdates.map((u) => new Date(u.updatedAt).getTime())))
}


// â”€â”€â”€ Table column grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getActivityId(activity: Activity): string {
  const letter = (activity.markerLabel || "").replace(/Zone\s*/i, "").charAt(0).toUpperCase() || "X"
  const seq = String(activity.zoneID % 1000).padStart(3, "0")
  return `ACT-${letter}-${seq}`
}

function getDummyEquipment(activity: Activity): string {
  const n = (activity.name || "").toLowerCase()
  if (n.includes("excavat") || n.includes("earthwork") || n.includes("bulk earth")) return "2 Excav \u00b7 3 Tip"
  if (n.includes("haul")) return "4 Tippers"
  if (n.includes("concrete") || n.includes("pcc") || n.includes("pour") || n.includes("footing")) return "Mixer \u00b7 Vibr"
  if (n.includes("rebar") || n.includes("reinforc")) return "Bender \u00b7 Crane"
  if (n.includes("drain") || n.includes("pipe") || n.includes("utility")) return "Excav \u00b7 Layer"
  if (n.includes("compact") || n.includes("sub-base") || n.includes("road")) return "Roller \u00b7 Grader"
  if (n.includes("formation") || n.includes("grading") || n.includes("leveling")) return "Grader \u00b7 Roller"
  if (n.includes("inspect") || n.includes("qa") || n.includes("qc")) return "Test Kit"
  if (n.includes("backfill")) return "Compactor"
  return "\u2013"
}

const CREW_PALETTES = ["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#ec4899", "#14b8a6"]
const CREW_INITIALS = ["K", "S", "N", "D", "R", "A", "M", "J"]

function getDummyCrewInitials(activity: Activity): { initial: string; color: string }[] {
  const offset = activity.zoneID % CREW_INITIALS.length
  return [0, 1, 2].map((i) => ({
    initial: CREW_INITIALS[(offset + i) % CREW_INITIALS.length],
    color: CREW_PALETTES[(offset + i) % CREW_PALETTES.length],
  }))
}

const COL_GRID =
  "grid-cols-[28px_minmax(160px,1fr)_140px_100px_120px_90px_88px_52px_98px_36px]"

function TableHeader() {
  return (
    <div
      className={cn(
        "grid items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border bg-secondary/20 shrink-0 min-w-[960px]",
        COL_GRID
      )}
    >
      <span />
      <span>Activity</span>
      <span>Progress</span>
      <span>Planned Finish</span>
      <span>Engineer</span>
      <span>Crew</span>
      <span>Equipment</span>
      <span>Issues</span>
      <span>Last Update</span>
      <span />
    </div>
  )
}

function ActivityRow({
  activity,
  subtasks,
  onViewOnMap,
  onStatusChange,
  onToggleSubtask,
  onSubtaskUpdate,
  isExpanded,
  onToggleExpand,
  workers,
  isSelected,
}: {
  activity: Activity
  subtasks: Subtask[]
  onViewOnMap: () => void
  onStatusChange?: (activityId: number, newStatus: ActivityStatus) => void
  onToggleSubtask?: (activityId: number, subtaskId: string) => void
  onSubtaskUpdate?: (
    activityId: number,
    subtaskId: string,
    description: string,
    evidencePhotoUrl?: string
  ) => void
  isExpanded: boolean
  onToggleExpand: () => void
  workers?: WorkerSummary[]
  isSelected?: boolean
}) {
  const progress =
    subtasks.length > 0
      ? calculateProgressFromSubtasks(subtasks)
      : activity.progress ?? 0
  const track = getTrackLabelFromSubtasks(subtasks)
  const issues = getIssuesByActivityId(activity.zoneID)
  const lastUpdated = getLastUpdate(subtasks)
  const deadline = activity.deadline || activity.expectedCompletion
  const isDelayed = !!deadline && progress < 100 && new Date(deadline) < new Date()

  const engineerWorker = workers?.find((w) => w.role === "engineer")
  const engineerName = engineerWorker?.name || activity.assignedSupervisor
  const crewCount = workers?.length ?? null

  return (
    <div
      id={`activity-row-${activity.zoneID}`}
      className={cn(
        "group/row border-b border-border/50 last:border-0 min-w-[960px]",
        isSelected && "bg-primary/5 border-l-2 border-primary"
      )}
    >
      <div
        className={cn(
          "grid items-center gap-3 px-3 py-2.5 transition-colors hover:bg-secondary/20",
          COL_GRID
        )}
      >
        {/* Expand chevron */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand()
          }}
          className="p-0.5 rounded hover:bg-secondary/60 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {/* Activity name + ID */}
        <div className="flex items-center gap-2 min-w-0">
          {getStatusIcon(activity.status)}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate leading-tight text-foreground">
              {activity.name}
            </p>
            <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
              {getActivityId(activity)}
            </p>
          </div>
          {track === "Behind" && (
            <Badge
              variant="outline"
              className="text-[10px] h-4 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/30 shrink-0"
            >
              Delayed
            </Badge>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 h-1.5 rounded-full overflow-hidden bg-secondary/60">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: progress === 100 ? "#10b981" : isDelayed ? "#f59e0b" : "#3b82f6",
              }}
            />
          </div>
          <span
            className="text-xs font-semibold w-7 text-right shrink-0"
            style={{ color: progress === 100 ? "#10b981" : isDelayed ? "#f59e0b" : undefined }}
          >
            {progress}%
          </span>
        </div>

        {/* Planned Finish */}
        <span className="text-xs text-muted-foreground">
          {deadline ? formatDateShort(deadline) : "\u2013"}
        </span>

        {/* Engineer */}
        <div className="flex items-center gap-1.5 min-w-0">
          {engineerName ? (
            <>
              <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-primary">
                  {engineerName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {engineerName}
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">&ndash;</span>
          )}
        </div>

        {/* Crew — just the headcount */}
        <div className="flex items-center gap-1 min-w-0">
          {crewCount !== null ? (
            <>
              <span className="text-sm font-semibold text-foreground">{crewCount}</span>
              <span className="text-[10px] text-muted-foreground">workers</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">&ndash;</span>
          )}
        </div>

        {/* Equipment */}
        <span className="text-[10px] text-muted-foreground truncate">
          {getDummyEquipment(activity)}
        </span>

        {/* Issues */}
        <div className="flex items-center gap-1">
          {issues.length > 0 ? (
            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#ef4444" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {issues.length}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">0</span>
          )}
        </div>

        {/* Last Update */}
        <span className="text-[10px] text-muted-foreground">
          {lastUpdated
            ? lastUpdated.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "\u2013"}
        </span>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover/row:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onViewOnMap()
              }}
            >
              <MapPin className="h-3.5 w-3.5 mr-2" />
              View on Map
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onStatusChange?.(activity.zoneID, "PENDING")}>
              <Circle className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              Set Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange?.(activity.zoneID, "IN_PROGRESS")}>
              <CircleDot className="h-3.5 w-3.5 mr-2 text-blue-400" />
              Set In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange?.(activity.zoneID, "PAUSED")}>
              <PauseCircle className="h-3.5 w-3.5 mr-2 text-orange-400" />
              Set Paused
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange?.(activity.zoneID, "COMPLETED")}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-400" />
              Set Completed
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onStatusChange?.(activity.zoneID, "CANCELLED")}>
              <XCircle className="h-3.5 w-3.5 mr-2 text-red-400" />
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Expanded subtasks */}
      {isExpanded && subtasks.length > 0 && (
        <div className="ml-10 mr-3 mb-2 mt-1 border-l-2 border-border/40 pl-3 space-y-0.5">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary/20"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSubtask?.(activity.zoneID, subtask.id)
                }}
                className={cn(
                  "h-4 w-4 rounded-full border-2 shrink-0 transition-all hover:scale-110 cursor-pointer",
                  subtask.completed
                    ? "bg-emerald-400 border-emerald-400"
                    : "border-muted-foreground/40 hover:border-primary"
                )}
              />
              <span
                className={cn(
                  "text-xs flex-1",
                  subtask.completed ? "text-muted-foreground line-through" : "text-foreground"
                )}
              >
                {subtask.title}
              </span>
              {onSubtaskUpdate && (
                <SubtaskProgressModal
                  subtask={subtask}
                  onSubmit={(desc, url) => onSubtaskUpdate(activity.zoneID, subtask.id, desc, url)}
                />
              )}
              {subtask.dueDate && (
                <span className="text-[10px] text-muted-foreground">
                  {new Date(subtask.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {isExpanded && subtasks.length === 0 && (
        <div className="ml-10 mr-3 mb-2 mt-1 py-2 px-3 rounded-md bg-secondary/10 border border-dashed border-border/60">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ListTodo className="h-3 w-3" />
            No subtasks yet
          </p>
        </div>
      )}
    </div>
  )
}

export function LinearActivitiesBoard({
  activities,
  subtasksByActivity,
  onActivitySelect,
  onViewOnMap,
  onAddActivity,
  onStatusChange,
  onToggleSubtask,
  onSubtaskUpdate,
  selectedActivityId,
  activityWorkersDetail,
}: LinearActivitiesBoardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (selectedActivityId == null) return
    setExpandedActivities((prev) => {
      const next = new Set(prev)
      next.add(selectedActivityId)
      return next
    })
    setTimeout(() => {
      const el = document.getElementById(`activity-row-${selectedActivityId}`)
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 50)
  }, [selectedActivityId])

  const toggleExpanded = (id: number) => {
    setExpandedActivities((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredActivities = useMemo(() => {
    let result = activities
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.activity?.toLowerCase().includes(q)
      )
    }
    if (filter !== "all") {
      result = result.filter((a) => {
        const subtasks = subtasksByActivity[a.zoneID] ?? []
        const progress =
          subtasks.length > 0 ? calculateProgressFromSubtasks(subtasks) : a.progress ?? 0
        const track = getTrackLabelFromSubtasks(subtasks)
        switch (filter) {
          case "on-track":
            return track === "On Track" && progress < 100
          case "behind":
            return track === "Behind"
          case "completed":
            return progress === 100 || a.status === "COMPLETED"
          default:
            return true
        }
      })
    }
    return result
  }, [activities, subtasksByActivity, searchQuery, filter])

  return (
    <div className="flex flex-col h-full bg-card rounded-none overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm bg-secondary/20"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(["all", "on-track", "behind", "completed"] as FilterType[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-7 text-xs px-2.5",
                filter === f && "bg-secondary text-foreground"
              )}
              onClick={() => setFilter(f)}
            >
              {f === "all"
                ? "All"
                : f === "on-track"
                ? "On Track"
                : f === "behind"
                ? "Behind"
                : "Done"}
            </Button>
          ))}
        </div>
        <div className="flex-1" />
        <Button size="sm" className="h-8 gap-1.5 text-xs shrink-0" onClick={onAddActivity}>
          <Plus className="h-3.5 w-3.5" />
          New Activity
        </Button>
      </div>

      {/* Table header */}
      <TableHeader />

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ListTodo className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No activities found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery ? "Try a different search" : "Add your first activity to get started"}
            </p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <ActivityRow
              key={activity.zoneID}
              activity={activity}
              subtasks={subtasksByActivity[activity.zoneID] ?? []}
              onViewOnMap={() => onViewOnMap(activity)}
              onStatusChange={onStatusChange}
              onToggleSubtask={onToggleSubtask}
              onSubtaskUpdate={onSubtaskUpdate}
              isExpanded={expandedActivities.has(activity.zoneID)}
              onToggleExpand={() => toggleExpanded(activity.zoneID)}
              workers={activityWorkersDetail?.[activity.zoneID]}
              isSelected={selectedActivityId === activity.zoneID}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-[11px] text-muted-foreground shrink-0">
        <span>{filteredActivities.length} of {activities.length} activities</span>
        <span>{filteredActivities.length} shown</span>
      </div>
    </div>
  )
}
