"use client"

import { Users, UserCheck, UserX, Briefcase, HardHat } from "lucide-react"
import type { WorkforceSummary } from "@/lib/workforce-live"
import { cn } from "@/lib/utils"

type WorkforceStatsProps = {
  summary: WorkforceSummary | null
  loading?: boolean
}

export function WorkforceStats({ summary, loading = false }: WorkforceStatsProps) {
  const stats = [
    {
      title: "Total Workers",
      value: summary?.total ?? 0,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50/60 dark:bg-blue-950/20",
    },
    {
      title: "Assigned",
      value: summary?.assigned ?? 0,
      icon: UserCheck,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50/60 dark:bg-green-950/20",
    },
    {
      title: "Idle",
      value: summary?.idle ?? 0,
      icon: Briefcase,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50/60 dark:bg-amber-950/20",
    },
    {
      title: "Unavailable",
      value: summary?.unavailable ?? 0,
      icon: UserX,
      color: "text-muted-foreground",
      bg: "bg-muted/30",
    },
    {
      title: "Teams",
      value: summary?.teams ?? 0,
      icon: HardHat,
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-50/60 dark:bg-cyan-950/20",
    },
  ]

  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className={cn(
            "relative flex items-start gap-3 rounded-xl border border-border/60 p-4 transition-all hover:shadow-sm",
            stat.bg,
            loading ? "opacity-60" : "opacity-100"
          )}
        >
          <div className="rounded-lg border border-border/60 bg-background/70 p-2 shadow-sm">
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{stat.title}</span>
            <span className={cn("mt-1 text-2xl font-bold tracking-tighter", stat.color)}>{stat.value}</span>
          </div>

          {/* Accent bar (visual only) */}
          <div className="absolute bottom-2 left-4 right-4">
            <div className={cn("h-1 w-full rounded-full bg-current opacity-70", stat.color)} />
          </div>
        </div>
      ))}
    </div>
  )
}
