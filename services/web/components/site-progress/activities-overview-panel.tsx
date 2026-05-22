"use client"

import { type Activity } from "@/lib/site-data"
import {
  type Subtask,
  calculateProgressFromSubtasks,
  getSubtaskCounts,
  getTrackLabelFromSubtasks,
} from "@/lib/subtasks-data"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LayoutList } from "lucide-react"

interface ActivitiesOverviewPanelProps {
  activities: Activity[]
  subtasksByActivity: Record<number, Subtask[]>
  selectedActivityId?: number
  onActivitySelect: (activity: Activity) => void
}

function trackBadgeClass(label: ReturnType<typeof getTrackLabelFromSubtasks>) {
  switch (label) {
    case "On Track":
      return "bg-primary/15 text-primary border-primary/30"
    default:
      return "bg-destructive/15 text-destructive border-destructive/30"
  }
}

export function ActivitiesOverviewPanel({
  activities,
  subtasksByActivity,
  selectedActivityId,
  onActivitySelect,
}: ActivitiesOverviewPanelProps) {
  const inProgress = activities.filter((a) => {
    const subtasks = subtasksByActivity[a.zoneID] ?? []
    const progress =
      subtasks.length > 0
        ? calculateProgressFromSubtasks(subtasks)
        : a.progress ?? 0
    return progress > 0 && progress < 100
  })

  return (
    <div className="flex flex-col h-full min-h-0 bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border shrink-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <LayoutList className="h-3.5 w-3.5 text-primary" />
          Activities Overview
        </h3>
        <p className="text-[10px] text-muted-foreground mt-1">
          {inProgress.length} in progress · {activities.length} total — click to inspect
        </p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
        {activities.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">No activities yet</p>
        ) : (
          activities.map((activity) => {
            const subtasks = subtasksByActivity[activity.zoneID] ?? []
            const progress =
              subtasks.length > 0
                ? calculateProgressFromSubtasks(subtasks)
                : activity.progress ?? 0
            const { completed, total } = getSubtaskCounts(subtasks)
            const track = getTrackLabelFromSubtasks(subtasks)
            const isSelected = selectedActivityId === activity.zoneID
            const subtitle =
              activity.description || activity.activity || "No description"

            return (
              <button
                key={activity.zoneID}
                type="button"
                onClick={() => onActivitySelect(activity)}
                className={cn(
                  "w-full text-left rounded-lg border px-2.5 py-2 transition-all",
                  isSelected
                    ? "border-primary/60 bg-primary/10 shadow-sm shadow-primary/10"
                    : "border-border/80 bg-secondary/15 hover:bg-secondary/30 hover:border-border"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-xs font-bold truncate",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {activity.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {subtitle}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-[9px] h-5 px-1.5 shrink-0", trackBadgeClass(track))}
                  >
                    {track}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
                  <span>
                    {total > 0 ? `${completed}/${total} steps` : "No subtasks"}
                  </span>
                  <span className="font-bold text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1 mt-1" />
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
