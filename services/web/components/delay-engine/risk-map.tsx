"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ActivityProgress, getRiskLevelColor, RiskLevel } from "@/lib/delay-engine-data"
import { MapPin, AlertTriangle } from "lucide-react"

interface RiskMapProps {
  activities: ActivityProgress[]
  onSelectZone: (zoneId: string) => void
  selectedZoneId: string | null
}

interface ZoneData {
  zoneId: string
  name: string
  activities: ActivityProgress[]
  overallRisk: RiskLevel
  coordinates: { x: number; y: number; width: number; height: number }
}

const zoneCoordinates: Record<string, { x: number; y: number; width: number; height: number }> = {
  "zone-a": { x: 5, y: 5, width: 42, height: 42 },
  "zone-b": { x: 53, y: 5, width: 42, height: 42 },
  "zone-c": { x: 5, y: 53, width: 42, height: 42 },
  "zone-d": { x: 53, y: 53, width: 42, height: 42 },
}

function calculateZoneRisk(activities: ActivityProgress[]): RiskLevel {
  if (activities.length === 0) return "low"
  const riskScores = activities.map((a) => {
    switch (a.riskLevel) {
      case "critical": return 4
      case "high": return 3
      case "medium": return 2
      case "low": return 1
      default: return 0
    }
  })
  const maxScore = Math.max(...riskScores)
  if (maxScore >= 4) return "critical"
  if (maxScore >= 3) return "high"
  if (maxScore >= 2) return "medium"
  return "low"
}

function getRiskFillColor(risk: RiskLevel): string {
  switch (risk) {
    case "critical": return "fill-destructive/30 stroke-destructive"
    case "high": return "fill-warning/30 stroke-warning"
    case "medium": return "fill-amber-500/30 stroke-amber-500"
    case "low": return "fill-success/30 stroke-success"
    default: return "fill-muted/30 stroke-muted"
  }
}

export function RiskMap({ activities, onSelectZone, selectedZoneId }: RiskMapProps) {
  // Group activities by zone
  const zoneData: ZoneData[] = Object.entries(zoneCoordinates).map(([zoneId, coords]) => {
    const zoneActivities = activities.filter((a) => a.zoneId === zoneId)
    const name = zoneActivities[0]?.name || zoneId.replace("-", " ").toUpperCase()
    return {
      zoneId,
      name,
      activities: zoneActivities,
      overallRisk: calculateZoneRisk(zoneActivities),
      coordinates: coords,
    }
  })

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Site Risk Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="relative aspect-square w-full max-w-md mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Background grid */}
              <rect x="0" y="0" width="100" height="100" className="fill-muted/20" rx="4" />
              
              {/* Grid lines */}
              <line x1="50" y1="0" x2="50" y2="100" className="stroke-border" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" className="stroke-border" strokeWidth="0.5" />

              {/* Zone areas */}
              {zoneData.map((zone) => (
                <Tooltip key={zone.zoneId}>
                  <TooltipTrigger asChild>
                    <g
                      className="cursor-pointer transition-all"
                      onClick={() => onSelectZone(zone.zoneId)}
                    >
                      <rect
                        x={zone.coordinates.x}
                        y={zone.coordinates.y}
                        width={zone.coordinates.width}
                        height={zone.coordinates.height}
                        className={`${getRiskFillColor(zone.overallRisk)} transition-all ${
                          selectedZoneId === zone.zoneId
                            ? "stroke-[3]"
                            : "stroke-[1.5] hover:stroke-[2]"
                        }`}
                        rx="2"
                      />
                      {/* Zone label */}
                      <text
                        x={zone.coordinates.x + zone.coordinates.width / 2}
                        y={zone.coordinates.y + 12}
                        className="fill-foreground text-[6px] font-medium"
                        textAnchor="middle"
                      >
                        {zone.name}
                      </text>
                      {/* Risk indicator */}
                      {zone.overallRisk !== "low" && (
                        <g transform={`translate(${zone.coordinates.x + zone.coordinates.width - 10}, ${zone.coordinates.y + 4})`}>
                          <circle r="4" className={`${zone.overallRisk === "critical" ? "fill-destructive" : zone.overallRisk === "high" ? "fill-warning" : "fill-amber-500"}`} />
                        </g>
                      )}
                      {/* Activity count */}
                      <text
                        x={zone.coordinates.x + zone.coordinates.width / 2}
                        y={zone.coordinates.y + zone.coordinates.height / 2 + 2}
                        className="fill-muted-foreground text-[5px]"
                        textAnchor="middle"
                      >
                        {zone.activities.length} activities
                      </text>
                    </g>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium">{zone.name}</span>
                        <Badge className={`capitalize ${getRiskLevelColor(zone.overallRisk)}`}>
                          {zone.overallRisk} risk
                        </Badge>
                      </div>
                      {zone.activities.length > 0 ? (
                        <div className="space-y-1">
                          {zone.activities.map((act) => (
                            <div key={act.id} className="flex items-center justify-between text-xs">
                              <span>{act.activityName}</span>
                              <span className={act.variance < 0 ? "text-destructive" : "text-muted-foreground"}>
                                {act.variance}%
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No activities in this zone</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </svg>
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-success/30 border border-success" />
            <span className="text-xs text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500/30 border border-amber-500" />
            <span className="text-xs text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-warning/30 border border-warning" />
            <span className="text-xs text-muted-foreground">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-destructive/30 border border-destructive" />
            <span className="text-xs text-muted-foreground">Critical</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
