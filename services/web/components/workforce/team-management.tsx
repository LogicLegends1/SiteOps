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
import { Plus, Users, MapPin, ChevronRight, UserPlus } from "lucide-react"
import {
  teams,
  workers,
  getWorkerById,
  getRoleLabel,
  getDisciplineLabel,
  type Team,
} from "@/lib/workforce-data"
import { zones } from "@/lib/site-data"
import { activityProgress } from "@/lib/delay-engine-data"

interface TeamManagementProps {
  selectedWorkers: string[]
  onClearSelection: () => void
  onTeamCreated: () => void
}

export function TeamManagement({ selectedWorkers, onClearSelection, onTeamCreated }: TeamManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [selectedZone, setSelectedZone] = useState<string>("")
  const [selectedActivity, setSelectedActivity] = useState<string>("")
  const [selectedLeader, setSelectedLeader] = useState<string>("")
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)

  const handleCreateTeam = () => {
    // In a real app, this would call an API
    console.log("Creating team:", {
      name: newTeamName,
      members: selectedWorkers,
      leader: selectedLeader,
      zone: selectedZone,
      activity: selectedActivity,
    })
    setIsCreateDialogOpen(false)
    setNewTeamName("")
    setSelectedZone("")
    setSelectedActivity("")
    setSelectedLeader("")
    onClearSelection()
    onTeamCreated()
  }

  const selectedWorkerDetails = selectedWorkers.map((id) => getWorkerById(id)).filter(Boolean)

  const renderTeamCard = (team: Team) => {
    const leader = getWorkerById(team.leaderId)
    const members = team.memberIds.map((id) => getWorkerById(id)).filter(Boolean)
    const assignedZone = zones.find((z) => z.id === team.assignedZoneId)
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
            {assignedZone && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                <MapPin className="h-3 w-3 mr-1" />
                {assignedZone.name}
              </Badge>
            )}
            <ChevronRight
              className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
            />
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-border p-4 bg-muted/30">
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Team Leader</p>
              {leader && (
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                {selectedWorkers.length > 0
                  ? `Create a team with ${selectedWorkers.length} selected workers`
                  : "Select idle workers from the classification panel to add to this team"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  placeholder="e.g., Team Delta"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Assign to Zone</Label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name} - {zone.activity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assign to Activity</Label>
                <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityProgress.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id}>
                        {activity.activityName} - {activity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedWorkers.length > 0 && (
                <div className="space-y-2">
                  <Label>Team Leader</Label>
                  <Select value={selectedLeader} onValueChange={setSelectedLeader}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team leader" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedWorkerDetails.map(
                        (worker) =>
                          worker && (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.name} - {getRoleLabel(worker.role)}
                            </SelectItem>
                          )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Selected Members ({selectedWorkers.length})</Label>
                {selectedWorkers.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-4 text-center">
                    <UserPlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Select idle workers from the classification panel
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[120px] rounded-lg border border-border p-2">
                    <div className="space-y-2">
                      {selectedWorkerDetails.map(
                        (worker) =>
                          worker && (
                            <div
                              key={worker.id}
                              className="flex items-center gap-2 rounded-md bg-muted/50 p-2"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {worker.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-foreground">{worker.name}</span>
                              <Badge variant="secondary" className="text-xs ml-auto">
                                {getDisciplineLabel(worker.discipline)}
                              </Badge>
                            </div>
                          )
                      )}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTeam}
                disabled={!newTeamName || selectedWorkers.length === 0}
              >
                Create Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">{teams.map(renderTeamCard)}</div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
