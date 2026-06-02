"use client"

import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Loader2, Plus, X } from "lucide-react"
import { type WorkforceWorker } from "@/lib/workforce-live"
import { useToast } from "@/hooks/use-toast"

interface Activity {
  activityid: number
  description: string
  status: string
}

interface CreateTeamDialogProps {
  projectId: string
  workers: WorkforceWorker[]
  onTeamCreated: () => void
  disabled?: boolean
}

export function CreateTeamDialog({ projectId, workers, onTeamCreated, disabled = false }: CreateTeamDialogProps) {
  const [open, setOpen] = useState(false)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [teamName, setTeamName] = useState("")
  const [selectedActivityId, setSelectedActivityId] = useState<string>("")
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([])
  const [teamLeaderId, setTeamLeaderId] = useState<string>("")
  const { toast } = useToast()

  // Filter idle workers
  const availableWorkers = workers.filter(
    (w) => w.assignedTeamId === null && w.status !== "unavailable"
  )

  const getWorkerDisciplineLabel = (worker: WorkforceWorker) => {
    const raw = (worker.disciplineName ?? worker.discipline ?? "").toString().trim()
    return raw || "Unspecified"
  }

  const getWorkerRoleLabel = (worker: WorkforceWorker) => {
    const raw = (worker.roleName ?? worker.role ?? "").toString().trim()
    return raw || "Unspecified"
  }

  const availableWorkersByDiscipline = useMemo(() => {
    const grouped = new Map<string, Map<string, WorkforceWorker[]>>()

    for (const worker of availableWorkers) {
      const discipline = getWorkerDisciplineLabel(worker)
      const role = getWorkerRoleLabel(worker)

      if (!grouped.has(discipline)) grouped.set(discipline, new Map())
      const roleMap = grouped.get(discipline)!
      if (!roleMap.has(role)) roleMap.set(role, [])
      roleMap.get(role)!.push(worker)
    }

    // sort workers by name within each role
    for (const roleMap of grouped.values()) {
      for (const list of roleMap.values()) {
        list.sort((a, b) => a.name.localeCompare(b.name))
      }
    }

    const disciplines = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b))

    return disciplines.map((discipline) => {
      const roleMap = grouped.get(discipline)!
      const roles = Array.from(roleMap.entries()).sort(([a], [b]) => a.localeCompare(b))
      const total = roles.reduce((sum, [, list]) => sum + list.length, 0)
      return { discipline, roles, total }
    })
  }, [availableWorkers])

  const selectedWorkersList = workers.filter((w) => selectedWorkerIds.includes(w.id))

  useEffect(() => {
    if (open && projectId) {
      setLoadingActivities(true)
      fetch(`/api/project/${projectId}/activities?unassignedTeamOnly=1`)
        .then((r) => r.json())
        .then((data) => {
          if (data.activities) {
            setActivities(data.activities)
          }
        })
        .catch(console.error)
        .finally(() => setLoadingActivities(false))
    }
  }, [open, projectId])

  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkerIds((prev) => {
      const isSelected = prev.includes(workerId)
      if (isSelected) {
        // If we remove a worker who is also the team leader, clear team leader
        if (teamLeaderId === workerId) setTeamLeaderId("")
        return prev.filter((id) => id !== workerId)
      } else {
        return [...prev, workerId]
      }
    })
  }

  const handleCreateTeam = async () => {
    if (!teamName) {
      toast({ title: "Team name is required", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/project/${projectId}/workforce/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamname: teamName,
          activityid: selectedActivityId ? parseInt(selectedActivityId, 10) : null,
          team_lead_id: teamLeaderId || null,
          workerIds: selectedWorkerIds,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to create team")
      }

      toast({ title: "Team created successfully" })
      setOpen(false)
      // Reset form
      setTeamName("")
      setSelectedActivityId("")
      setSelectedWorkerIds([])
      setTeamLeaderId("")
      onTeamCreated()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1" disabled={disabled}>
          <Plus className="h-4 w-4" />
          Create Team
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-screen flex-col gap-6 sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Assemble an available crew for an activity and assign a team lead.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid gap-6 lg:grid-cols-[1fr,1.15fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="e.g., Strike Team Alpha"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Assign Activity (Optional)</Label>
              <Select value={selectedActivityId} onValueChange={setSelectedActivityId}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingActivities ? "Loading..." : "Select Activity"} />
                </SelectTrigger>
                <SelectContent position="popper">
                  {activities.map((act) => (
                    <SelectItem key={act.activityid} value={String(act.activityid)}>
                      {act.description} ({act.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label>Assign Team Leader</Label>
              <Select value={teamLeaderId} onValueChange={setTeamLeaderId}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedWorkerIds.length > 0 ? "Select Leader from Team" : "Select Workers first"} />
                </SelectTrigger>
                <SelectContent position="popper">
                  {selectedWorkersList.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name} ({getWorkerRoleLabel(worker)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex min-h-[28rem] flex-col overflow-hidden rounded-lg border border-border/60 bg-card/60">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-2 text-sm font-semibold">
              <span>Available Workers</span>
              <Badge variant="outline">{availableWorkers.length}</Badge>
            </div>
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-4">
                {availableWorkers.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center">No unassigned workers available.</p>
                ) : (
                  availableWorkersByDiscipline.map(({ discipline, roles, total }) => (
                    <div key={discipline} className="space-y-2">
                      <div className="flex items-center justify-between px-2 pt-2">
                        <div className="text-xs font-semibold text-muted-foreground">
                          {discipline}
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {total}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {roles.map(([role, roleWorkers]) => (
                          <div key={`${discipline}-${role}`} className="space-y-1">
                            <div className="flex items-center justify-between px-2">
                              <div className="text-[11px] font-medium text-foreground/80">
                                {role}
                              </div>
                              <Badge variant="secondary" className="text-[10px]">
                                {roleWorkers.length}
                              </Badge>
                            </div>

                            <div className="space-y-1">
                              {roleWorkers.map((worker) => {
                                const isSelected = selectedWorkerIds.includes(worker.id)
                                return (
                                  <div
                                    key={worker.id}
                                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                                      isSelected
                                        ? "bg-primary/10 border border-primary/20"
                                        : "hover:bg-accent border border-transparent"
                                    }`}
                                    onClick={() => toggleWorkerSelection(worker.id)}
                                  >
                                    <Checkbox checked={isSelected} readOnly />
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="text-xs">
                                        {worker.name.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold truncate">{worker.name}</p>
                                      <p className="text-[10px] text-muted-foreground truncate">
                                        {getWorkerDisciplineLabel(worker)} • {getWorkerRoleLabel(worker)} • {worker.experienceYears}y
                                      </p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {selectedWorkersList.length > 0 && (
              <div className="border-t bg-accent/50 p-2">
                <div className="text-xs font-bold mb-2 flex justify-between">
                  <span>Selected Crew</span>
                  <Badge>{selectedWorkersList.length}</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedWorkersList.map((w) => (
                    <Badge variant="secondary" key={w.id} className="text-[10px] gap-1 pr-1">
                      {w.name}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleWorkerSelection(w.id)
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleCreateTeam} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Team
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}