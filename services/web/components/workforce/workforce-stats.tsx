"use client"

import { Users, UserCheck, UserX, AlertTriangle, Briefcase, HardHat } from "lucide-react"
import { getWorkforceSummary } from "@/lib/workforce-data"
import { cn } from "@/lib/utils"

export function WorkforceStats() {
  const summary = getWorkforceSummary()

  const stats = [
    {
      title: "Total Workers",
      value: summary.total,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-900/50",
      bg: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Assigned",
      value: summary.assigned,
      icon: UserCheck,
      color: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-900/50",
      bg: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Idle",
      value: summary.idle,
      icon: Briefcase,
      color: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-900/50",
      bg: "bg-amber-50 dark:bg-amber-950/20",
    },
    {
      title: "Unavailable",
      value: summary.unavailable,
      icon: UserX,
      color: "text-muted-foreground",
      border: "border-border",
      bg: "bg-muted/30",
    },
    {
      title: "Teams",
      value: 3,
      icon: HardHat,
      color: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-200 dark:border-cyan-900/50",
      bg: "bg-cyan-50 dark:bg-cyan-950/20",
    },
    {
      title: "Workforce Gap",
      value: "Flash A",
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-900/50",
      bg: "bg-red-50 dark:bg-red-950/20",
    },
  ]

  return (
    <div className="flex items-center flex-wrap gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className={cn(
            "flex min-w-[150px] flex-1 items-start gap-3 rounded-xl border p-4 transition-all hover:shadow-sm",
            stat.bg,
            stat.border
          )}
        >
          <div className="rounded-lg border bg-background/70 p-2 shadow-sm">
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{stat.title}</span>
            <span className={cn("mt-1 text-2xl font-bold tracking-tighter", stat.color)}>{stat.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
