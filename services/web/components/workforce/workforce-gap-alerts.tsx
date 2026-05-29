"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, ArrowRight, Users, Wrench, Zap, HardHat, Monitor } from "lucide-react"
import {
  activityWorkforceRequirements,
  getDisciplineLabel,
  getRoleLabel,
  getIdleWorkers,
  type WorkerDiscipline,
} from "@/lib/workforce-data"

const disciplineIcons: Record<WorkerDiscipline, React.ElementType> = {
  civil: HardHat,
  electrical: Zap,
  mechanical: Wrench,
  qa: Users,
  safety: Users,
  general: Users,
  it: Monitor,
}

export function WorkforceGapAlerts() {
  const idleWorkers = getIdleWorkers()

  // Calculate gaps per discipline/role
  const gaps: {
    activityName: string
    name: string
    discipline: WorkerDiscipline
    role: string
    gap: number
  }[] = []

  activityWorkforceRequirements.forEach((activity) => {
    activity.requirements.forEach((req) => {
      const gap = req.requiredCount - req.assignedCount
      if (gap > 0) {
        gaps.push({
          activityName: activity.activityName,
          name: activity.name,
          discipline: req.discipline,
          role: req.role,
          gap,
        })
      }
    })
  })

  // Sort by gap size
  gaps.sort((a, b) => b.gap - a.gap)

  // Find matching idle workers for gaps
  const findMatchingWorkers = (discipline: WorkerDiscipline, role: string) => {
    return idleWorkers.filter((w) => w.discipline === discipline && w.role === role)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Workforce Gap Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {gaps.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-success mb-3" />
            <p className="text-foreground font-medium">All Positions Filled</p>
            <p className="text-sm text-muted-foreground">No workforce gaps detected</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {gaps.slice(0, 10).map((gap, index) => {
                const DisciplineIcon = disciplineIcons[gap.discipline]
                const matchingWorkers = findMatchingWorkers(gap.discipline, gap.role)

                return (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-destructive/5 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center mt-0.5">
                          <DisciplineIcon className="h-4 w-4 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {gap.gap} {getRoleLabel(gap.role)} needed
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {gap.activityName} - {gap.name}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {getDisciplineLabel(gap.discipline)}
                            </Badge>
                            {matchingWorkers.length > 0 && (
                              <Badge className="bg-success/10 text-success text-xs">
                                {matchingWorkers.length} idle {matchingWorkers.length === 1 ? "match" : "matches"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {matchingWorkers.length > 0 && (
                        <Button size="sm" variant="outline" className="gap-1">
                          Assign
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {matchingWorkers.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">Idle workers:</p>
                        <div className="flex flex-wrap gap-2">
                          {matchingWorkers.map((worker) => (
                            <Badge
                              key={worker.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {worker.name} ({worker.experienceYears}yr)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {gaps.length > 10 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Showing top 10 of {gaps.length} gaps
          </p>
        )}
      </CardContent>
    </Card>
  )
}
