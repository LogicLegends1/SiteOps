"use client"

import { Badge } from "@/components/ui/badge"
import { type ActivityStatus, getStatusColor, getStatusIcon, getStatusLabel } from "@/lib/site-data"
import { cn } from "@/lib/utils"

interface ActivityStatusBadgeProps {
  status: ActivityStatus
  className?: string
  size?: "sm" | "md" | "lg"
}

export function ActivityStatusBadge({ status, className, size = "md" }: ActivityStatusBadgeProps) {
  const statusColor = getStatusColor(status)
  const statusIcon = getStatusIcon(status)
  const statusLabel = getStatusLabel(status)

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  }

  return (
    <Badge
      className={cn(
        "flex items-center gap-2 font-medium",
        statusColor,
        sizeClasses[size],
        className
      )}
    >
      <span className="text-lg leading-none">{statusIcon}</span>
      <span>{statusLabel}</span>
    </Badge>
  )
}
