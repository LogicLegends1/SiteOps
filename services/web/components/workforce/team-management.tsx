"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, ChevronRight } from "lucide-react"
import {
  getRoleLabel,
  getDisciplineLabel,
} from "@/lib/workforce-data"
import { type WorkforceTeam, type WorkforceWorker } from "@/lib/workforce-live"

import { CreateTeamDialog } from "./create-team-dialog"

interface TeamManagementProps {
  projectId: string
  teams: WorkforceTeam[]
  workers: WorkforceWorker[]
  onTeamCreated: () => void
}

export function TeamManagement({
  projectId,
  teams,
  workers,
  onTeamCreated,
}: TeamManagementProps) {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)

  const getWorkerById = (id: string) => workers.find((worker) => worker.id === id)

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Teams</div>
          <div className="text-sm text-muted-foreground">Manage on-site crews and assignments</div>
        </div>
        <CreateTeamDialog projectId={projectId} workers={workers} onTeamCreated={onTeamCreated} />
      </div>

      <div className="rounded-xl border border-border/60 bg-card/60">
        <ScrollArea className="h-130 pr-4">
          <div className="space-y-3 p-4">
            {teams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users className="h-10 w-10 text-muted-foreground" />
                <div className="mt-3 text-sm font-medium text-foreground">No teams yet</div>
                <div className="text-xs text-muted-foreground">Create a team to get started.</div>
              </div>
            ) : (
              teams.map(renderTeamCard)
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
