"use client"

import { type Subtask } from "@/lib/subtasks-data"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle } from "lucide-react"

interface SubtasksListProps {
  subtasks: Subtask[]
  onToggleComplete?: (subtaskId: string) => void
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function SubtasksList({ subtasks, onToggleComplete }: SubtasksListProps) {
  if (!subtasks.length) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">No subtasks defined</p>
    )
  }

  const sorted = [...subtasks].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-2">
      {sorted.map((subtask, index) => (
        <button
          key={subtask.id}
          type="button"
          onClick={() => onToggleComplete?.(subtask.id)}
          disabled={!onToggleComplete}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors",
            subtask.completed ? "bg-primary/5" : "bg-secondary/20",
            onToggleComplete && "hover:bg-secondary/40 cursor-pointer",
            !onToggleComplete && "cursor-default"
          )}
        >
          {subtask.completed ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
          ) : (
            <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm font-medium",
                subtask.completed ? "text-muted-foreground line-through" : "text-foreground"
              )}
            >
              {subtask.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(subtask.dueDate)}</p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {index + 1}/{sorted.length}
          </span>
        </button>
      ))}
    </div>
  )
}
