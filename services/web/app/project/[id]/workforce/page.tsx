"use client"

import { useState } from "react"
import { useCallback } from "react"
import { useEffect } from "react"
import { useParams } from "next/navigation"
import type { WorkforceResponse, WorkforceSummary, WorkforceWorker, WorkforceTeam } from "@/lib/workforce-live"
import { WorkforceStats } from "@/components/workforce/workforce-stats"
import { WorkerClassification } from "@/components/workforce/worker-classification"
import { TeamManagement } from "@/components/workforce/team-management"
import { AddWorkerDialog } from "@/components/workforce/add-worker-dialog"
import { WorkforceBottomCharts } from "@/components/workforce/workforce-bottom-charts"
import {
  ActivityWorkforceDistributionPanel,
  WorkforceAllocationTimelinePanel,
} from "@/components/workforce/workforce-right-panels"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Search, SlidersHorizontal } from "lucide-react"

export default function WorkforcePage() {
  const params = useParams()
  const [workers, setWorkers] = useState<WorkforceWorker[] | null>(null)
  const [teams, setTeams] = useState<WorkforceTeam[] | null>(null)
  const [summary, setSummary] = useState<WorkforceSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const projectId =
    typeof params?.id === "string"
      ? params.id
      : typeof params?.projectId === "string"
        ? params.projectId
        : ""

  const reload = useCallback(async () => {
    if (!projectId) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/project/${projectId}/workforce`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as WorkforceResponse

      setWorkers(json.workers ?? [])
      setTeams(json.teams ?? [])
      setSummary(json.summary ?? null)
    } catch (err: any) {
      setError(err?.message || "Failed to load workforce")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    reload()
  }, [reload])

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredWorkers = (workers ?? []).filter((worker) => {
    if (!normalizedQuery) return true
    return (
      worker.name.toLowerCase().includes(normalizedQuery) ||
      worker.id.toLowerCase().includes(normalizedQuery) ||
      worker.discipline.toLowerCase().includes(normalizedQuery) ||
      worker.role.toLowerCase().includes(normalizedQuery)
    )
  })

  return (
    <div className="flex flex-col gap-4">
      {/* KPI stats (no extra inner header/banner; the page header comes from the layout) */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/60 p-6">
        <div className="flex items-center justify-end gap-2">
          {error ? (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
              {error}
            </Badge>
          ) : null}
          {loading ? (
            <Badge variant="outline" className="bg-muted/30 text-muted-foreground">
              Loading…
            </Badge>
          ) : null}
        </div>

        <WorkforceStats summary={summary} loading={loading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main column */}
        <div className="space-y-4">
          <Tabs defaultValue="classification" className="w-full">
            <Card className="border-border/60 bg-card/60">
              <CardHeader className="gap-4">
                  {/* Search row (UI only) — above the main tabs like the screenshot */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search"
                        className="pl-9 bg-muted/10 border-border/60"
                      />
                    </div>
                    <Button variant="outline" size="icon" className="border-border/60 bg-muted/10">
                      <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  {/* Main tabs */}
                  <TabsList className="h-10 w-full max-w-md rounded-xl border border-border/60 bg-muted/20 p-1">
                    <TabsTrigger
                      value="classification"
                      className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-bold"
                    >
                      Worker Classification
                    </TabsTrigger>
                    <TabsTrigger
                      value="teams"
                      className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-bold"
                    >
                      Teams
                    </TabsTrigger>
                  </TabsList>
              </CardHeader>

              <CardContent className="space-y-4">
                <TabsContent value="classification" className="m-0">
                  <WorkerClassification
                    workers={filteredWorkers}
                    teams={teams ?? []}
                    toolbarRight={<AddWorkerDialog projectId={projectId} onWorkerAdded={reload} />}
                  />
                </TabsContent>

                <TabsContent value="teams" className="m-0">
                  <TeamManagement projectId={projectId} teams={teams ?? []} workers={workers ?? []} onTeamCreated={reload} />
                </TabsContent>

                {/* Bottom charts inside the main card (closer to screenshot) */}
                <WorkforceBottomCharts />
              </CardContent>
            </Card>
          </Tabs>
        </div>

        {/* Right column (hard-coded for now) */}
        <div className="space-y-4">
          <ActivityWorkforceDistributionPanel />
          <WorkforceAllocationTimelinePanel />
        </div>
      </div>
    </div>
  )
}
