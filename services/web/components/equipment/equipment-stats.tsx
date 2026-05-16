"use client"

import { cn } from "@/lib/utils"
import { type EquipmentSummary } from "@/lib/equipment-data"

interface EquipmentStatsProps {
  summary: EquipmentSummary
}

export function EquipmentStats({ summary }: EquipmentStatsProps) {
  const kpis = [
    { label: "Total Assets", value: summary.total, color: "text-foreground" },
    { label: "Active", value: summary.active, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Idle", value: summary.idle, color: "text-amber-600 dark:text-amber-400" },
    { label: "Down", value: summary.underRepair, color: "text-destructive" },
    { label: "In Maintenance", value: summary.maintenanceDueCount, color: "text-indigo-600 dark:text-indigo-400" },
  ]

  return (
    <div className="flex flex-wrap items-center gap-4">
      {kpis.map((stat, i) => (
        <div key={i} className="min-w-[120px] rounded-xl border bg-background/70 p-4 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={cn("text-3xl font-black tracking-tighter", stat.color)}>{stat.value}</span>
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Units</span>
          </div>
        </div>
      ))}
    </div>
  )
}
