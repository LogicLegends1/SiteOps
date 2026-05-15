"use client"

import { cn } from "@/lib/utils"
import { type EquipmentSummary } from "@/lib/equipment-data"

interface EquipmentStatsProps {
  summary: EquipmentSummary
}

export function EquipmentStats({ summary }: EquipmentStatsProps) {
  const kpis = [
    { label: "Total Assets", value: summary.total, color: "text-white" },
    { label: "Active", value: summary.active, color: "text-emerald-500" },
    { label: "Idle", value: summary.idle, color: "text-amber-500" },
    { label: "Down", value: summary.underRepair, color: "text-red-500" },
    { label: "In Maintenance", value: summary.maintenanceDueCount, color: "text-indigo-400" },
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
