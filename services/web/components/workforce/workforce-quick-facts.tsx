"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { WorkforceTeam, WorkforceWorker } from "@/lib/workforce-live"

export function WorkforceQuickFacts({
  workers,
  teams,
}: {
  workers: WorkforceWorker[]
  teams: WorkforceTeam[]
}) {
  const total = workers.length
  const unassigned = workers.filter((worker) => !worker.assignedTeamId).length
  const unavailable = workers.filter((worker) => worker.status === "unavailable").length

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-black tracking-wide">Workforce Quick Facts</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-border/60 bg-muted/10 text-muted-foreground">
          Total: <span className="ml-1 font-black text-foreground">{total}</span>
        </Badge>
        <Badge variant="outline" className="border-border/60 bg-muted/10 text-muted-foreground">
          Unassigned: <span className="ml-1 font-black text-foreground">{unassigned}</span>
        </Badge>
        <Badge variant="outline" className="border-border/60 bg-muted/10 text-muted-foreground">
          Unavailable: <span className="ml-1 font-black text-foreground">{unavailable}</span>
        </Badge>
        <Badge variant="outline" className="border-border/60 bg-muted/10 text-muted-foreground">
          Teams: <span className="ml-1 font-black text-foreground">{teams.length}</span>
        </Badge>
      </CardContent>
    </Card>
  )
}
