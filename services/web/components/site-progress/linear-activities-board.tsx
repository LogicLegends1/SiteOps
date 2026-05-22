"use client"

import { useState, useMemo } from "react"
import { type Activity, type ActivityStatus, getStatusLabel } from "@/lib/site-data"
import {
  type Subtask,
  calculateProgressFromSubtasks,
  getSubtaskCounts,
  getTrackLabelFromSubtasks,
} from "@/lib/subtasks-data"
import { getIssuesByActivityId } from "@/lib/issues-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
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
  Calendar,
  MoreHorizontal,
  ListTodo,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface LinearActivitiesBoardProps {
  activities: Activity[]
  subtasksByActivity: Record<number, Subtask[]>
  onActivitySelect: (activity: Activity) => void
  onAddActivity: () => void
  onStatusChange?: (activityId: number, newStatus: ActivityStatus) => void
  selectedActivityId?: number
}

type FilterType = "all" | "on-track" | "behind" | "completed"
type GroupBy = "status" | "none"

function getStatusIcon(status: ActivityStatus) {
  switch (status) {
    case "PENDING":
      return <Circle className="h-4 w-4 text-muted-foreground" />
    case "IN_PROGRESS":
      return <CircleDot className="h-4 w-4 text-blue-400" />
    case "PAUSED":
      return <PauseCircle className="h-4 w-4 text-orange-400" />
    case "COMPLETED":
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
    case "CANCELLED":
      return <XCircle className="h-4 w-4 text-red-400" />
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />
  }
}

function getStatusOrder(status: ActivityStatus): number {
  switch (status) {
    case "IN_PROGRESS":
      return 0
    case "PENDING":
      return 1
    case "PAUSED":
      return 2
    case "COMPLETED":
      return 3
    case "CANCELLED":
      return 4
    default:
      return 5
  }
}

function StatusGroup({
  status,
  activities,
  subtasksByActivity,
  selectedActivityId,
  onActivitySelect,
  onStatusChange,
  expandedActivities,
  toggleExpanded,
}: {
  status: ActivityStatus
  activities: Activity[]
  subtasksByActivity: Record<number, Subtask[]>
  selectedActivityId?: number
  onActivitySelect: (activity: Activity) => void
  onStatusChange?: (activityId: number, newStatus: ActivityStatus) => void
  expandedActivities: Set<number>
  toggleExpanded: (id: number) => void
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-secondary/30 rounded-lg transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        {getStatusIcon(status)}
        <span className="text-sm font-semibold text-foreground">{getStatusLabel(status)}</span>
        <span className="text-xs text-muted-foreground ml-1">{activities.length}</span>
      </button>
      {!collapsed && (
        <div className="ml-2 border-l border-border/50 pl-2 space-y-0.5 mt-0.5">
          {activities.map((activity) => (
            <ActivityRow
              key={activity.zoneID}
              activity={activity}
              subtasksByActivity={subtasksByActivity}
              isSelected={selectedActivityId === activity.zoneID}
              onSelect={() => onActivitySelect(activity)}
              onStatusChange={onStatusChange}
              isExpanded={expandedActivities.has(activity.zoneID)}
              onToggleExpand={() => toggleExpanded(activity.zoneID)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ActivityRow({
  activity,
  subtasksByActivity,
  isSelected,
  onSelect,
  onStatusChange,
  isExpanded,
  onToggleExpand,
}: {
  activity: Activity
  subtasksByActivity: Record<number, Subtask[]>
  isSelected: boolean
  onSelect: () => void
  onStatusChange?: (activityId: number, newStatus: ActivityStatus) => void
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const subtasks = subtasksByActivity[activity.zoneID] ?? []
  const progress = subtasks.length > 0 ? calculateProgressFromSubtasks(subtasks) : activity.progress ?? 0
  const { completed, total } = getSubtaskCounts(subtasks)
  const track = getTrackLabelFromSubtasks(subtasks)
  const issues = getIssuesByActivityId(activity.zoneID)

  return (
    <div className="group">
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
          isSelected
            ? "bg-primary/10 border border-primary/30"
            : "hover:bg-secondary/40 border border-transparent"
        )}
        onClick={onSelect}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand()
          }}
          className="shrink-0 p-0.5 rounded hover:bg-secondary/60 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {getStatusIcon(activity.status)}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium truncate", isSelected ? "text-primary" : "text-foreground")}>
              {activity.name}
            </span>
            {track === "Behind" && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-destructive/10 text-destructive border-destructive/30">
                Behind
              </Badge>
            )}
            {issues.length > 0 && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-warning/10 text-warning border-warning/30">
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                {issues.length}
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {activity.description || activity.activity || "No description"}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {activity.deadline && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 hidden lg:flex">
              <Calendar className="h-3 w-3" />
              {new Date(activity.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}

          <div className="flex items-center gap-2 min-w-[100px]">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="text-[11px] font-semibold text-foreground w-8 text-right">{progress}%</span>
          </div>

          {total > 0 && (
            <span className="text-[11px] text-muted-foreground hidden md:inline">
              {completed}/{total}
            </span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
      </div>

      {isExpanded && subtasks.length > 0 && (
        <div className="ml-12 mr-3 mt-1 mb-2 space-y-1 border-l-2 border-border/40 pl-3">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary/20 transition-colors"
            >
              <div
                className={cn(
                  "h-3.5 w-3.5 rounded-full border-2 shrink-0 transition-colors",
                  subtask.completed
                    ? "bg-emerald-400 border-emerald-400"
                    : "border-muted-foreground/40"
                )}
              />
              <span
                className={cn(
                  "text-xs flex-1",
                  subtask.completed
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                )}
              >
                {subtask.title}
              </span>
              {subtask.dueDate && (
                <span className="text-[10px] text-muted-foreground">
                  {new Date(subtask.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {isExpanded && subtasks.length === 0 && (
        <div className="ml-12 mr-3 mt-1 mb-2 py-3 px-3 rounded-md bg-secondary/10 border border-dashed border-border/60">
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
  onAddActivity,
  onStatusChange,
  selectedActivityId,
}: LinearActivitiesBoardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [groupBy] = useState<GroupBy>("status")
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
        const progress = subtasks.length > 0 ? calculateProgressFromSubtasks(subtasks) : a.progress ?? 0
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

  const groupedActivities = useMemo(() => {
    if (groupBy === "none") return { all: filteredActivities }

    const groups: Record<string, Activity[]> = {}
    for (const activity of filteredActivities) {
      const key = activity.status
      if (!groups[key]) groups[key] = []
      groups[key].push(activity)
    }

    const sortedEntries = Object.entries(groups).sort(
      ([a], [b]) => getStatusOrder(a as ActivityStatus) - getStatusOrder(b as ActivityStatus)
    )

    return Object.fromEntries(sortedEntries)
  }, [filteredActivities, groupBy])

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden">
      {/* Header toolbar */}
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
                "h-7 text-xs px-2.5 capitalize",
                filter === f && "bg-secondary text-foreground"
              )}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "on-track" ? "On Track" : f === "behind" ? "Behind" : "Done"}
            </Button>
          ))}
        </div>

        <div className="flex-1" />

        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={onAddActivity}>
          <Plus className="h-3.5 w-3.5" />
          New Activity
        </Button>
      </div>

      {/* Activities list */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ListTodo className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No activities found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery ? "Try a different search" : "Add your first activity to get started"}
            </p>
          </div>
        ) : groupBy === "status" ? (
          Object.entries(groupedActivities).map(([status, acts]) => (
            <StatusGroup
              key={status}
              status={status as ActivityStatus}
              activities={acts}
              subtasksByActivity={subtasksByActivity}
              selectedActivityId={selectedActivityId}
              onActivitySelect={onActivitySelect}
              onStatusChange={onStatusChange}
              expandedActivities={expandedActivities}
              toggleExpanded={toggleExpanded}
            />
          ))
        ) : (
          filteredActivities.map((activity) => (
            <ActivityRow
              key={activity.zoneID}
              activity={activity}
              subtasksByActivity={subtasksByActivity}
              isSelected={selectedActivityId === activity.zoneID}
              onSelect={() => onActivitySelect(activity)}
              onStatusChange={onStatusChange}
              isExpanded={expandedActivities.has(activity.zoneID)}
              onToggleExpand={() => toggleExpanded(activity.zoneID)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-[11px] text-muted-foreground shrink-0">
        <span>{filteredActivities.length} activities</span>
        <span>Grouped by status</span>
      </div>
    </div>
  )
}
