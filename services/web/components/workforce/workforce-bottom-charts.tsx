"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DonutChart, { type DonutChartSegment } from "@/components/charts/DonutChart"
import { cn } from "@/lib/utils"

const allocationByDiscipline: DonutChartSegment[] = [
  { key: "civil", label: "Civil", value: 13, colorClass: "text-blue-500" },
  { key: "mechanical", label: "Mechanical", value: 3, colorClass: "text-amber-500" },
  { key: "electrical", label: "Electrical", value: 2, colorClass: "text-emerald-500" },
  { key: "hse", label: "HSE", value: 2, colorClass: "text-violet-500" },
]

const teamStatus = [
  { name: "Flash A", active: 82, idle: 18 },
  { name: "Thunder", active: 76, idle: 24 },
  { name: "Electrical", active: 88, idle: 12 },
  { name: "HSE", active: 96, idle: 4 },
]

export function WorkforceBottomCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border/60 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-black tracking-wide">Allocation By Discipline (Chart)</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart segments={allocationByDiscipline} centerLabel="Total" className="w-full" />
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-black tracking-wide">Team Status Overview (Chart)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {teamStatus.map((team) => (
            <div key={team.name} className="grid grid-cols-[110px_1fr] items-center gap-3">
              <div className="text-xs text-muted-foreground truncate">{team.name}</div>
              <div className="h-3 overflow-hidden rounded-full border border-border/60 bg-muted/20">
                <div className="flex h-full w-full">
                  <div
                    className={cn("h-full bg-emerald-500/80")}
                    style={{ width: `${team.active}%` }}
                    aria-label="active"
                  />
                  <div
                    className={cn("h-full bg-destructive/70")}
                    style={{ width: `${team.idle}%` }}
                    aria-label="idle"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
              Active
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive/70" />
              Idle
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
