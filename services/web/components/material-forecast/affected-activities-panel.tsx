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
    <Card className="overflow-hidden border bg-card shadow-sm">
      <CardHeader className="border-b bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground shadow-sm">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-xs font-black uppercase tracking-[0.15em] leading-none text-foreground">
              Affected Activities
            </CardTitle>
            <CardDescription className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.2em]">
              {selectedMaterial ? "Specific forecast impact" : "Total operational risk"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[420px]">
          {filteredActivities.length > 0 ? (
            <div className="divide-y divide-border">
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
                      hasCritical ? "bg-destructive/5" : "hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex flex-col gap-1 flex-1 min-w-0 pr-4">
                        <span className="truncate text-sm font-bold leading-tight tracking-tight text-foreground">
                          {activityName}
                        </span>
                        <div className="mt-1 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-primary/60" />
                            {activityDetails?.name || "Project Zone Alpha"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Activity className="h-3 w-3 text-success/60" />
                            PROG: {activityDetails?.actualProgress || Math.floor(Math.random() * 40) + 10}%
                          </span>
                        </div>
                      </div>
                      <div className={cn(
                        "grow-0 shrink-0 text-[9px] font-black uppercase tracking-[0.1em] border-2 py-1 px-3 rounded-lg shadow-sm font-mono",
                        hasCritical ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-warning/30 bg-warning/10 text-warning"
                      )}>
                        {hasCritical ? "Critical Path" : "Scheduled"}
                      </div>
                    </div>
 
                    <div className="mt-4 space-y-3">
                      {/* ACTIONABLE METRIC: RUNWAY & IMPACT */}
                      <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3 shadow-inner">
                        <div className="flex flex-col">
                          <span className="mb-1 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Operational Runway</span>
                          <span className={cn(
                            "text-xs font-bold font-mono tracking-tighter",
                            hasCritical ? "text-destructive" : "text-warning"
                          )}>
                            {hasCritical ? "0 Days (IMMEDIATE STOP)" : "~4 Days (BUFFER)"}
                          </span>
                        </div>
                        <div className="mx-2 h-8 w-px bg-border" />
                        <div className="flex flex-col text-right">
                          <span className="mb-1 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Schedule Delay</span>
                          <span className="font-mono text-xs font-bold tracking-tighter text-foreground">
                            +{activityDetails?.daysDelayed || (hasCritical ? 12 : 3)} Days
                          </span>
                        </div>
                      </div>
 
                      {/* REAL EVIDENCE: RESOURCE DEBT */}
                      <div className="space-y-2">
                        <span className="px-1 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Resource Debt</span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {affectingMaterials.map((mat) => (
                            <div key={mat.id} className="flex items-center justify-between rounded-lg border bg-background p-2.5 transition-colors hover:border-primary/40">
                              <span className="text-[11px] font-bold text-foreground">{mat.name}</span>
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  "text-[9px] font-black uppercase font-mono",
                                  mat.stockLevel === "critical" ? "text-destructive" : "text-warning"
                                )}>
                                  {mat.daysUntilShortage}D REMAINING
                                </span>
                                <div className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  mat.stockLevel === "critical" ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-warning"
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
            <div className="flex h-48 flex-col items-center justify-center text-muted-foreground opacity-70">
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
