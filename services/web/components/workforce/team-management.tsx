"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Users, ChevronRight, UserPlus } from "lucide-react"
import {
  getRoleLabel,
  getDisciplineLabel,
} from "@/lib/workforce-data"
import { type WorkforceTeam, type WorkforceWorker } from "@/lib/workforce-live"
import { activities } from "@/lib/site-data"
import { activityProgress } from "@/lib/delay-engine-data"

import { CreateTeamDialog } from "./create-team-dialog"

interface TeamManagementProps {
  projectId: string
  teams: WorkforceTeam[]
  workers: WorkforceWorker[]
  selectedWorkers: string[]
  onClearSelection: () => void
  onTeamCreated: () => void
}

export function TeamManagement({
  projectId,
  teams,
  workers,
  selectedWorkers,
  onClearSelection,
  onTeamCreated,
}: TeamManagementProps) {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)

  const handleCreateTeam = () => {
    // In a real app, this would call an API
    console.log("Creating team:", {
      name: newTeamName,
      members: selectedWorkers,
      leader: selectedLeader,
      activityId: selectedActivity,
      workType: selectedWorkType,
    })
    setIsCreateDialogOpen(false)
    setNewTeamName("")
    setSelectedActivity("")
    setSelectedWorkType("")
    setSelectedLeader("")
    onClearSelection()
    onTeamCreated()
  }

  const getWorkerById = (id: string) => workers.find((worker) => worker.id === id)

  const selectedWorkerDetails = selectedWorkers.map((id) => getWorkerById(id)).filter(Boolean)

  const renderTeamCard = (team: WorkforceTeam) => {
    const leader = team.leaderId ? getWorkerById(team.leaderId) : null
    const members = team.memberIds.map((id) => getWorkerById(id)).filter(Boolean)
    const isExpanded = expandedTeam === team.id

    return (
      <div key={team.id} className="rounded-lg border border-border bg-card overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
          onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">{team.name}</p>
              <p className="text-xs text-muted-foreground">{members.length} members</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ChevronRight
              className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
            />
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-border p-4 bg-muted/30">
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Team Leader</p>
              {leader ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {leader.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">{leader.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {getRoleLabel(leader.role)}
                  </Badge>
                </div>
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  No Leader
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-2">Team Members</p>
            <div className="grid grid-cols-2 gap-2">
              {members.map((member) =>
                member ? (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 rounded-md border border-border bg-card p-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getDisciplineLabel(member.discipline)}
                      </p>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-foreground">Teams</CardTitle>
        <CreateTeamDialog
          projectId={projectId}
          workers={workers}
          onTeamCreated={onTeamCreated}
        />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">{teams.map(renderTeamCard)}</div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
