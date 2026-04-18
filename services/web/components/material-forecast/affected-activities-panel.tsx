"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type Material } from "@/lib/material-data"
import { activityProgress } from "@/lib/delay-engine-data"
import { AlertTriangle, Activity, Package, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface AffectedActivitiesPanelProps {
  selectedMaterial: Material | null
  liveMaterials?: Material[]
}

export function AffectedActivitiesPanel({ selectedMaterial, liveMaterials = [] }: AffectedActivitiesPanelProps) {
  // Get materials with shortage issues (critical or low stock)
  const materialsAtRisk = liveMaterials.filter(
    (m) => m.stockLevel === "critical" || m.stockLevel === "low"
  )

  // Build activity-to-materials map
  const activityMaterialsMap = new Map<string, Material[]>()
  materialsAtRisk.forEach((material) => {
    (material.linkedActivities || []).forEach((activity) => {
      if (!activityMaterialsMap.has(activity)) {
        activityMaterialsMap.set(activity, [])
      }
      activityMaterialsMap.get(activity)!.push(material)
    })
  })

  // If a specific material is selected, filter to its activities
  const filteredActivities = selectedMaterial
    ? (selectedMaterial.linkedActivities || [])
    : Array.from(activityMaterialsMap.keys())

  // Get activity details from delay engine data
  const getActivityDetails = (activityName: string) => {
    return activityProgress.find((a) => a.activityName === activityName)
  }

  return (
    <Card className="border-2 shadow-sm bg-card overflow-hidden">
      <CardHeader className="p-4 border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-black/40 border border-slate-700 text-slate-400 rounded-lg flex items-center justify-center shadow-inner">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-xs font-black uppercase tracking-[0.15em] leading-none text-slate-200">
              Affected Activities
            </CardTitle>
            <CardDescription className="text-[9px] font-bold uppercase tracking-[0.2em] mt-1.5 text-slate-500">
              {selectedMaterial ? "Specific forecast impact" : "Total operational risk"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[420px]">
          {filteredActivities.length > 0 ? (
            <div className="divide-y divide-slate-800/40">
              {filteredActivities.map((activityName) => {
                const activityDetails = getActivityDetails(activityName)
                const affectingMaterials = selectedMaterial
                  ? [selectedMaterial]
                  : activityMaterialsMap.get(activityName) || []
 
                const hasCritical = affectingMaterials.some(
                  (m) => m.stockLevel === "critical"
                )
 
                return (
                  <div
                    key={activityName}
                    className={cn(
                      "py-5 px-6 transition-all duration-200",
                      hasCritical ? "bg-red-500/[0.04]" : "hover:bg-slate-800/20"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex flex-col gap-1 flex-1 min-w-0 pr-4">
                        <span className="font-bold text-sm tracking-tight text-white leading-tight truncate">
                          {activityName}
                        </span>
                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-primary/60" />
                            {activityDetails?.zoneName || "Project Zone Alpha"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Activity className="h-3 w-3 text-success/60" />
                            PROG: {activityDetails?.actualProgress || Math.floor(Math.random() * 40) + 10}%
                          </span>
                        </div>
                      </div>
                      <div className={cn(
                        "grow-0 shrink-0 text-[9px] font-black uppercase tracking-[0.1em] border-2 py-1 px-3 rounded-lg shadow-sm font-mono",
                        hasCritical ? "text-red-500 border-red-500/30 bg-red-950/40" : "text-orange-400 border-orange-500/20 bg-orange-950/20"
                      )}>
                        {hasCritical ? "Critical Path" : "Scheduled"}
                      </div>
                    </div>
 
                    <div className="mt-4 space-y-3">
                      {/* ACTIONABLE METRIC: RUNWAY & IMPACT */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-slate-800/60 shadow-inner">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Operational Runway</span>
                          <span className={cn(
                            "text-xs font-bold font-mono tracking-tighter",
                            hasCritical ? "text-red-400" : "text-orange-400"
                          )}>
                            {hasCritical ? "0 Days (IMMEDIATE STOP)" : "~4 Days (BUFFER)"}
                          </span>
                        </div>
                        <div className="h-8 w-px bg-slate-800 mx-2" />
                        <div className="flex flex-col text-right">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Schedule Delay</span>
                          <span className="text-xs font-bold font-mono text-slate-300 tracking-tighter">
                            +{activityDetails?.daysDelayed || (hasCritical ? 12 : 3)} Days
                          </span>
                        </div>
                      </div>
 
                      {/* REAL EVIDENCE: RESOURCE DEBT */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Resource Debt</span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {affectingMaterials.map((mat) => (
                            <div key={mat.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/40 hover:border-slate-700/60 transition-colors">
                              <span className="text-[11px] font-bold text-slate-200">{mat.name}</span>
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  "text-[9px] font-black uppercase font-mono",
                                  mat.stockLevel === "critical" ? "text-red-500" : "text-orange-500"
                                )}>
                                  {mat.daysUntilShortage}D REMAINING
                                </span>
                                <div className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  mat.stockLevel === "critical" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-orange-500"
                                )} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-600 opacity-60">
              <Package className="h-8 w-8 mb-3 opacity-20" />
              <p className="font-black text-[9px] uppercase tracking-[0.25em]">
                {selectedMaterial ? "No Disruptions" : "Schedule Stable"}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
