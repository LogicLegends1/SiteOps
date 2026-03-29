"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { zones, type Zone, getStatusColor, getStatusBorderColor } from "@/lib/site-data"
import { cn } from "@/lib/utils"

interface SiteMapProps {
  onZoneSelect: (zone: Zone) => void
  selectedZoneId?: string
}

export function SiteMap({ onZoneSelect, selectedZoneId }: SiteMapProps) {
  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Site Map</CardTitle>
            <CardDescription>Click on a zone to view details and update progress</CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className="text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Delayed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-muted" />
              <span className="text-muted-foreground">Not Started</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-square w-full rounded-lg bg-secondary/30 border border-border overflow-hidden">
          {/* Grid Lines */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="10%" height="10%" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border/50" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Zone Blocks */}
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => onZoneSelect(zone)}
              className={cn(
                "absolute rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer",
                "hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20",
                getStatusBorderColor(zone.status),
                selectedZoneId === zone.id && "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
              style={{
                left: `${zone.coordinates.x}%`,
                top: `${zone.coordinates.y}%`,
                width: `${zone.coordinates.width}%`,
                height: `${zone.coordinates.height}%`,
              }}
            >
              <div className={cn("absolute top-2 right-2 h-3 w-3 rounded-full", getStatusColor(zone.status))} />
              <div className="flex flex-col items-center gap-1 p-2 text-center">
                <span className="text-lg font-bold text-foreground">{zone.name}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">{zone.activity}</span>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs mt-1",
                    zone.status === "completed" && "bg-success/20 text-success",
                    zone.status === "in-progress" && "bg-primary/20 text-primary",
                    zone.status === "delayed" && "bg-destructive/20 text-destructive",
                    zone.status === "not-started" && "bg-muted text-muted-foreground",
                  )}
                >
                  {zone.progress}%
                </Badge>
              </div>
            </button>
          ))}

          {/* Site boundary label */}
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Project Alpha - Construction Site
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
