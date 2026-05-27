"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Spinner } from "@/components/ui/spinner"
import {
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  MapPin,
  ListTodo,
  Trash2,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { type Activity, type Project } from "@/lib/site-data"
import { type Subtask } from "@/lib/subtasks-data"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type WorkerRequirements = {
  tower_crane_operators: number
  excavator_operators: number
  crawler_crane_operators: number
  tipper_drivers: number
  surveyors: number
  masons: number
  carpenters: number
  steel_fixers: number
  electricians: number
  general_labors: number
  site_engineers: number
}

const defaultWorkerRequirements: WorkerRequirements = {
  tower_crane_operators: 0,
  excavator_operators: 0,
  crawler_crane_operators: 0,
  tipper_drivers: 0,
  surveyors: 0,
  masons: 0,
  carpenters: 0,
  steel_fixers: 0,
  electricians: 0,
  general_labors: 0,
  site_engineers: 0,
}

const workerRoleGroups: Array<{
  discipline: string
  roles: Array<{ key: keyof WorkerRequirements; label: string }>
}> = [
  {
    discipline: "Heavy Equipment",
    roles: [
      { key: "tower_crane_operators", label: "Tower Crane Operators" },
      { key: "excavator_operators", label: "Excavator Operators" },
      { key: "crawler_crane_operators", label: "Crawler Crane Operators" },
    ],
  },
  {
    discipline: "Transport",
    roles: [{ key: "tipper_drivers", label: "Tipper Drivers" }],
  },
  {
    discipline: "Civil Engineering",
    roles: [
      { key: "surveyors", label: "Surveyors" },
      { key: "masons", label: "Masons" },
      { key: "carpenters", label: "Carpenters" },
      { key: "steel_fixers", label: "Steel Fixers" },
      { key: "site_engineers", label: "Site Engineers" },
    ],
  },
  {
    discipline: "Electrical",
    roles: [{ key: "electricians", label: "Electricians" }],
  },
  {
    discipline: "General Construction",
    roles: [{ key: "general_labors", label: "General Laborers" }],
  },
]

interface AddActivityModalProps {
  projectId: number
  project?: Project | null
  onActivityAdded?: (activity: Activity, subtasks?: Subtask[]) => void
  externalOpen?: boolean
  onExternalOpenChange?: (open: boolean) => void
}

type ActivityStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED"

type SubtaskDraft = {
  key: string
  title: string
  dueDate: string
}

function newSubtaskDraft(): SubtaskDraft {
  return {
    key: `st-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    dueDate: "",
  }
}

export function AddActivityModal({
  projectId,
  project,
  onActivityAdded,
  externalOpen,
  onExternalOpenChange,
}: AddActivityModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen ?? internalOpen
  const setOpen = (value: boolean) => {
    setInternalOpen(value)
    onExternalOpenChange?.(value)
  }
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ActivityStatus>("PENDING")
  const [deadline, setDeadline] = useState("")
  const [lat, setLat] = useState(
    project?.locationLatitude != null ? String(project.locationLatitude) : ""
  )
  const [lng, setLng] = useState(
    project?.locationLongitude != null ? String(project.locationLongitude) : ""
  )
  const [workerRequirements, setWorkerRequirements] = useState<WorkerRequirements>(
    defaultWorkerRequirements
  )
  const [workersExpanded, setWorkersExpanded] = useState(true)
  const [subtaskDrafts, setSubtaskDrafts] = useState<SubtaskDraft[]>([newSubtaskDraft()])

  const resetForm = () => {
    setName("")
    setDescription("")
    setStatus("PENDING")
    setDeadline("")
    setLat(project?.locationLatitude != null ? String(project.locationLatitude) : "")
    setLng(project?.locationLongitude != null ? String(project.locationLongitude) : "")
    setWorkerRequirements(defaultWorkerRequirements)
    setWorkersExpanded(true)
    setSubtaskDrafts([newSubtaskDraft()])
    setError(null)
    setSuccess(false)
  }

  const totalRequiredWorkers = Object.values(workerRequirements).reduce(
    (sum, value) => sum + (Number.isFinite(value) ? value : 0),
    0
  )

  const adjustWorkerRequirement = (key: keyof WorkerRequirements, delta: number) => {
    setWorkerRequirements((prev) => {
      const current = Number.isFinite(prev[key]) ? prev[key] : 0
      const next = Math.max(0, Math.round(current + delta))
      return { ...prev, [key]: next }
    })
  }

  const addSubtaskRow = () => {
    setSubtaskDrafts((prev) => [...prev, newSubtaskDraft()])
  }

  const removeSubtaskRow = (key: string) => {
    setSubtaskDrafts((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.key !== key)))
  }

  const updateSubtaskRow = (key: string, field: "title" | "dueDate", value: string) => {
    setSubtaskDrafts((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: value } : s))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!name.trim()) {
      setError("Activity name is required")
      return
    }

    if (totalRequiredWorkers <= 0) {
      setError("At least one worker role must be specified")
      return
    }

    const validSubtasks = subtaskDrafts.filter((s) => s.title.trim())

    setIsLoading(true)

    try {
      const payload = {
        projectid: projectId,
        name: name.trim(),
        description: description.trim() || null,
        status,
        deadline: deadline || null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        workerRequirements,
        subtasks: validSubtasks.map((s, index) => ({
          title: s.title.trim(),
          duedate: s.dueDate || null,
          displayorder: index + 1,
        })),
      }

      const response = await fetch("/api/project/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok && response.status !== 207) {
        throw new Error(data.error || "Failed to create activity")
      }

      setSuccess(true)

      if (data.activity && onActivityAdded) {
        onActivityAdded(data.activity, data.subtasks ?? [])
      }

      setTimeout(() => {
        resetForm()
        setOpen(false)
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) resetForm()
    else if (project) {
      if (!lat && project.locationLatitude != null) setLat(String(project.locationLatitude))
      if (!lng && project.locationLongitude != null) setLng(String(project.locationLongitude))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add Activity
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-xl">New Activity</DialogTitle>
          <DialogDescription>
            Create an activity with map location, deadline, and subtasks. Progress is calculated
            from completed subtasks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500/30 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Activity and subtasks created successfully
                </AlertDescription>
              </Alert>
            )}

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Activity details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Foundation Work"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What work happens in this activity?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as ActivityStatus)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="PAUSED">Paused</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Map location</h3>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Required to show the activity on the site map.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 rounded-lg border border-border bg-secondary/20 p-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.000001"
                    placeholder="6.9271"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.000001"
                    placeholder="79.8612"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Required Workers *</h3>
                    <p className="text-xs text-muted-foreground">
                      Set required headcount per role (defaults to 0). Total: {totalRequiredWorkers}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => setWorkersExpanded((v) => !v)}
                  disabled={isLoading}
                >
                  {workersExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Show
                    </>
                  )}
                </Button>
              </div>

              {workersExpanded && (
                <div className="space-y-4">
                  {workerRoleGroups.map((group) => (
                    <div
                      key={group.discipline}
                      className="rounded-lg border border-border bg-secondary/10 p-4 space-y-3"
                    >
                      <div className="text-xs font-semibold text-muted-foreground">
                        {group.discipline}
                      </div>
                      <div className="space-y-2">
                        {group.roles.map((role) => (
                          <div
                            key={role.key}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="text-sm text-foreground">{role.label}</div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => adjustWorkerRequirement(role.key, -1)}
                                disabled={isLoading || workerRequirements[role.key] <= 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <div className="min-w-10 text-center text-sm font-medium tabular-nums">
                                {workerRequirements[role.key]}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => adjustWorkerRequirement(role.key, +1)}
                                disabled={isLoading}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <Separator />

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Subtasks</h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={addSubtaskRow}
                  disabled={isLoading}
                >
                  <Plus className="h-3 w-3" />
                  Add step
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Each step is saved to the database. Progress % = completed steps ÷ total steps.
              </p>
              <div className="space-y-2">
                {subtaskDrafts.map((draft, index) => (
                  <div
                    key={draft.key}
                    className={cn(
                      "flex flex-col sm:flex-row gap-2 rounded-lg border border-border p-3 bg-secondary/10",
                      !draft.title.trim() && "border-dashed"
                    )}
                  >
                    <div className="flex items-center gap-2 sm:w-8 shrink-0 pt-2 sm:pt-0">
                      <span className="text-xs font-medium text-muted-foreground w-6">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 grid gap-2 sm:grid-cols-[1fr_140px]">
                      <Input
                        placeholder="Subtask title"
                        value={draft.title}
                        onChange={(e) => updateSubtaskRow(draft.key, "title", e.target.value)}
                        disabled={isLoading}
                      />
                      <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                          type="date"
                          className="pl-8"
                          value={draft.dueDate}
                          onChange={(e) => updateSubtaskRow(draft.key, "dueDate", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSubtaskRow(draft.key)}
                      disabled={isLoading || subtaskDrafts.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-card shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Creating...
                </span>
              ) : (
                "Create Activity"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
