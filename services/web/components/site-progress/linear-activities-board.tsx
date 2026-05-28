"use client"

import { useState, useMemo, useEffect } from "react"
import { type Activity, type ActivityStatus } from "@/lib/site-data"
import {
  type Subtask,
  calculateProgressFromSubtasks,
  getTrackLabelFromSubtasks,
} from "@/lib/subtasks-data"
import { getIssuesByActivityId } from "@/lib/issues-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Circle,
  CircleDot,
  CheckCircle2,
  PauseCircle,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  ListTodo,
  MapPin,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SubtaskProgressModal } from "@/components/site-progress/subtask-progress-modal"
import { CrewMachineRequestDialog } from "@/components/site-progress/crew-machine-request-dialog"
import { type EquipmentItem } from "@/lib/equipment-data"
import { equipmentStatusColorMap, getColorFromMap } from "@/lib/colorMap"

type CrewRequirementSummary = {
  id?: number
  activityId?: number
  tower_crane_operators?: number
  excavator_operators?: number
  crawler_crane_operators?: number
  tipper_drivers?: number
  surveyors?: number
  masons?: number
  carpenters?: number
  steel_fixers?: number
  electricians?: number
  general_labors?: number
  site_engineers?: number
}

type EquipmentRequestSummary = {
  id?: number
  projectid?: number
  activity_id?: number
  details?: string | null
  quantity?: number | null
  created_at?: string | null
}

const CREW_REQUEST_FIELDS: Array<{ key: keyof Omit<CrewRequirementSummary, "id" | "activityId">; label: string }> = [
  { key: "site_engineers", label: "Site Engineers" },
  { key: "surveyors", label: "Surveyors" },
  { key: "tower_crane_operators", label: "Tower Crane Operators" },
  { key: "excavator_operators", label: "Excavator Operators" },
  { key: "crawler_crane_operators", label: "Crawler Crane Operators" },
  { key: "tipper_drivers", label: "Tipper Drivers" },
  { key: "masons", label: "Masons" },
  { key: "carpenters", label: "Carpenters" },
  { key: "steel_fixers", label: "Steel Fixers" },
  { key: "electricians", label: "Electricians" },
  { key: "general_labors", label: "General Labors" },
]

interface WorkerSummary {
  id: number
  name: string
  role: string
  discipline?: string
  teamName?: string | null
  isAvailable?: boolean
}

interface LinearActivitiesBoardProps {
  activities: Activity[]
  subtasksByActivity: Record<number, Subtask[]>
  onActivitySelect: (activity: Activity) => void
  onViewOnMap: (activity: Activity) => void
  onAddActivity?: () => void
  onStatusChange?: (activityId: number, newStatus: ActivityStatus) => void
  onToggleSubtask?: (activityId: number, subtaskId: string) => void
  onSubtaskUpdate?: (activityId: number, subtaskId: string, description: string, photoUrls: string[]) => void
  selectedActivityId?: number
  activityWorkersDetail?: Record<number, WorkerSummary[]>
  onCrewMachineRequest?: (activityId: number, type: "crew" | "machine", details: string) => void
}

type FilterType = "all" | "on-track" | "behind" | "completed"
type ViewMode = "progress" | "crew" | "machines" | "request"


function getStatusIcon(status: ActivityStatus) {
  switch (status) {
    case "PENDING":
      return <Circle className="h-3.5 w-3.5 text-muted-foreground" />
    case "IN_PROGRESS":
      return <CircleDot className="h-3.5 w-3.5 text-blue-400" />
    case "PAUSED":
      return <PauseCircle className="h-3.5 w-3.5 text-orange-400" />
    case "COMPLETED":
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
    case "CANCELLED":
      return <XCircle className="h-4 w-4 text-red-400" />
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />
  }
}

// â”€â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function formatDateShort(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getLastUpdate(subtasks: Subtask[]): Date | null {
  const allUpdates = subtasks.flatMap((s) => s.updates)
  if (!allUpdates.length) return null
  return new Date(Math.max(...allUpdates.map((u) => new Date(u.updatedAt).getTime())))
}


// â”€â”€â”€ Table column grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getActivityId(activity: Activity): string {
  const letter = (activity.markerLabel || "").replace(/Zone\s*/i, "").charAt(0).toUpperCase() || "X"
  const seq = String(activity.zoneID % 1000).padStart(3, "0")
  return `ACT-${letter}-${seq}`
}

function getDummyEquipment(activity: Activity): string {
  const n = (activity.name || "").toLowerCase()
  if (n.includes("excavat") || n.includes("earthwork") || n.includes("bulk earth")) return "2 Excav \u00b7 3 Tip"
  if (n.includes("haul")) return "4 Tippers"
  if (n.includes("concrete") || n.includes("pcc") || n.includes("pour") || n.includes("footing")) return "Mixer \u00b7 Vibr"
  if (n.includes("rebar") || n.includes("reinforc")) return "Bender \u00b7 Crane"
  if (n.includes("drain") || n.includes("pipe") || n.includes("utility")) return "Excav \u00b7 Layer"
  if (n.includes("compact") || n.includes("sub-base") || n.includes("road")) return "Roller \u00b7 Grader"
  if (n.includes("formation") || n.includes("grading") || n.includes("leveling")) return "Grader \u00b7 Roller"
  if (n.includes("inspect") || n.includes("qa") || n.includes("qc")) return "Test Kit"
  if (n.includes("backfill")) return "Compactor"
  return "\u2013"
}

const CREW_PALETTES = ["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#ec4899", "#14b8a6"]
const CREW_INITIALS = ["K", "S", "N", "D", "R", "A", "M", "J"]

function getDummyCrewInitials(activity: Activity): { initial: string; color: string }[] {
  const offset = activity.zoneID % CREW_INITIALS.length
  return [0, 1, 2].map((i) => ({
    initial: CREW_INITIALS[(offset + i) % CREW_INITIALS.length],
    color: CREW_PALETTES[(offset + i) % CREW_PALETTES.length],
  }))
}

const COL_GRID_FULL =
  "grid-cols-[28px_minmax(160px,1fr)_140px_100px_120px_90px_88px_52px_98px_36px]"
const COL_GRID_CREW =
  "grid-cols-[28px_minmax(320px,1fr)_36px]"

function TableHeader({ viewMode }: { viewMode: ViewMode }) {
  return (
    <div
      className={cn(
        "hidden md:grid items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border bg-secondary/20 shrink-0 min-w-240",
        viewMode === "crew" || viewMode === "machines" || viewMode === "request"
          ? COL_GRID_CREW
          : COL_GRID_FULL
      )}
    >
      <span />
      <span>Activity</span>
      {viewMode === "progress" && (
        <>
          <span>Progress</span>
          <span>Planned Finish</span>
          <span>Engineer</span>
          <span>Crew</span>
          <span>Assets</span>
          <span>Issues</span>
          <span>Last Update</span>
        </>
      )}
      <span />
    </div>
  )
}

function getViewModeLabel(viewMode: ViewMode) {
  switch (viewMode) {
    case "progress":
      return "Activity Progress"
    case "crew":
      return "Crew Members"
    case "machines":
      return "Machines"
    case "request":
      return "Crew/Machines Request"
    default:
      return "Activity Progress"
  }
}

function getMobileExpandLabel(viewMode: ViewMode, isExpanded: boolean) {
  if (isExpanded) return "Hide details"

  switch (viewMode) {
    case "crew":
      return "View crew"
    case "machines":
      return "View machines"
    case "request":
      return "View requests"
    default:
      return "Update activity"
  }
}

function ActivityRow({
  activity,
  subtasks,
  onViewOnMap,
  onStatusChange,
  onToggleSubtask,
  onSubtaskUpdate,
  isExpanded,
  onToggleExpand,
  workers,
  isSelected,
  viewMode,
  onCrewMachineRequest,
}: {
  activity: Activity
  subtasks: Subtask[]
  onViewOnMap: () => void
  onStatusChange?: (activityId: number, newStatus: ActivityStatus) => void
  onToggleSubtask?: (activityId: number, subtaskId: string) => void
  onSubtaskUpdate?: (
    activityId: number,
    subtaskId: string,
    description: string,
    photoUrls: string[]
  ) => void
  isExpanded: boolean
  onToggleExpand: () => void
  workers?: WorkerSummary[]
  isSelected?: boolean
  viewMode?: ViewMode
  onCrewMachineRequest?: (activityId: number, type: "crew" | "machine", details: string) => void
}) {
  const progress =
    subtasks.length > 0
      ? calculateProgressFromSubtasks(subtasks)
      : activity.progress ?? 0
  const track = getTrackLabelFromSubtasks(subtasks)
  const issues = getIssuesByActivityId(activity.zoneID)
  const lastUpdated = getLastUpdate(subtasks)
  const deadline = activity.deadline || activity.expectedCompletion
  const isDelayed = !!deadline && progress < 100 && new Date(deadline) < new Date()

  const engineerWorker = workers?.find((w) => w.role === "Site Engineer")
  const engineerName = engineerWorker?.name || activity.assignedSupervisor
  const crewCount = workers?.length ?? null
  const rowGridClass = viewMode === "crew" || viewMode === "machines" || viewMode === "request" ? COL_GRID_CREW : COL_GRID_FULL
  const [workersState, setWorkersState] = useState<WorkerSummary[]>(workers ?? [])
  const [updatingWorkerId, setUpdatingWorkerId] = useState<number | null>(null)
  const crewMembers = (workersState ?? []).filter(
    (w) => !(w.role || "").toLowerCase().includes("engineer")
  )
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [requestDialogType, setRequestDialogType] = useState<"crew" | "machine" | null>(null)
  const [crewRequestSummary, setCrewRequestSummary] = useState<CrewRequirementSummary | null>(null)
  const [crewRequestLoading, setCrewRequestLoading] = useState(false)
  const [equipmentRequestSummary, setEquipmentRequestSummary] = useState<EquipmentRequestSummary[]>([])
  const [equipmentRequestLoading, setEquipmentRequestLoading] = useState(false)
  const [requestRefreshKey, setRequestRefreshKey] = useState(0)

  useEffect(() => {
    setWorkersState(workers ?? [])
  }, [workers])

  const openRequestDialog = (type: "crew" | "machine") => {
    setRequestDialogType(type)
    setRequestDialogOpen(true)
  }

  const handleRequestDialogOpenChange = (nextOpen: boolean) => {
    setRequestDialogOpen(nextOpen)
    if (!nextOpen) {
      setRequestRefreshKey((key) => key + 1)
    }
  }

  useEffect(() => {
    if (viewMode !== "request" || !isExpanded || !activity.projectID) {
      setCrewRequestSummary(null)
      setEquipmentRequestSummary([])
      return
    }

    let active = true
    const loadRequests = async () => {
      try {
        setCrewRequestLoading(true)
        setEquipmentRequestLoading(true)

        const [crewRes, equipmentRes] = await Promise.all([
          fetch(`/api/project/${activity.projectID}/activity/${activity.zoneID}/worker-requirements`),
          fetch(`/api/project/${activity.projectID}/activity/${activity.zoneID}/equipment-requests`),
        ])
        const [crewData, equipmentData] = await Promise.all([
          crewRes.json().catch(() => null),
          equipmentRes.json().catch(() => null),
        ])

        if (!active) return
        setCrewRequestSummary(crewData?.requirements ?? null)
        setEquipmentRequestSummary(Array.isArray(equipmentData?.requests) ? equipmentData.requests : [])
      } catch (error) {
        if (!active) return
        console.error("Failed to load request summaries", error)
        setCrewRequestSummary(null)
        setEquipmentRequestSummary([])
      } finally {
        if (active) {
          setCrewRequestLoading(false)
          setEquipmentRequestLoading(false)
        }
      }
    }

    void loadRequests()

    return () => {
      active = false
    }
  }, [activity.projectID, activity.zoneID, isExpanded, requestRefreshKey, viewMode])

  const updateWorkerAvailability = async (workerId: number, nextAvailable: boolean) => {
    if (!activity.projectID) return
    try {
      setUpdatingWorkerId(workerId)
      const res = await fetch(`/api/project/${activity.projectID}/workforce/workers/${workerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isavailable: nextAvailable }),
      })

      if (!res.ok) {
        throw new Error("Failed to update worker status")
      }

      setWorkersState((prev) =>
        prev.map((w) =>
          w.id === workerId
            ? { ...w, isAvailable: nextAvailable }
            : w
        )
      )
    } catch (error) {
      console.error("Worker status update failed", error)
    } finally {
      setUpdatingWorkerId(null)
    }
  }
  // equipment fetch state
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[] | null>(null)
  const [eqLoading, setEqLoading] = useState(false)
  const [eqError, setEqError] = useState<string | null>(null)

  const loadEquipmentForProject = async () => {
    if (equipmentList !== null) return
    if (!activity.projectID) return
    try {
      setEqLoading(true)
      setEqError(null)
      const res = await fetch(`/api/project/${activity.projectID}/equipment`)
      const data = await res.json()
      setEquipmentList(data?.equipment ?? [])
    } catch (err: any) {
      setEqError(err?.message ?? "Failed to load equipment")
    } finally {
      setEqLoading(false)
    }
  }

  const updateEquipmentStatus = async (itemId: string, nextStatus: string) => {
    if (!activity.projectID) return
    try {
      setEqLoading(true)
      const res = await fetch(`/api/project/${activity.projectID}/equipment/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error("Failed to update equipment status")
      const data = await res.json()
      const updated = data?.item
      if (updated) {
        setEquipmentList((prev) => (prev ?? []).map((e) => (String(e.id) === String(updated.itemid || updated.id) ? { ...e, status: updated.status } : e)))
      }
    } catch (err) {
      console.error("Update equipment status failed", err)
    } finally {
      setEqLoading(false)
    }
  }

  const activityEquipment = (equipmentList ?? []).filter((item) => {
    const itemActivityId = String(item.activeActivityId ?? "")
    const itemZoneId = String(item.activeZoneId ?? "")
    return (
      (itemActivityId && (itemActivityId === String(activity.activityID) || itemActivityId === String(activity.zoneID))) ||
      (itemZoneId && itemZoneId === String(activity.zoneID))
    )
  })

  useEffect(() => {
    if (viewMode === "machines" && isExpanded) {
      void loadEquipmentForProject()
    }
  }, [viewMode, isExpanded])

  return (
    <div
      id={`activity-row-${activity.zoneID}`}
      className={cn(
        "group/row border-b border-border/50 last:border-0 w-full min-w-0 md:min-w-240",
        isSelected && "bg-primary/5 border-l-2 border-primary"
      )}
    >
      <div className="md:hidden px-3 py-3">
        <div className="w-full rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
          <div
            className={cn(
              "px-3 py-3 border-l-4",
              isSelected ? "border-l-primary bg-primary/5" : "border-l-border"
            )}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand()
              }}
              className="flex w-full min-w-0 items-start gap-2 text-left"
            >
              <span className="mt-0.5 shrink-0">{getStatusIcon(activity.status)}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-tight text-foreground wrap-break-word">
                  {activity.name}
                </span>
                <span className="mt-0.5 block text-[10px] font-mono text-muted-foreground/60 wrap-break-word">
                  {getActivityId(activity)}
                </span>
              </span>
            </button>

            <div className="mt-3 flex w-full items-center gap-2">
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary/60">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    background: progress === 100 ? "#10b981" : isDelayed ? "#f59e0b" : "#3b82f6",
                  }}
                />
              </div>
              <span
                className="w-11 shrink-0 text-right text-xs font-semibold"
                style={{ color: progress === 100 ? "#10b981" : isDelayed ? "#f59e0b" : undefined }}
              >
                {progress}%
              </span>
            </div>

            <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <span>View</span>
                <span className="min-w-0 text-right font-medium text-foreground wrap-break-word">
                  {getViewModeLabel(viewMode ?? "progress")}
                </span>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-3">
                <span>Finish</span>
                <span className="min-w-0 text-right wrap-break-word">
                  {deadline ? formatDateShort(deadline) : "–"}
                </span>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-3">
                <span>Engineer</span>
                <span className="min-w-0 text-right wrap-break-word">{engineerName ?? "–"}</span>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              className="mt-3 h-9 w-full rounded-xl text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand()
              }}
            >
              {getMobileExpandLabel(viewMode ?? "progress", isExpanded)}
            </Button>

            {viewMode === "request" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 h-9 w-full justify-between rounded-xl text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    New request
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)]">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      openRequestDialog("crew")
                    }}
                  >
                    Crew Request
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      openRequestDialog("machine")
                    }}
                  >
                    Equipment Request
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {track === "Behind" && (
              <div className="mt-3">
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-2 bg-amber-500/10 text-amber-500 border-amber-500/30"
                >
                  Delayed
                </Badge>
              </div>
            )}
          </div>

          {isExpanded && viewMode === "progress" && (
            <div className="border-t border-border/60 px-3 py-3 bg-secondary/10 space-y-2">
              {subtasks.length > 0 ? (
                subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex w-full flex-col gap-2 rounded-xl bg-background/80 px-2.5 py-2"
                  >
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleSubtask?.(activity.zoneID, subtask.id)
                        }}
                        className={cn(
                          "mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 transition-all",
                          subtask.completed
                            ? "bg-emerald-400 border-emerald-400"
                            : "border-muted-foreground/40"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "text-xs font-medium wrap-break-word",
                          subtask.completed ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                          {subtask.title}
                        </p>
                        {subtask.dueDate && (
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            Due {new Date(subtask.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>
                    {onSubtaskUpdate && (
                      <SubtaskProgressModal
                        subtask={subtask}
                        onSubmit={(desc, urls) => onSubtaskUpdate(activity.zoneID, subtask.id, desc, urls)}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="w-full rounded-xl border border-dashed border-border/60 bg-background/70 px-3 py-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ListTodo className="h-3.5 w-3.5" />
                    No subtasks yet
                  </p>
                </div>
              )}
            </div>
          )}

          {isExpanded && viewMode === "crew" && (
            <div className="border-t border-border/60 px-3 py-3 bg-secondary/10 space-y-2">
              {crewMembers.length > 0 ? (
                crewMembers.map((w) => (
                  <div key={w.id} className="flex items-center justify-between gap-3 rounded-xl bg-background/80 px-2.5 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{w.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {w.role}
                        {w.discipline ? ` · ${w.discipline}` : ""}
                        {w.teamName ? ` · ${w.teamName}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={cn("text-[10px] font-semibold", w.isAvailable ? "text-emerald-500" : "text-amber-500")}>
                        {w.isAvailable ? "Available" : "Unavailable"}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-[10px]"
                            disabled={updatingWorkerId === w.id}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Change
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              void updateWorkerAvailability(w.id, true)
                            }}
                          >
                            Mark Available
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              void updateWorkerAvailability(w.id, false)
                            }}
                          >
                            Mark Unavailable
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full rounded-xl border border-dashed border-border/60 bg-background/70 px-3 py-3">
                  <p className="text-xs text-muted-foreground">No crew members assigned</p>
                </div>
              )}
            </div>
          )}

          {isExpanded && viewMode === "machines" && (
            <div className="border-t border-border/60 px-3 py-3 bg-secondary/10 space-y-2">
              {eqLoading ? (
                <div className="w-full rounded-xl border border-dashed border-border/60 bg-background/70 px-3 py-3">
                  <p className="text-xs text-muted-foreground">Loading dedicated machines...</p>
                </div>
              ) : activityEquipment.length > 0 ? (
                activityEquipment.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-background/80 px-2.5 py-2">
                    <p className="min-w-0 truncate text-xs font-medium text-foreground">{item.name || item.id}</p>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={cn("text-[10px] font-semibold", getColorFromMap(equipmentStatusColorMap, item.status, "text-zinc-400"))}>
                        {item.status}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-[10px]"
                            disabled={eqLoading}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Change
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {["active", "idle", "down", "maintenance", "unassigned"].map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation()
                                void updateEquipmentStatus(item.id, status)
                              }}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full rounded-xl border border-dashed border-border/60 bg-background/70 px-3 py-3">
                  <p className="text-xs text-muted-foreground">No dedicated machines for this activity</p>
                </div>
              )}
            </div>
          )}

          {isExpanded && viewMode === "request" && (
            <div className="max-h-[56vh] overflow-y-auto overscroll-contain border-t border-border/60 bg-secondary/10 px-3 py-3 pr-2 space-y-2 ab-scroll">
              {crewRequestLoading ? (
                <div className="w-full rounded-xl border border-dashed border-border/60 bg-background/70 px-3 py-3">
                  <p className="text-xs text-muted-foreground">Loading crew request...</p>
                </div>
              ) : crewRequestSummary ? (
                <div className="rounded-xl bg-background/80 px-2.5 py-2">
                  <p className="mb-2 text-xs font-semibold text-foreground">Saved Crew Request</p>
                  <div className="space-y-1.5">
                    {CREW_REQUEST_FIELDS.map((field) => {
                      const value = crewRequestSummary[field.key] ?? 0
                      if (value <= 0) return null
                      return (
                        <div key={field.key} className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-muted-foreground">{field.label}</span>
                          <span className="text-xs font-semibold text-foreground">{value}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="w-full rounded-xl border border-dashed border-border/60 bg-background/70 px-3 py-3">
                  <p className="text-xs text-muted-foreground">No crew request saved for this activity</p>
                </div>
              )}

              {equipmentRequestLoading ? (
                <div className="w-full rounded-xl border border-dashed border-border/60 bg-background/70 px-3 py-3">
                  <p className="text-xs text-muted-foreground">Loading equipment requests...</p>
                </div>
              ) : equipmentRequestSummary.length > 0 ? (
                <div className="rounded-xl bg-background/80 px-2.5 py-2">
                  <p className="mb-2 text-xs font-semibold text-foreground">Saved Equipment Requests</p>
                  <div className="space-y-1.5">
                    {equipmentRequestSummary.map((request, index) => (
                      <div key={request.id ?? `${request.created_at ?? "equipment-request"}-${index}`} className="rounded-lg bg-secondary/20 px-2 py-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 text-xs font-medium text-foreground wrap-break-word">{request.details || "Equipment request"}</p>
                          {request.quantity ? <span className="shrink-0 text-xs font-semibold text-foreground">Qty {request.quantity}</span> : null}
                        </div>
                        {request.created_at ? (
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full rounded-xl border border-dashed border-border/60 bg-background/70 px-3 py-3">
                  <p className="text-xs text-muted-foreground">No equipment request saved for this activity</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "hidden md:grid items-center gap-3 px-3 py-2.5 transition-colors hover:bg-secondary/20",
          rowGridClass
        )}
      >
        {/* Expand chevron */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand()
          }}
          className="p-0.5 rounded hover:bg-secondary/60 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {/* Activity name + ID */}
        <div className="flex items-center gap-2 min-w-0">
          {getStatusIcon(activity.status)}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate leading-tight text-foreground">
              {activity.name}
            </p>
            <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
              {getActivityId(activity)}
            </p>
            {(viewMode === "crew" || viewMode === "machines") && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {viewMode === "crew"
                  ? "Click expand to view all crew members and states"
                  : "Click expand to view dedicated machines and status"}
              </p>
            )}
            {viewMode === "request" && (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="h-7 px-3 text-xs">
                      Request
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        openRequestDialog("crew")
                      }}
                    >
                      Crew Request
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        openRequestDialog("machine")
                      }}
                    >
                      Equipment Request
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-[10px] text-muted-foreground">
                  Request counts or equipment for this activity
                </span>
              </div>
            )}
          </div>
          {track === "Behind" && (
            <Badge
              variant="outline"
              className="text-[10px] h-4 px-1.5 bg-amber-500/10 text-amber-500 border-amber-500/30 shrink-0"
            >
              Delayed
            </Badge>
          )}
        </div>

        {viewMode === "progress" && (
          <>
            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 h-1.5 rounded-full overflow-hidden bg-secondary/60">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    background: progress === 100 ? "#10b981" : isDelayed ? "#f59e0b" : "#3b82f6",
                  }}
                />
              </div>
              <span
                className="text-xs font-semibold w-7 text-right shrink-0"
                style={{ color: progress === 100 ? "#10b981" : isDelayed ? "#f59e0b" : undefined }}
              >
                {progress}%
              </span>
            </div>

            {/* Planned Finish */}
            <span className="text-xs text-muted-foreground">
              {deadline ? formatDateShort(deadline) : "\u2013"}
            </span>

            {/* Engineer */}
            <div className="flex items-center gap-1.5 min-w-0">
              {engineerName ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-primary">
                      {engineerName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    {engineerName}
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">&ndash;</span>
              )}
            </div>

            {/* Crew — just the headcount */}
            <div className="flex items-center gap-1 min-w-0">
              {crewCount !== null ? (
                <>
                  <span className="text-sm font-semibold text-foreground">{crewCount}</span>
                  <span className="text-[10px] text-muted-foreground">workers</span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">&ndash;</span>
              )}
            </div>

            {/* Assets */}
            <span className="text-[10px] text-muted-foreground truncate">
              {getDummyEquipment(activity)}
            </span>

            {/* Issues */}
            <div className="flex items-center gap-1">
              {issues.length > 0 ? (
                <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#ef4444" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {issues.length}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">0</span>
              )}
            </div>

            {/* Last Update */}
            <span className="text-[10px] text-muted-foreground">
              {lastUpdated
                ? lastUpdated.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "\u2013"}
            </span>
          </>
        )}

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover/row:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onViewOnMap()
              }}
            >
              <MapPin className="h-3.5 w-3.5 mr-2" />
              View on Map
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onStatusChange?.(activity.zoneID, "PENDING")}>
              <Circle className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              Set Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange?.(activity.zoneID, "IN_PROGRESS")}>
              <CircleDot className="h-3.5 w-3.5 mr-2 text-blue-400" />
              Set In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange?.(activity.zoneID, "PAUSED")}>
              <PauseCircle className="h-3.5 w-3.5 mr-2 text-orange-400" />
              Set Paused
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange?.(activity.zoneID, "COMPLETED")}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-400" />
              Set Completed
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onStatusChange?.(activity.zoneID, "CANCELLED")}>
              <XCircle className="h-3.5 w-3.5 mr-2 text-red-400" />
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Expanded crew members (crew mode) */}
      {isExpanded && viewMode === "crew" && (
        <div className="hidden md:block ml-10 mr-3 mb-2 mt-1 border-l-2 border-border/40 pl-3 space-y-1.5">
          {crewMembers.length > 0 ? (
            crewMembers.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between gap-3 py-2 px-2 rounded-md hover:bg-secondary/20"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{w.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {w.role}
                    {w.discipline ? ` · ${w.discipline}` : ""}
                    {w.teamName ? ` · ${w.teamName}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-semibold",
                    w.isAvailable ? "text-emerald-500" : "text-amber-500"
                  )}>
                    {w.isAvailable ? "Available" : "Unavailable"}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px]"
                        disabled={updatingWorkerId === w.id}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Change
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          void updateWorkerAvailability(w.id, true)
                        }}
                      >
                        Mark Available
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          void updateWorkerAvailability(w.id, false)
                        }}
                      >
                        Mark Unavailable
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="py-2 px-3 rounded-md bg-secondary/10 border border-dashed border-border/60">
              <p className="text-xs text-muted-foreground">No crew members assigned</p>
            </div>
          )}
        </div>
      )}

      {/* Expanded machines (machines mode) */}
      {isExpanded && viewMode === "machines" && (
        <div className="hidden md:block ml-10 mr-3 mb-2 mt-1 border-l-2 border-border/40 pl-3 space-y-1.5">
          {eqLoading && (
            <div className="py-2 px-3 rounded-md bg-secondary/10 border border-dashed border-border/60">
              <p className="text-xs text-muted-foreground">Loading dedicated machines...</p>
            </div>
          )}
          {!eqLoading && activityEquipment.length > 0 ? (
            activityEquipment.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-2 px-2 rounded-md hover:bg-secondary/20"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{item.name || item.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-semibold",
                    getColorFromMap(equipmentStatusColorMap, item.status, "text-zinc-400")
                  )}>{item.status}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 px-2">Change</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {['active','idle','down','maintenance','unassigned'].map((s) => (
                        <DropdownMenuItem key={s} onClick={(e) => { e.stopPropagation(); void updateEquipmentStatus(item.id, s) }}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            !eqLoading && (
              <div className="py-2 px-3 rounded-md bg-secondary/10 border border-dashed border-border/60">
                <p className="text-xs text-muted-foreground">No dedicated machines for this activity</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Expanded subtasks */}
      {isExpanded && viewMode === "progress" && subtasks.length > 0 && (
        <div className="hidden md:block ml-10 mr-3 mb-2 mt-1 border-l-2 border-border/40 pl-3 space-y-0.5">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary/20"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSubtask?.(activity.zoneID, subtask.id)
                }}
                className={cn(
                  "h-4 w-4 rounded-full border-2 shrink-0 transition-all hover:scale-110 cursor-pointer",
                  subtask.completed
                    ? "bg-emerald-400 border-emerald-400"
                    : "border-muted-foreground/40 hover:border-primary"
                )}
              />
              <span
                className={cn(
                  "text-xs flex-1",
                  subtask.completed ? "text-muted-foreground line-through" : "text-foreground"
                )}
              >
                {subtask.title}
              </span>
              {onSubtaskUpdate && (
                <SubtaskProgressModal
                  subtask={subtask}
                  onSubmit={(desc, urls) => onSubtaskUpdate(activity.zoneID, subtask.id, desc, urls)}
                />
              )}
              {subtask.dueDate && (
                <span className="text-[10px] text-muted-foreground">
                  {new Date(subtask.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {isExpanded && viewMode === "progress" && subtasks.length === 0 && (
        <div className="hidden md:block ml-10 mr-3 mb-2 mt-1 py-2 px-3 rounded-md bg-secondary/10 border border-dashed border-border/60">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ListTodo className="h-3 w-3" />
            No subtasks yet
          </p>
        </div>
      )}

      {isExpanded && viewMode === "request" && (
        <div className="hidden md:block ml-10 mr-3 mb-2 mt-1 border-l-2 border-border/40 pl-3 space-y-2">
          {crewRequestLoading ? (
            <div className="py-2 px-3 rounded-md bg-secondary/10 border border-dashed border-border/60">
              <p className="text-xs text-muted-foreground">Loading crew request...</p>
            </div>
          ) : crewRequestSummary ? (
            <div className="rounded-md border border-border/60 bg-background/70 px-3 py-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">Saved Crew Request</p>
                <span className="text-[10px] text-muted-foreground">activity_worker_requirements</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {CREW_REQUEST_FIELDS.map((field) => {
                  const value = crewRequestSummary[field.key] ?? 0
                  if (value <= 0) return null
                  return (
                    <div key={field.key} className="flex items-center justify-between gap-2 rounded bg-secondary/10 px-2 py-1.5">
                      <span className="text-[10px] text-muted-foreground">{field.label}</span>
                      <span className="text-xs font-semibold text-foreground">{value}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="py-2 px-3 rounded-md bg-secondary/10 border border-dashed border-border/60">
              <p className="text-xs text-muted-foreground">No crew request saved for this activity</p>
            </div>
          )}

          {equipmentRequestLoading ? (
            <div className="py-2 px-3 rounded-md bg-secondary/10 border border-dashed border-border/60">
              <p className="text-xs text-muted-foreground">Loading equipment requests...</p>
            </div>
          ) : equipmentRequestSummary.length > 0 ? (
            <div className="rounded-md border border-border/60 bg-background/70 px-3 py-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">Saved Equipment Requests</p>
                <span className="text-[10px] text-muted-foreground">equipment_requests</span>
              </div>
              <div className="space-y-1.5">
                {equipmentRequestSummary.map((request, index) => (
                  <div
                    key={request.id ?? `${request.created_at ?? "equipment-request"}-${index}`}
                    className="flex flex-col gap-1 rounded bg-secondary/10 px-2 py-1.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground wrap-break-word">
                        {request.details || "Equipment request"}
                      </p>
                      {request.created_at ? (
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      ) : null}
                    </div>
                    {request.quantity ? (
                      <span className="shrink-0 text-xs font-semibold text-foreground">
                        Qty {request.quantity}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-2 px-3 rounded-md bg-secondary/10 border border-dashed border-border/60">
              <p className="text-xs text-muted-foreground">No equipment request saved for this activity</p>
            </div>
          )}
        </div>
      )}

      <CrewMachineRequestDialog
        activity={activity}
        open={requestDialogOpen}
        requestType={requestDialogType}
        onOpenChange={handleRequestDialogOpenChange}
        onMachineRequestSubmit={(activityId, details) => onCrewMachineRequest?.(activityId, "machine", details)}
      />
    </div>
  )
}

export function LinearActivitiesBoard({
  activities,
  subtasksByActivity,
  onActivitySelect,
  onViewOnMap,
  onAddActivity,
  onStatusChange,
  onToggleSubtask,
  onSubtaskUpdate,
  selectedActivityId,
  activityWorkersDetail,
  onCrewMachineRequest,
}: LinearActivitiesBoardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("progress")
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (selectedActivityId == null) return
    setExpandedActivities((prev) => {
      const next = new Set(prev)
      next.add(selectedActivityId)
      return next
    })
    setTimeout(() => {
      const el = document.getElementById(`activity-row-${selectedActivityId}`)
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 50)
  }, [selectedActivityId])

  const toggleExpanded = (id: number) => {
    setExpandedActivities((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredActivities = useMemo(() => {
    let result = activities
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.activity?.toLowerCase().includes(q)
      )
    }
    if (filter !== "all") {
      result = result.filter((a) => {
        const subtasks = subtasksByActivity[a.zoneID] ?? []
        const progress =
          subtasks.length > 0 ? calculateProgressFromSubtasks(subtasks) : a.progress ?? 0
        const track = getTrackLabelFromSubtasks(subtasks)
        switch (filter) {
          case "on-track":
            return track === "On Track" && progress < 100
          case "behind":
            return track === "Behind"
          case "completed":
            return progress === 100 || a.status === "COMPLETED"
          default:
            return true
        }
      })
    }
    return result
  }, [activities, subtasksByActivity, searchQuery, filter])

  useEffect(() => {
    const styleId = "activity-board-scrollbar-styles"
    if (document.getElementById(styleId)) return
    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      .ab-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
      .ab-scroll::-webkit-scrollbar-track { background: transparent; }
      .ab-scroll::-webkit-scrollbar-thumb { background: rgba(14,165,233,0.15); border-radius: 4px; }
      .ab-scroll::-webkit-scrollbar-thumb:hover { background: rgba(14,165,233,0.3); }
    `
    document.head.appendChild(style)
    return () => { document.getElementById(styleId)?.remove() }
  }, [])

  return (
    <div className="flex flex-col h-full bg-card rounded-none overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 px-4 py-3 border-b border-border shrink-0 md:flex-row md:items-center">
        <div className="relative w-full md:flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm bg-secondary/20"
          />
        </div>
        <div className="flex w-full flex-nowrap items-center gap-1.5 overflow-x-auto pb-1 md:w-auto md:flex-wrap md:overflow-visible md:pb-0">
          {(["all", "on-track", "behind", "completed"] as FilterType[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-7 text-xs px-2.5 shrink-0 max-w-full",
                filter === f && "bg-secondary text-foreground"
              )}
              onClick={() => setFilter(f)}
            >
              {f === "all"
                ? "All"
                : f === "on-track"
                ? "On Track"
                : f === "behind"
                ? "Behind"
                : "Done"}
            </Button>
          ))}
        </div>
        <div className="w-full md:ml-2 md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-9 w-full justify-between px-3 text-xs md:h-7 md:w-auto md:min-w-44 md:px-2.5">
                <span className="truncate">{getViewModeLabel(viewMode)}</span>
                <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)] md:w-56">
              <DropdownMenuItem onClick={() => setViewMode("progress")}>Activity Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("crew")}>Crew Members</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("machines")}>Machines</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("request")}>Crew/Machines Request</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="hidden md:flex-1 md:block" />
        {onAddActivity && (
          <Button size="sm" className="h-8 gap-1.5 text-xs shrink-0 w-full md:w-auto" onClick={onAddActivity}>
            <Plus className="h-3.5 w-3.5" />
            New Activity
          </Button>
        )}
      </div>

      {/* Table header */}
      <TableHeader viewMode={viewMode} />

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto ab-scroll">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ListTodo className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No activities found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery ? "Try a different search" : "Add your first activity to get started"}
            </p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <ActivityRow
              key={activity.zoneID}
              activity={activity}
              subtasks={subtasksByActivity[activity.zoneID] ?? []}
              onViewOnMap={() => onViewOnMap(activity)}
              onStatusChange={onStatusChange}
              onToggleSubtask={onToggleSubtask}
              onSubtaskUpdate={onSubtaskUpdate}
              isExpanded={expandedActivities.has(activity.zoneID)}
              onToggleExpand={() => toggleExpanded(activity.zoneID)}
              workers={activityWorkersDetail?.[activity.zoneID]}
              isSelected={selectedActivityId === activity.zoneID}
              viewMode={viewMode}
              onCrewMachineRequest={(id, type, details) => onCrewMachineRequest?.(id, type, details)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-1 px-4 py-2.5 border-t border-border text-[11px] text-muted-foreground shrink-0 sm:flex-row sm:items-center sm:justify-between">
        <span className="truncate">{filteredActivities.length} of {activities.length} activities</span>
        <span className="truncate">{filteredActivities.length} shown</span>
      </div>
    </div>
  )
}
