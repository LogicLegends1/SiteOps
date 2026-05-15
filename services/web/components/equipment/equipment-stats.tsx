"use client"

import { cn } from "@/lib/utils"
import { type EquipmentSummary } from "@/lib/equipment-data"

interface EquipmentStatsProps {
  summary: EquipmentSummary
}

export function EquipmentStats({ summary }: EquipmentStatsProps) {
  const kpis = [
    { label: "Total Assets", value: summary.total, color: "text-blue-400", border: "border-blue-900/50", bg: "bg-blue-950/20" },
    { label: "Active Deployment", value: summary.active, color: "text-emerald-400", border: "border-emerald-900/50", bg: "bg-emerald-950/20" },
    { label: "Idle Inventory", value: summary.idle, color: "text-amber-400", border: "border-amber-900/50", bg: "bg-amber-950/20" },
    { label: "Offline/Broken", value: summary.underRepair, color: "text-red-400", border: "border-red-900/50", bg: "bg-red-950/20" },
    { label: "Service Due", value: summary.maintenanceDueCount, color: "text-primary", border: "border-primary/20", bg: "bg-primary/10" },
  ]

  return (
    <div className="flex items-center gap-8">
      {kpis.map((stat, i) => (
        <div key={i} className="flex flex-col min-w-[100px] border-r border-zinc-800 last:border-none pr-8">
          <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{stat.label}</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={cn("text-3xl font-black tracking-tighter", stat.color)}>{stat.value}</span>
            <span className="text-[10px] font-bold text-zinc-600 uppercase">Units</span>
          </div>
        </div>
      ))}
    </div>
  )
}
