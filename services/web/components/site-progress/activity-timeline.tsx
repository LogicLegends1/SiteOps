"use client"

import { type ProgressUpdate, getStatusIcon, getStatusLabel } from "@/lib/site-data"
import { cn } from "@/lib/utils"
import { Calendar, User, FileText, Images } from "lucide-react"

interface ActivityTimelineProps {
  updates: ProgressUpdate[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ActivityTimeline({ updates }: ActivityTimelineProps) {
  if (!updates || updates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No progress updates yet</p>
      </div>
    )
  }

  // Sort updates by date in descending order (newest first)
  const sortedUpdates = [...updates].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return (
    <div className="space-y-4">
      {sortedUpdates.map((update, index) => (
        <div key={update.id} className="flex gap-4">
          {/* Timeline connector */}
          <div className="flex flex-col items-center">
            {/* Status icon dot */}
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50 border-2 border-border">
              <span className="text-lg">{getStatusIcon(update.status)}</span>
            </div>
            {/* Line to next item */}
            {index !== sortedUpdates.length - 1 && (
              <div className="h-12 w-0.5 bg-border mt-2" />
            )}
          </div>

          {/* Timeline content */}
          <div className="flex-1 pb-4">
            {/* Header with date and status */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{update.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-secondary text-foreground">
                    {getStatusLabel(update.status)}
                  </span>

                </div>
              </div>
            </div>

            {/* Description */}
            {update.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {update.description}
              </p>
            )}

            {/* Notes */}
            {update.notes && (
              <div className="mt-2 p-2 rounded bg-secondary/30 border border-border">
                <p className="text-xs font-medium text-foreground mb-1">Notes:</p>
                <p className="text-xs text-muted-foreground">{update.notes}</p>
              </div>
            )}

            {/* Images section */}
            {update.images && update.images.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Images className="h-3 w-3" />
                  Site Photos ({update.images.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {update.images.map((image, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded bg-secondary/50 border border-border overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`Update ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer with metadata */}
            <div className="flex flex-col gap-1 mt-3 pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(update.updatedAt)}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                {update.updatedBy}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
