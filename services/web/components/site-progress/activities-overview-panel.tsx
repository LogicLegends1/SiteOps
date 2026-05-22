"use client"

import { type Activity } from "@/lib/site-data"
import {
  type Subtask,
  calculateProgressFromSubtasks,
  getSubtaskCounts,
  getTrackLabel,
} from "@/lib/subtasks-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

function trackBadgeClass(label: ReturnType<typeof getTrackLabel>) {
  switch (label) {
    case "On Track":
      return "bg-primary/20 text-primary border-primary/30"
    case "At Risk":
      return "bg-warning/20 text-warning border-warning/30"
    default:
      return "bg-destructive/20 text-destructive border-destructive/30"
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
    const progress = calculateProgressFromSubtasks(subtasks)
    return progress > 0 && progress < 100
  })

  return (
    <Card className="bg-card border-border flex-1 flex flex-col min-h-0 overflow-hidden">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <LayoutList className="h-4 w-4 text-primary" />
          Activities Overview
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {inProgress.length} activit{inProgress.length === 1 ? "y" : "ies"} in progress
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-2 pt-0 min-h-0">
        {activities.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No activities yet</p>
        ) : (
          activities.map((activity) => {
            const subtasks = subtasksByActivity[activity.zoneID] ?? []
            const progress =
              subtasks.length > 0
                ? calculateProgressFromSubtasks(subtasks)
                : activity.progress ?? 0
            const { completed, total } = getSubtaskCounts(subtasks)
            const track = getTrackLabel(progress)
            const isSelected = selectedActivityId === activity.zoneID

            return (
              <button
                key={activity.zoneID}
                type="button"
                onClick={() => onActivitySelect(activity)}
                className={cn(
                  "w-full text-left rounded-lg border p-3 transition-colors",
                  isSelected
                    ? "border-primary/50 bg-primary/10"
                    : "border-border bg-secondary/20 hover:bg-secondary/40"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-medium text-foreground line-clamp-1">
                    {activity.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] shrink-0", trackBadgeClass(track))}
                  >
                    {track}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>
                    {total > 0 ? `${completed}/${total} subtasks` : "No subtasks yet"}
                  </span>
                  <span className="font-semibold text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </button>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
