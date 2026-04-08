"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { materials, type Material } from "@/lib/material-data"
import { activityProgress } from "@/lib/delay-engine-data"
import { AlertTriangle, Activity, Package, MapPin } from "lucide-react"

interface AffectedActivitiesPanelProps {
  selectedMaterial: Material | null
}

export function AffectedActivitiesPanel({ selectedMaterial }: AffectedActivitiesPanelProps) {
  // Get materials with shortage issues (critical or low stock)
  const materialsAtRisk = materials.filter(
    (m) => m.stockLevel === "critical" || m.stockLevel === "low"
  )

  // Build activity-to-materials map
  const activityMaterialsMap = new Map<string, Material[]>()
  materialsAtRisk.forEach((material) => {
    material.linkedActivities.forEach((activity) => {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {selectedMaterial ? "Linked Activities" : "Activities Affected by Shortages"}
        </CardTitle>
        <CardDescription>
          {selectedMaterial
            ? `Activities that use ${selectedMaterial.name}`
            : "Activities at risk due to material shortages"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          {filteredActivities.length > 0 ? (
            <div className="space-y-3">
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
                    className={`p-4 rounded-lg border ${
                      hasCritical ? "border-destructive/50 bg-destructive/5" : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activityName}</span>
                        {hasCritical && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      {activityDetails && (
                        <Badge
                          variant="outline"
                          className={
                            activityDetails.riskLevel === "critical"
                              ? "border-destructive text-destructive"
                              : activityDetails.riskLevel === "high"
                              ? "border-warning text-warning"
                              : ""
                          }
                        >
                          {activityDetails.riskLevel} risk
                        </Badge>
                      )}
                    </div>

                    {activityDetails && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {activityDetails.zoneName}
                        </span>
                        <span>Progress: {activityDetails.actualProgress}%</span>
                        <span>Team: {activityDetails.assignedTeam}</span>
                      </div>
                    )}

                    {/* Materials affecting this activity */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mr-1">Materials:</span>
                      {affectingMaterials.map((material) => (
                        <Badge
                          key={material.id}
                          variant="secondary"
                          className={`text-xs ${
                            material.stockLevel === "critical"
                              ? "bg-destructive/20 text-destructive border-destructive/30"
                              : material.stockLevel === "low"
                              ? "bg-warning/20 text-warning border-warning/30"
                              : ""
                          }`}
                        >
                          {material.name.split(" ")[0]}
                          {material.daysUntilShortage && material.daysUntilShortage <= 7 && (
                            <span className="ml-1">({material.daysUntilShortage}d)</span>
                          )}
                        </Badge>
                      ))}
                    </div>

                    {/* Impact warning */}
                    {hasCritical && (
                      <div className="mt-3 p-2 bg-destructive/10 rounded text-xs text-destructive">
                        This activity may be disrupted due to critical material shortage
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              {selectedMaterial
                ? "No activities linked to this material"
                : "No activities currently affected by shortages"}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
