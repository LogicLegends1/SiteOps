"use client"

import { useState } from "react"
import { useEffect } from "react"
import { useParams } from "next/navigation"
import type { WorkforceWorker, WorkforceTeam } from "@/lib/workforce-live"
import { WorkforceStats } from "@/components/workforce/workforce-stats"
import { WorkerClassification } from "@/components/workforce/worker-classification"
import { TeamManagement } from "@/components/workforce/team-management"
import { ActivityWorkforceTable } from "@/components/workforce/activity-workforce-table"
import { WorkforceGapAlerts } from "@/components/workforce/workforce-gap-alerts"
import { AddWorkerDialog } from "@/components/workforce/add-worker-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserPlus, X } from "lucide-react"

export default function WorkforcePage() {
  const params = useParams()
  const [workers, setWorkers] = useState<WorkforceWorker[] | null>(null)
  const [teams, setTeams] = useState<WorkforceTeam[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  const handleWorkerSelect = (workerId: string, selected: boolean) => {
    if (selected) {
      setSelectedWorkers((prev) => [...prev, workerId])
    } else {
      setSelectedWorkers((prev) => prev.filter((id) => id !== workerId))
    }
  }

  const handleClearSelection = () => {
    setSelectedWorkers([])
    setSelectionMode(false)
  }

  const handleTeamCreated = () => {
    setSelectionMode(false)
  }

  useEffect(() => {
    const projectId = params?.id || params?.projectId || params?.["id"]
    if (!projectId) return

    let aborted = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/project/${projectId}/workforce`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (aborted) return
        setWorkers(json.workers ?? [])
        setTeams(json.teams ?? [])
      } catch (err: any) {
        if (!aborted) setError(err?.message || "Failed to load workforce")
      } finally {
        if (!aborted) setLoading(false)
      }
    }

    load()

    return () => {
      aborted = true
    }
  }, [params])

  return (
    <div className="flex flex-col gap-6">
      {/* Header + KPI Strip */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 rounded-2xl border bg-card/95 p-8 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-md">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase leading-tight">
              Labor & Crew <span className="text-primary font-bold">Management</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
              Team Capacity and Staffing Monitor
            </p>
          </div>
        </div>

        <WorkforceStats />
      </div>

      <div className="flex items-center justify-end gap-2">
        <AddWorkerDialog 
          projectId={typeof params?.id === 'string' ? params.id : typeof params?.projectId === 'string' ? params.projectId : ''} 
          onWorkerAdded={() => {
            // Trigger a re-fetch of the workforce data
            const projectId = params?.id || params?.projectId || params?.["id"]
            if (projectId) {
              fetch(`/api/project/${projectId}/workforce`)
                .then(res => res.json())
                .then(json => {
                   setWorkers(json.workers ?? [])
                   setTeams(json.teams ?? [])
                })
            }
          }} 
        />
        {selectionMode ? (
          <>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {selectedWorkers.length} workers selected
            </Badge>
            <Button variant="outline" size="sm" onClick={handleClearSelection}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setSelectionMode(true)}>
            <UserPlus className="h-4 w-4 mr-1" />
            Select Workers for Team
          </Button>
        )}
      </div>

      {/* Selection Mode Banner */}
      {selectionMode && (
        <Card className="bg-primary/5 border-primary">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <p className="text-sm text-foreground">
                  <span className="font-medium">Selection Mode Active:</span> Click on idle workers in the
                  classification panel to add them to a new team
                </p>
              </div>
              {selectedWorkers.length > 0 && (
                <p className="text-sm text-primary font-medium">
                  {selectedWorkers.length} worker{selectedWorkers.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workforce Views */}
      <Tabs defaultValue="classification" className="w-full space-y-6">
        <TabsList className="grid h-12 w-full max-w-5xl grid-cols-4 rounded-xl border bg-muted/60 p-1">
          <TabsTrigger
            value="classification"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest"
          >
            Worker Classification
          </TabsTrigger>
          <TabsTrigger
            value="teams"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest"
          >
            Teams
          </TabsTrigger>
          <TabsTrigger
            value="distribution"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest"
          >
            Activity Workforce Distribution
          </TabsTrigger>
          <TabsTrigger
            value="alerts"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest"
          >
            Workforce Gap Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classification" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <WorkerClassification
            workers={workers ?? []}
            selectedWorkers={selectedWorkers}
            onWorkerSelect={handleWorkerSelect}
            selectionMode={selectionMode}
          />
        </TabsContent>

        <TabsContent value="teams" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <TeamManagement
            projectId={typeof params?.id === 'string' ? params.id : typeof params?.projectId === 'string' ? params.projectId : ''}
            teams={teams ?? []}
            workers={workers ?? []}
            selectedWorkers={selectedWorkers}
            onClearSelection={handleClearSelection}
            onTeamCreated={() => {
              // Trigger a re-fetch of the workforce data
              setLoading(true)
              const projectId = typeof params?.id === 'string' ? params.id : typeof params?.projectId === 'string' ? params.projectId : ''
              if (projectId) {
                fetch(`/api/project/${projectId}/workforce`)
                  .then(res => res.json())
                  .then(json => {
                    setWorkers(json.workers ?? [])
                    setTeams(json.teams ?? [])
                  })
                  .finally(() => setLoading(false))
              }
              handleTeamCreated()
            }}
          />
        </TabsContent>

        <TabsContent value="distribution" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <ActivityWorkforceTable />
        </TabsContent>

        <TabsContent value="alerts" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <WorkforceGapAlerts />
        </TabsContent>
      </Tabs>
    </div>
  )
}
