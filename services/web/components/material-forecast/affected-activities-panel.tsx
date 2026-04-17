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
    <Card className="border-2 shadow-sm bg-card">
      <CardHeader className="p-6 border-b-2 bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-widest leading-none">
              {selectedMaterial ? "Activity Linkage" : "Task Dependencies"}
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-2">
              {selectedMaterial ? "Projected consumption points" : "Risk-affected workflows"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[380px]">
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
                    className={`p-6 transition-colors ${
                      hasCritical ? "bg-red-950/10" : "bg-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight">{activityName}</span>
                        {activityDetails && (
                          <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mt-1.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {activityDetails.zoneName}
                            </span>
                            <span>Progress: {activityDetails.actualProgress}%</span>
                          </div>
                        )}
                      </div>
                      {activityDetails && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-black uppercase tracking-widest border border-border/50 py-1 px-3 bg-muted/20",
                            activityDetails.riskLevel === "critical" ? "text-red-400 border-red-900/50 bg-red-950/20" :
                            activityDetails.riskLevel === "high" ? "text-orange-400 border-orange-900/50 bg-orange-950/20" : ""
                          )}
                        >
                          {activityDetails.riskLevel} Risk
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mt-4">
                      {affectingMaterials.map((material) => (
                        <Badge
                          key={material.id}
                          variant="secondary"
                          className={cn(
                            "text-[10px] font-black px-3 py-1 uppercase tracking-tight border border-border/50 shadow-sm",
                            material.stockLevel === "critical" ? "bg-red-950/40 text-red-400 border-red-900/50" :
                            material.stockLevel === "low" ? "bg-orange-950/40 text-orange-400 border-orange-900/50" : "bg-muted/50 text-muted-foreground"
                          )}
                        >
                          {material.name}
                          {material.daysUntilShortage && material.daysUntilShortage <= 7 && (
                            <span className="ml-2 opacity-70 font-bold font-mono">({material.daysUntilShortage}D)</span>
                          )}
                        </Badge>
                      ))}
                    </div>

                    {hasCritical && (
                      <div className="mt-4 p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400/80 text-center">
                        Operational Disruption Predicted
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-muted-foreground opacity-40">
              <Package className="h-10 w-10 mb-2" />
              <p className="font-black text-[10px] uppercase tracking-widest">
                {selectedMaterial ? "No Active Dependencies" : "No Supply Constraints Detected"}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
