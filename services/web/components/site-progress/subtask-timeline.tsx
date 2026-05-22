"use client"

import { type Subtask } from "@/lib/subtasks-data"
import { SubtaskProgressModal } from "@/components/site-progress/subtask-progress-modal"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, Calendar, User } from "lucide-react"

interface SubtaskTimelineProps {
  subtasks: Subtask[]
  onAddUpdate: (subtaskId: string, description: string) => void
  onToggleComplete?: (subtaskId: string) => void
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function SubtaskTimeline({ subtasks, onAddUpdate, onToggleComplete }: SubtaskTimelineProps) {
  const sorted = [...subtasks].sort((a, b) => a.order - b.order)

  if (!sorted.length) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Timeline is driven by subtasks. None are defined for this activity.
      </p>
    )
  }

  return (
    <div className="space-y-0">
      {sorted.map((subtask, index) => (
        <div key={subtask.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => onToggleComplete?.(subtask.id)}
              disabled={!onToggleComplete}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                subtask.completed
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border bg-secondary/30 text-muted-foreground",
                onToggleComplete && "hover:border-primary/50 cursor-pointer"
              )}
            >
              {subtask.completed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>
            {index < sorted.length - 1 && <div className="w-0.5 flex-1 min-h-[24px] bg-border my-1" />}
          </div>

          <div className="flex-1 pb-6 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h4
                  className={cn(
                    "font-semibold text-sm",
                    subtask.completed ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {subtask.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Due {formatDate(subtask.dueDate)}
                  <span className="text-border">|</span>
                  <span>
                    Step {subtask.order}/{sorted.length}
                  </span>
                </div>
              </div>
              <SubtaskProgressModal
                subtask={subtask}
                onSubmit={(desc) => onAddUpdate(subtask.id, desc)}
              />
            </div>

            {subtask.updates.length > 0 ? (
              <div className="mt-3 space-y-2 pl-3 border-l-2 border-primary/30">
                {subtask.updates.map((update) => (
                  <div
                    key={update.id}
                    className="rounded-lg border border-border bg-secondary/20 p-3"
                  >
                    <p className="text-sm text-foreground">{update.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateTime(update.updatedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {update.updatedBy}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-2 italic">No updates yet</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
