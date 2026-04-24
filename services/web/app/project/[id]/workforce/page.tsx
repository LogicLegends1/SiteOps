"use client"

import { useState } from "react"
import { WorkforceStats } from "@/components/workforce/workforce-stats"
import { WorkerClassification } from "@/components/workforce/worker-classification"
import { TeamManagement } from "@/components/workforce/team-management"
import { ActivityWorkforceTable } from "@/components/workforce/activity-workforce-table"
import { WorkforceGapAlerts } from "@/components/workforce/workforce-gap-alerts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, X } from "lucide-react"

export default function WorkforcePage() {
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

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Workforce Allocation Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage teams, track worker assignments, and identify staffing gaps
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            <Button size="sm" onClick={() => setSelectionMode(true)}>
              <UserPlus className="h-4 w-4 mr-1" />
              Select Workers for Team
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <WorkforceStats />

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

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column - Worker Classification */}
        <WorkerClassification
          selectedWorkers={selectedWorkers}
          onWorkerSelect={handleWorkerSelect}
          selectionMode={selectionMode}
        />

        {/* Right Column - Teams */}
        <TeamManagement
          selectedWorkers={selectedWorkers}
          onClearSelection={handleClearSelection}
          onTeamCreated={handleTeamCreated}
        />
      </div>

      {/* Activity Workforce Distribution */}
      <ActivityWorkforceTable />

      {/* Workforce Gap Alerts */}
      <WorkforceGapAlerts />
    </div>
  )
}
