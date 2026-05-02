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
      color: "text-blue-400",
      border: "border-blue-900/50",
      bg: "bg-blue-950/20",
    },
    {
      title: "Assigned",
      value: summary.assigned,
      icon: UserCheck,
      color: "text-green-400",
      border: "border-green-900/50",
      bg: "bg-green-950/20",
    },
    {
      title: "Idle",
      value: summary.idle,
      icon: Briefcase,
      color: "text-amber-400",
      border: "border-amber-900/50",
      bg: "bg-amber-950/20",
    },
    {
      title: "Unavailable",
      value: summary.unavailable,
      icon: UserX,
      color: "text-slate-300",
      border: "border-slate-700/50",
      bg: "bg-slate-900/30",
    },
    {
      title: "Teams",
      value: 3,
      icon: HardHat,
      color: "text-cyan-400",
      border: "border-cyan-900/50",
      bg: "bg-cyan-950/20",
    },
    {
      title: "Workforce Gap",
      value: "Flash A",
      icon: AlertTriangle,
      color: "text-red-400",
      border: "border-red-900/50",
      bg: "bg-red-950/20",
    },
  ]

  return (
    <div className="flex items-center flex-wrap gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className={cn(
            "flex min-w-[150px] flex-1 items-start gap-3 rounded-xl border p-4 transition-all hover:bg-muted/10",
            stat.bg,
            stat.border
          )}
        >
          <div className="rounded-lg border border-white/10 bg-black/20 p-2">
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">{stat.title}</span>
            <span className={cn("mt-1 text-2xl font-bold tracking-tighter", stat.color)}>{stat.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
