"use client"

import { useState, useEffect } from "react"
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
import { Loader2, Plus, Users, ArrowRight, X } from "lucide-react"
import { type WorkforceWorker } from "@/lib/workforce-live"
import { getDisciplineLabel, getRoleLabel } from "@/lib/workforce-data"
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

  const selectedWorkersList = workers.filter((w) => selectedWorkerIds.includes(w.id))

  useEffect(() => {
    if (open && projectId) {
      setLoadingActivities(true)
      fetch(`/api/project/${projectId}/activities`)
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
      <DialogContent className="sm:max-w-[800px] gap-6">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Assemble an available crew for an activity and assign a team lead.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[1fr,1fr] gap-6">
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
                      {worker.name} ({getRoleLabel(worker.role)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col border rounded-md h-[400px]">
            <div className="bg-muted px-4 py-2 font-semibold text-sm border-b flex justify-between items-center">
              <span>Available Workers</span>
              <Badge variant="outline">{availableWorkers.length}</Badge>
            </div>
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-1">
                {availableWorkers.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center">No unassigned workers available.</p>
                ) : (
                  availableWorkers.map((worker) => {
                    const isSelected = selectedWorkerIds.includes(worker.id)
                    return (
                      <div
                        key={worker.id}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-accent border border-transparent"
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
                            {getDisciplineLabel(worker.discipline)} • {getRoleLabel(worker.role)} • {worker.experienceYears}y
                          </p>
                        </div>
                      </div>
                    )
                  })
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