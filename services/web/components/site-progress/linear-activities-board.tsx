"use client"

import { useState, useMemo } from "react"
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
}

type FilterType = "all" | "on-track" | "behind" | "completed"

const ZONE_COLORS: Record<string, string> = {
  "Zone A": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  "Zone B": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Zone C": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Zone D": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Zone E": "bg-purple-500/15 text-purple-400 border-purple-500/30",
}
function getZoneClass(zone: string): string {
  for (const [key, cls] of Object.entries(ZONE_COLORS)) {
    if (zone.includes(key)) return cls
  }
  return "bg-secondary text-muted-foreground border-border"
}

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

function getCurrentStep(subtasks: Subtask[]): string {
  if (!subtasks.length) return "â€“"
  const firstIncomplete = subtasks.find((s) => !s.completed)
  if (!firstIncomplete) return "All Done"
  const idx = subtasks.findIndex((s) => s.id === firstIncomplete.id) + 1
  const title =
    firstIncomplete.title.length > 18
      ? firstIncomplete.title.slice(0, 18) + "â€¦"
      : firstIncomplete.title
  return `${title} (${idx}/${subtasks.length})`
}

function getLastUpdate(subtasks: Subtask[]): Date | null {
  const allUpdates = subtasks.flatMap((s) => s.updates)
  if (!allUpdates.length) return null
  return new Date(Math.max(...allUpdates.map((u) => new Date(u.updatedAt).getTime())))
}

function getActualFinishInfo(activity: Activity): { label: string; isDelayed: boolean } {
  const deadline = activity.deadline || activity.expectedCompletion
  if (!deadline) return { label: "â€“", isDelayed: false }
  if (activity.progress === 100 || activity.status === "COMPLETED") {
    return { label: formatDateShort(deadline), isDelayed: false }
  }
  const deadlineDate = new Date(deadline)
  const today = new Date()
  if (deadlineDate < today) {
    const daysLate = Math.ceil(
      (today.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    return { label: `${formatDateShort(deadline)} Â· ${daysLate}d late`, isDelayed: true }
  }
  return { label: "â€“", isDelayed: false }
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
  "grid-cols-[28px_minmax(150px,1fr)_75px_145px_118px_94px_118px_110px_88px_82px_52px_98px_36px]"

function TableHeader() {
  return (
    <div
      className={cn(
        "grid items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border bg-secondary/20 shrink-0 min-w-[1260px]",
        COL_GRID
      )}
    >
      <span />
      <span>Activity</span>
      <span>Zone</span>
      <span>Current Step</span>
      <span>Progress</span>
      <span>Planned Finish</span>
      <span>Actual / Delay</span>
      <span>Engineer</span>
      <span>Crew</span>
      <span>Equipment</span>
      <span>Issues</span>
      <span>Last Update</span>
      <span />
    </div>
  )
}

// â”€â”€â”€ Activity Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ActivityRow({
  activity,
  subtasks,
  isSelected,
  onSelect,
  onViewOnMap,
  onStatusChange,
  onToggleSubtask,
  onSubtaskUpdate,
  isExpanded,
  onToggleExpand,
}: {
  activity: Activity
  subtasks: Subtask[]
  isSelected: boolean
  onSelect: () => void
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
}) {
  const progress =
    subtasks.length > 0
      ? calculateProgressFromSubtasks(subtasks)
      : activity.progress ?? 0
  const track = getTrackLabelFromSubtasks(subtasks)
  const issues = getIssuesByActivityId(activity.zoneID)
  const currentStep = getCurrentStep(subtasks)
  const lastUpdated = getLastUpdate(subtasks)
  const { label: actualLabel, isDelayed } = getActualFinishInfo(activity)
  const zone = activity.markerLabel || "â€“"
  const deadline = activity.deadline || activity.expectedCompletion

  return (
    <div
      className={cn(
        "group/row border-b border-border/50 last:border-0 min-w-[1260px]",
        isSelected && "bg-primary/5"
      )}
    >
      <div
        className={cn(
          "grid items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
          COL_GRID,
          isSelected ? "bg-primary/10" : "hover:bg-secondary/20"
        )}
        onClick={onSelect}
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
            <p
              className={cn(
                "text-sm font-medium truncate leading-tight",
                isSelected ? "text-primary" : "text-foreground"
              )}
            >
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

        {/* Zone badge */}
        <div>
          <Badge variant="outline" className={cn("text-[10px] h-5 px-2", getZoneClass(zone))}>
            {zone}
          </Badge>
        </div>

        {/* Current Step */}
        <span className="text-xs text-muted-foreground truncate">{currentStep}</span>

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
          {deadline ? formatDateShort(deadline) : "â€“"}
        </span>

        {/* Actual / Delay */}
        <span
          className={cn(
            "text-xs truncate",
            isDelayed ? "text-destructive font-medium" : "text-muted-foreground"
          )}
        >
          {actualLabel}
        </span>

        {/* Engineer */}
        <div className="flex items-center gap-1.5 min-w-0">
          {activity.assignedSupervisor ? (
            <>
              <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-primary">
                  {activity.assignedSupervisor
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {activity.assignedSupervisor}
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">&ndash;</span>
          )}
        </div>

        {/* Crew */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex -space-x-1.5">
            {getDummyCrewInitials(activity).map(({ initial, color }, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border border-background text-[7px] font-bold flex items-center justify-center shrink-0"
                style={{ background: color, color: "#fff", zIndex: 3 - i }}
              >
                {initial}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground truncate">
            {activity.assignedTeam || "Crew A"}
          </span>
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
            : "â€“"}
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

// â”€â”€â”€ Zone Group â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ZoneGroup({
  zone,
  activities,
  subtasksByActivity,
  selectedActivityId,
  onActivitySelect,
  onViewOnMap,
  onStatusChange,
  onToggleSubtask,
  onSubtaskUpdate,
  expandedActivities,
  toggleExpanded,
}: {
  zone: string
  activities: Activity[]
  subtasksByActivity: Record<number, Subtask[]>
  selectedActivityId?: number
  onActivitySelect: (activity: Activity) => void
  onViewOnMap: (activity: Activity) => void
  onStatusChange?: (activityId: number, newStatus: ActivityStatus) => void
  onToggleSubtask?: (activityId: number, subtaskId: string) => void
  onSubtaskUpdate?: (
    activityId: number,
    subtaskId: string,
    description: string,
    evidencePhotoUrl?: string
  ) => void
  expandedActivities: Set<number>
  toggleExpanded: (id: number) => void
}) {
  const [collapsed, setCollapsed] = useState(false)

  const avgProgress = Math.round(
    activities.reduce((sum, a) => {
      const subtasks = subtasksByActivity[a.zoneID] ?? []
      return sum + (subtasks.length > 0 ? calculateProgressFromSubtasks(subtasks) : a.progress ?? 0)
    }, 0) / Math.max(activities.length, 1)
  )

  const delayedCount = activities.filter((a) => {
    const subtasks = subtasksByActivity[a.zoneID] ?? []
    return getTrackLabelFromSubtasks(subtasks) === "Behind"
  }).length

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-secondary/30 transition-colors text-left border-b border-border/50 min-w-[1080px] bg-secondary/10"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        <span className="text-sm font-semibold text-foreground">{zone}</span>
        <span className="text-xs text-muted-foreground ml-1">
          {activities.length} activit{activities.length !== 1 ? "ies" : "y"} Â· {avgProgress}% avg
          {delayedCount > 0 && (
            <> Â· <span className="text-destructive">{delayedCount} delayed</span></>
          )}
        </span>
      </button>
      {!collapsed &&
        activities.map((activity) => (
          <ActivityRow
            key={activity.zoneID}
            activity={activity}
            subtasks={subtasksByActivity[activity.zoneID] ?? []}
            isSelected={selectedActivityId === activity.zoneID}
            onSelect={() => onActivitySelect(activity)}
            onViewOnMap={() => onViewOnMap(activity)}
            onStatusChange={onStatusChange}
            onToggleSubtask={onToggleSubtask}
            onSubtaskUpdate={onSubtaskUpdate}
            isExpanded={expandedActivities.has(activity.zoneID)}
            onToggleExpand={() => toggleExpanded(activity.zoneID)}
          />
        ))}
    </div>
  )
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
}: LinearActivitiesBoardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set())

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

  const zoneGroups = useMemo(() => {
    const groups: Record<string, Activity[]> = {}
    for (const activity of filteredActivities) {
      const zone = activity.markerLabel || "Uncategorized"
      if (!groups[zone]) groups[zone] = []
      groups[zone].push(activity)
    }
    return groups
  }, [filteredActivities])

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
          Object.entries(zoneGroups).map(([zone, acts]) => (
            <ZoneGroup
              key={zone}
              zone={zone}
              activities={acts}
              subtasksByActivity={subtasksByActivity}
              selectedActivityId={selectedActivityId}
              onActivitySelect={onActivitySelect}
              onViewOnMap={onViewOnMap}
              onStatusChange={onStatusChange}
              onToggleSubtask={onToggleSubtask}
              onSubtaskUpdate={onSubtaskUpdate}
              expandedActivities={expandedActivities}
              toggleExpanded={toggleExpanded}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-[11px] text-muted-foreground shrink-0">
        <span>{filteredActivities.length} of {activities.length} activities</span>
        <span>Grouped by zone</span>
      </div>
    </div>
  )
}
