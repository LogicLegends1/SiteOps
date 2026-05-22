"use client"

import type { ComponentType } from "react"
import { type Activity } from "@/lib/site-data"
import { getTrackLabelFromSubtasks, type Subtask } from "@/lib/subtasks-data"
import {
  LayoutList,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Users,
} from "lucide-react"

interface SiteProgressKpiStripProps {
  activities: Activity[]
  subtasksByActivity: Record<number, Subtask[]>
  teamOnline: number
  teamTotal: number
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClass,
}: {
  label: string
  value: string | number
  hint: string
  icon: ComponentType<{ className?: string }>
  iconClass: string
}) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-card border border-border rounded-xl hover:border-primary/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          <span className="text-2xl font-semibold text-foreground leading-tight">{value}</span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground">{hint}</span>
    </div>
  )
}

export function SiteProgressKpiStrip({
  activities,
  subtasksByActivity,
  teamOnline,
  teamTotal,
}: SiteProgressKpiStripProps) {
  let inProgress = 0
  let onTrack = 0
  let behind = 0

  for (const activity of activities) {
    const subtasks = subtasksByActivity[activity.zoneID] ?? []
    const progress =
      subtasks.length > 0
        ? Math.round(
            (subtasks.filter((s) => s.completed).length / subtasks.length) * 100
          )
        : activity.progress ?? 0

    if (progress > 0 && progress < 100) inProgress++
    const track = getTrackLabelFromSubtasks(subtasks)
    if (track === "On Track") onTrack++
    else behind++
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
      <KpiCard
        label="Total Activities"
        value={activities.length}
        hint="Mapped work zones on site"
        icon={LayoutList}
        iconClass="bg-primary/10 text-primary"
      />
      <KpiCard
        label="In Progress"
        value={inProgress}
        hint="Between 1% and 99% complete"
        icon={TrendingUp}
        iconClass="bg-blue-500/10 text-blue-400"
      />
      <KpiCard
        label="On Track"
        value={onTrack}
        hint="No overdue incomplete subtasks"
        icon={CheckCircle2}
        iconClass="bg-success/10 text-success"
      />
      <KpiCard
        label="Behind Schedule"
        value={behind}
        hint="Overdue incomplete subtask(s)"
        icon={AlertTriangle}
        iconClass="bg-warning/10 text-warning"
      />
      <KpiCard
        label="Team On Site"
        value={teamOnline}
        hint={`${teamOnline} online of ${teamTotal} workers`}
        icon={Users}
        iconClass="bg-primary/10 text-primary"
      />
    </div>
  )
}
