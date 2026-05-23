"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useEffect, useMemo, useState } from "react"
import DonutChart from "@/components/charts/DonutChart"
import { equipmentStatusColorMap, workforceRoleColorMap, getColorFromMap } from "@/lib/colorMap"
import { Bell } from "lucide-react"
import { type Subtask } from "@/lib/subtasks-data"

export type Activity = {
  activityid: number
  projectid: number
  description: string | null
  status: string
  progress: number
  createdat: string | null
  updatedat: string | null
  name?: string | null
  imageurl?: string | null
  imagepath?: string | null
}

type ProjectRecord = {
  projectid: number
  name: string
  description: string | null
  projectdiagram: string | null
  projectdeadline: string | null
  createdat: string | null
  updatedat: string | null
  status: string
  locationlongitude: number | null
  locationlatitude: number | null
}

type WorkforceWorkerRecord = {
  role: string | null
}

type DonutSegment = {
  key: string
  label: string
  value: number
  colorClass: string
}

type EquipmentSummary = {
  total: number
  active: number
  idle: number
  down: number
  maintenance: number
  unassigned: number
}

type EquipmentStatusKey = Exclude<keyof EquipmentSummary, "total">

type EquipmentClassCount = {
  classid: number
  class_name: string
  cnt: number
}

type EquipmentClassSummary = {
  classCounts: EquipmentClassCount[]
}

const equipmentStatusMeta: Array<{
  key: EquipmentStatusKey
  label: string
  colorClass: string
}> = [
  { key: "active", label: "Active", colorClass: "text-emerald-500" },
  { key: "idle", label: "Idle", colorClass: "text-amber-500" },
  { key: "maintenance", label: "Maintenance", colorClass: "text-purple-500" },
  { key: "down", label: "Down", colorClass: "text-red-500" },
  { key: "unassigned", label: "Unassigned", colorClass: "text-zinc-500" },
]

const equipmentClassColorMap: Record<string, string> = {
  "cranes & lifting gear": "text-blue-500",
  "heavy earthmovers": "text-orange-500",
  "concrete fleet": "text-yellow-500",
  "drilling & piling rigs": "text-cyan-500",
  "trucks & transport": "text-indigo-500",
  "rollers & compactors": "text-rose-500",
}

const workforceRoleMeta: Array<{
  key: string
  colorClass: string
}> = [
  { key: "supervisor", colorClass: "text-emerald-500" },
  { key: "technician", colorClass: "text-amber-500" },
  { key: "operator", colorClass: "text-indigo-500" },
  { key: "skilled-labour", colorClass: "text-red-500" },
  { key: "engineer", colorClass: "text-cyan-500" },
  { key: "developer", colorClass: "text-purple-500" },
  { key: "system-admin", colorClass: "text-teal-500" },
  { key: "general-labour", colorClass: "text-zinc-500" },
]

// page-level mock data is sourced from API where available
const activeIssues = [
  {
    id: "ISS-001",
    title: "Material Delay - Steel Rebar",
    priority: "high",
    status: "open",
    owner: "Procurement Team",
  },
  {
    id: "ISS-002",
    title: "Equipment Failure - Crane #2",
    priority: "critical",
    status: "in-progress",
    owner: "Maintenance",
  },
  {
    id: "ISS-003",
    title: "Labour Shortage - Zone B",
    priority: "medium",
    status: "open",
    owner: "HR Department",
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-success text-success-foreground"
    case "in-progress":
      return "bg-primary text-primary-foreground"
    case "delayed":
      return "bg-destructive text-destructive-foreground"
    case "not-started":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "critical":
      return "bg-destructive text-destructive-foreground"
    case "high":
      return "bg-warning text-warning-foreground"
    case "medium":
      return "bg-primary text-primary-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function formatProjectStatus(status?: string) {
  if (!status) return "Unknown"

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function getTimelineRank(status?: string) {
  switch ((status || "").toUpperCase()) {
    case "PENDING":
      return 0
    case "IN_PROGRESS":
      return 1
    case "COMPLETED":
      return 2
    default:
      return 3
  }
}

function getActivityStatusMeta(status?: string) {
  switch ((status || "").toUpperCase()) {
    case "COMPLETED":
      return {
        dotClass: "bg-success",
        labelClass: "text-success",
        railClass: "bg-success/80",
        ringClass: "ring-success/25",
      }
    case "IN_PROGRESS":
      return {
        dotClass: "bg-primary",
        labelClass: "text-primary",
        railClass: "bg-primary/80",
        ringClass: "ring-primary/25",
      }
    case "PENDING":
      return {
        dotClass: "bg-warning",
        labelClass: "text-warning",
        railClass: "bg-warning/80",
        ringClass: "ring-warning/25",
      }
    default:
      return {
        dotClass: "bg-muted",
        labelClass: "text-muted-foreground",
        railClass: "bg-border",
        ringClass: "ring-border/40",
      }
  }
}

function formatSubtaskDate(value?: string | null) {
  if (!value) return "No due date"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function EquipmentStatusSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative mx-auto h-44 w-44 rounded-full border border-border/60 bg-muted/50" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-32 rounded bg-muted/70" />
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="h-14 rounded-xl border border-border/60 bg-muted/40" />
            <div className="h-14 rounded-xl border border-border/60 bg-muted/40" />
            <div className="h-14 rounded-xl border border-border/60 bg-muted/40" />
            <div className="h-14 rounded-xl border border-border/60 bg-muted/40" />
          </div>
        </div>
      </div>
      <div className="grid gap-2">
        <div className="h-12 rounded-xl border border-border/60 bg-muted/40" />
        <div className="h-12 rounded-xl border border-border/60 bg-muted/40" />
        <div className="h-12 rounded-xl border border-border/60 bg-muted/40" />
      </div>
    </div>
  )
}

function WorkforceDonutSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
        <div className="mx-auto h-56 w-56 rounded-full border border-zinc-800/60 bg-zinc-900/50" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-11 rounded-xl border border-zinc-800/60 bg-zinc-900/40" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProjectPage() {
  const params = useParams<{ id?: string }>()
  const projectId = params.id
  const [activities, setActivities] = useState<Activity[]>([])
  const [project, setProject] = useState<ProjectRecord | null>(null)
  const [workforceWorkers, setWorkforceWorkers] = useState<WorkforceWorkerRecord[]>([])
  const [workforceLoading, setWorkforceLoading] = useState(true)
  const [equipmentSummary, setEquipmentSummary] = useState<EquipmentSummary | null>(null)
  const [equipmentLoading, setEquipmentLoading] = useState(true)
  const [equipmentClassSummary, setEquipmentClassSummary] = useState<EquipmentClassSummary | null>(null)
  const [equipmentClassLoading, setEquipmentClassLoading] = useState(true)
  const [subtasksByActivity, setSubtasksByActivity] = useState<Record<number, Subtask[]>>({})
  const [hoveredActivityId, setHoveredActivityId] = useState<number | null>(null)
  const [hoverPopup, setHoverPopup] = useState<{ x: number; y: number } | null>(null)
  const [pinnedActivityId, setPinnedActivityId] = useState<number | null>(null)
  const [hoveredEquipmentStatus, setHoveredEquipmentStatus] = useState<EquipmentStatusKey | null>(null)

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return

      try {
        const [projectResponse, activitiesResponse] = await Promise.all([
          fetch(`/api/project/${projectId}`),
          fetch(`/api/project/${projectId}/activities`),
        ])

        if (projectResponse.ok) {
          const projectData = await projectResponse.json()
          setProject(projectData.project ?? null)
        } else {
          console.error("Failed to fetch project")
        }

        if (activitiesResponse.ok) {
          const data = await activitiesResponse.json()
          setActivities(Array.isArray(data.activities) ? data.activities : [])
        } else {
          console.error("Failed to fetch activities")
        }

        const subtasksResponse = await fetch(`/api/project/${projectId}/subtasks`, { cache: "no-store" })
        if (subtasksResponse.ok) {
          const subtaskData = await subtasksResponse.json()
          setSubtasksByActivity(
            Object.fromEntries(
              Object.entries(subtaskData.subtasksByActivity ?? {}).map(([activityId, subtasks]) => [
                Number(activityId),
                Array.isArray(subtasks) ? subtasks : [],
              ])
            )
          )
        } else {
          console.error("Failed to fetch subtasks")
          setSubtasksByActivity({})
        }
      } catch (error) {
        console.error("Error fetching project data:", error)
      }
    }

    fetchProjectData()
  }, [projectId])

  useEffect(() => {
    const fetchWorkforce = async () => {
      if (!projectId) {
        setWorkforceLoading(false)
        return
      }

      try {
        setWorkforceLoading(true)
        const response = await fetch(`/api/project/${projectId}/workforce`, { cache: "no-store" })

        if (!response.ok) {
          throw new Error(`Failed to load workforce data (${response.status})`)
        }

        const payload = await response.json()
        setWorkforceWorkers(Array.isArray(payload.workers) ? payload.workers : [])
      } catch (error) {
        console.error("Error fetching workforce data:", error)
        setWorkforceWorkers([])
      } finally {
        setWorkforceLoading(false)
      }
    }

    fetchWorkforce()
  }, [projectId])

  useEffect(() => {
    const fetchEquipmentSummary = async () => {
      if (!projectId) {
        setEquipmentLoading(false)
        return
      }

      try {
        setEquipmentLoading(true)
        const response = await fetch(`/api/project/${projectId}/equipment?filter=project&summarize=status`, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Failed to load equipment summary (${response.status})`)
        }

        const payload = await response.json()
        const summary = payload.summary ?? payload

        setEquipmentSummary({
          total: Number(summary.total ?? 0),
          active: Number(summary.active ?? 0),
          idle: Number(summary.idle ?? 0),
          down: Number(summary.down ?? summary.underRepair ?? 0),
          maintenance: Number(summary.maintenance ?? summary.maintenanceDueCount ?? 0),
          unassigned: Number(summary.unassigned ?? 0),
        })
      } catch (error) {
        console.error("Error fetching equipment summary:", error)
        setEquipmentSummary(null)
      } finally {
        setEquipmentLoading(false)
      }
    }

    fetchEquipmentSummary()
  }, [projectId])

  useEffect(() => {
    const fetchEquipmentClassSummary = async () => {
      if (!projectId) {
        setEquipmentClassLoading(false)
        return
      }

      try {
        setEquipmentClassLoading(true)
        const response = await fetch(`/api/project/${projectId}/equipment?filter=project&summarize=classes`, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Failed to load equipment class summary (${response.status})`)
        }

        const payload = await response.json()
        setEquipmentClassSummary(payload)
      } catch (error) {
        console.error("Error fetching equipment class summary:", error)
        setEquipmentClassSummary(null)
      } finally {
        setEquipmentClassLoading(false)
      }
    }

    fetchEquipmentClassSummary()
  }, [projectId])

  const overallProgress = activities.length > 0 ? Math.round(activities.reduce((sum, activity) => sum + activity.progress, 0) / activities.length) : 0
  const timelineActivities = useMemo(
    () =>
      [...activities].sort((left, right) => {
        const rankDiff = getTimelineRank(left.status) - getTimelineRank(right.status)
        if (rankDiff !== 0) return rankDiff

        return (left.activityid ?? 0) - (right.activityid ?? 0)
      }),
    [activities]
  )
  const hoveredActivity =
    timelineActivities.find((activity) => activity.activityid === (pinnedActivityId ?? hoveredActivityId)) ??
    timelineActivities[0] ??
    null
  const hoveredSubtasks = hoveredActivity ? subtasksByActivity[hoveredActivity.activityid] ?? [] : []
  const pendingActivities = timelineActivities
    .filter((activity) => activity.status?.toUpperCase() === "PENDING")
    .sort((left, right) => left.progress - right.progress || (left.activityid ?? 0) - (right.activityid ?? 0))
  const inProgressActivities = timelineActivities
    .filter((activity) => activity.status?.toUpperCase() === "IN_PROGRESS")
    .sort((left, right) => left.progress - right.progress || (left.activityid ?? 0) - (right.activityid ?? 0))
  const completedActivities = timelineActivities
    .filter((activity) => activity.status?.toUpperCase() === "COMPLETED")
    .sort((left, right) => left.progress - right.progress || (left.activityid ?? 0) - (right.activityid ?? 0))
  const workforceSummary = useMemo(() => {
    const roleCounts = workforceWorkers.reduce((acc, worker) => {
      const role = worker.role?.trim()

      if (!role) {
        return acc
      }

      acc[role] = (acc[role] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      roleCounts,
      total: workforceWorkers.length,
    }
  }, [workforceWorkers])
  const workforceSegments = useMemo<DonutSegment[]>(() => {
    const knownRoles = new Set(workforceRoleMeta.map((role) => role.key))
    const extraRoles = Object.keys(workforceSummary.roleCounts)
      .filter((role) => !knownRoles.has(role))
      .sort((left, right) => left.localeCompare(right))

    return [
      ...workforceRoleMeta,
      ...extraRoles.map((role) => ({ key: role, colorClass: "text-zinc-400" })),
    ].map((entry) => ({
      key: entry.key,
      label: entry.key,
      value: workforceSummary.roleCounts[entry.key] ?? 0,
      colorClass: getColorFromMap(workforceRoleColorMap, entry.key, entry.colorClass),
    }))
  }, [workforceSummary.roleCounts])
  const equipmentTotal = equipmentSummary?.total ?? 0
  const equipmentSegments = useMemo<DonutSegment[]>(
    () =>
      equipmentStatusMeta.map((meta) => ({
        key: meta.key,
        label: meta.label,
        value: equipmentSummary?.[meta.key] ?? 0,
        colorClass: getColorFromMap(equipmentStatusColorMap, meta.key, meta.colorClass),
      })),
    [equipmentSummary]
  )

  const equipmentClassTotal = useMemo(
    () => (equipmentClassSummary?.classCounts ?? []).reduce((sum, cls) => sum + (cls.cnt ?? 0), 0),
    [equipmentClassSummary]
  )
  const equipmentClassSegments = useMemo<DonutSegment[]>(
    () =>
      (equipmentClassSummary?.classCounts ?? [])
        .sort((a, b) => (b.cnt ?? 0) - (a.cnt ?? 0))
        .map((cls) => ({
          key: cls.class_name?.toLowerCase() ?? "unknown",
          label: cls.class_name ?? "Unknown",
          value: cls.cnt ?? 0,
          colorClass: getColorFromMap(equipmentClassColorMap, cls.class_name?.toLowerCase() ?? "unknown", "text-zinc-400"),
        })),
    [equipmentClassSummary]
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Hero / Header */}
      <div className="grid gap-6 lg:grid-cols-1 items-start">
        <div className="w-full">
          <Card className="relative overflow-hidden border-border/70 bg-linear-to-br from-background via-background to-primary/5 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
            </div>

            <div className="relative space-y-8 p-6 lg:p-8">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-4xl space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
                    Project Overview
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        {project?.name ?? "Loading project..."}
                      </p>
                      <Badge variant="outline" className="border-primary/20 bg-background/80 text-foreground shadow-sm">
                        {formatProjectStatus(project?.status)}
                      </Badge>
                    </div>

                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                      {project?.description ?? project?.projectdiagram ?? "Mixed-use commercial development comprising 12,400 m² of office and retail space across six stories. Steel-frame construction with curtain wall glazing."}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:min-w-90">
                  <div className="rounded-2xl border border-border/70 bg-background/75 p-4 shadow-sm backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Start</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{formatDate(project?.createdat)}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/75 p-4 shadow-sm backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Target</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{formatDate(project?.projectdeadline)}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/75 p-4 shadow-sm backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Budget</p>
                    <p className="mt-2 text-sm font-medium text-foreground">$4.2M</p>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Open notifications"
                        className="group flex items-center justify-between rounded-2xl border border-warning/30 bg-warning/10 p-4 text-left shadow-sm backdrop-blur-sm transition-colors hover:bg-warning/15"
                      >
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.22em] text-warning">Notifications</p>
                          <p className="mt-2 text-sm font-medium text-foreground">{activeIssues.length} open alerts</p>
                        </div>
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-warning/30 bg-background/80 text-warning transition-transform group-hover:scale-105">
                          <Bell className="h-4 w-4" />
                          <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full border-2 border-background bg-warning px-1 text-[10px] text-warning-foreground">
                            {activeIssues.length}
                          </Badge>
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" sideOffset={10} className="w-96 p-0">
                      <div className="border-b border-border px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-warning" />
                            <p className="text-sm font-semibold text-foreground">Notifications</p>
                          </div>
                          <Badge variant="outline" className="border-warning/30 text-warning">
                            {activeIssues.length} open
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Expanded details for the latest site alerts and issues</p>
                      </div>
                      <div className="max-h-[28rem] overflow-y-auto p-3">
                        <div className="space-y-3">
                          {activeIssues.map((issue) => (
                            <div key={`notification-${issue.id}`} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-semibold text-foreground">{issue.title}</p>
                                    <Badge className={getPriorityColor(issue.priority)} variant="secondary">
                                      {issue.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">Owner: {issue.owner}</p>
                                  <p className="text-xs text-muted-foreground">Notification ID: {issue.id}</p>
                                  <p className="text-sm leading-6 text-foreground">
                                    {issue.status === "open"
                                      ? "This alert is active and needs review."
                                      : "This alert has been updated and is ready for follow-up."}
                                  </p>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-2">
                                  <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    {issue.status}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                <div className="rounded-lg border border-border bg-muted/20 p-2">
                                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Priority</p>
                                  <p className="mt-1 text-sm font-medium text-foreground capitalize">{issue.priority}</p>
                                </div>
                                <div className="rounded-lg border border-border bg-muted/20 p-2">
                                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Status</p>
                                  <p className="mt-1 text-sm font-medium text-foreground capitalize">{issue.status}</p>
                                </div>
                                <div className="rounded-lg border border-border bg-muted/20 p-2">
                                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Source</p>
                                  <p className="mt-1 text-sm font-medium text-foreground">Site Alerts</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Activity Timeline</CardTitle>
                    <CardDescription>Hover a dot to preview the activity image</CardDescription>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-warning" />Pending</span>
                    <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />In progress</span>
                    <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success" />Completed</span>
                  </div>
                </div>

                <div className="relative overflow-visible">
                  <div className="overflow-x-auto overflow-y-visible">
                    <div className="min-w-225 relative pt-12">
                    <div className="absolute left-8 right-8 top-14 flex h-1 overflow-hidden rounded-full bg-border/40">
                      {timelineActivities.map((activity) => {
                        const statusMeta = getActivityStatusMeta(activity.status)

                        return (
                          <div
                            key={`rail-${activity.activityid}`}
                            className={`h-full flex-1 ${statusMeta.railClass}`}
                          />
                        )
                      })}
                    </div>

                    <div className="flex items-start justify-between gap-6 px-6">
                      {timelineActivities.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No activities available for this project</div>
                      ) : (
                        timelineActivities.map((activity, index) => {
                          const isHovered = (pinnedActivityId ?? hoveredActivityId) === activity.activityid || (!hoveredActivityId && !pinnedActivityId && index === 0)
                          const statusMeta = getActivityStatusMeta(activity.status)

                          return (
                            <button
                              key={activity.activityid}
                              type="button"
                              onMouseEnter={(event) => {
                                if (pinnedActivityId === activity.activityid) return
                                const rect = event.currentTarget.getBoundingClientRect()
                                setHoveredActivityId(activity.activityid)
                                setHoverPopup({
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                })
                              }}
                              onFocus={(event) => {
                                if (pinnedActivityId === activity.activityid) return
                                const rect = event.currentTarget.getBoundingClientRect()
                                setHoveredActivityId(activity.activityid)
                                setHoverPopup({
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                })
                              }}
                              onMouseLeave={() => {
                                if (pinnedActivityId === activity.activityid) return
                                setHoveredActivityId(null)
                                setHoverPopup(null)
                              }}
                              onBlur={() => {
                                if (pinnedActivityId === activity.activityid) return
                                setHoveredActivityId(null)
                                setHoverPopup(null)
                              }}
                              onClick={() => {
                                setPinnedActivityId((current) => {
                                  const next = current === activity.activityid ? null : activity.activityid
                                  if (next === null) {
                                    setHoveredActivityId(null)
                                    setHoverPopup(null)
                                  } else {
                                    const rect = document
                                      .querySelector(`[data-activity-dot="${activity.activityid}"]`)
                                      ?.getBoundingClientRect()
                                    if (rect) {
                                      setHoveredActivityId(activity.activityid)
                                      setHoverPopup({ x: rect.left + rect.width / 2, y: rect.top })
                                    }
                                  }
                                  return next
                                })
                              }}
                              className="relative flex w-28 flex-col items-center outline-none"
                            >
                              <span
                                data-activity-dot={activity.activityid}
                                className={`relative z-10 h-5 w-5 rounded-full border-4 border-background shadow-md transition-transform ${statusMeta.dotClass} ${isHovered ? `scale-125 ring-4 ${statusMeta.ringClass}` : ""}`}
                              />
                              <span className="mt-3 text-center text-xs font-medium text-foreground line-clamp-2">
                                {activity.name || activity.description || `Activity ${activity.activityid}`}
                              </span>
                              <span className={`mt-1 text-center text-[11px] font-medium ${statusMeta.labelClass}`}>
                                {formatProjectStatus(activity.status)}
                              </span>
                            </button>
                          )
                        })
                      )}
                    </div>
                    </div>
                  </div>
                </div>

                {hoveredActivity && hoverPopup && (
                  <div
                    className="fixed z-[100] w-80 -translate-x-1/2 -translate-y-full rounded-xl border border-border bg-card p-3 shadow-2xl"
                    style={{ left: hoverPopup.x, top: hoverPopup.y - 12 }}
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-border pb-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {hoveredActivity.name || hoveredActivity.description || `Activity ${hoveredActivity.activityid}`}
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">Activity ID: {hoveredActivity.activityid}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPinnedActivityId((current) => (current === hoveredActivity.activityid ? null : hoveredActivity.activityid))
                        }}
                        className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:bg-muted/50"
                      >
                        {pinnedActivityId === hoveredActivity.activityid ? "Unpin" : "Pin"}
                      </button>
                    </div>
                    <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                      {hoveredSubtasks.length > 0 ? (
                        hoveredSubtasks.map((subtask) => (
                          <div key={subtask.id} className="rounded-lg border border-border bg-muted/20 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-foreground">{subtask.title}</div>
                                <div className="mt-1 text-[11px] text-muted-foreground">
                                  Due {formatSubtaskDate(subtask.dueDate)} · Step {subtask.order}
                                </div>
                              </div>
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                                  subtask.completed
                                    ? "bg-success/15 text-success"
                                    : "bg-warning/15 text-warning"
                                }`}
                              >
                                {subtask.completed ? "Completed" : "Pending"}
                              </span>
                            </div>
                            {subtask.updates.length > 0 && (
                              <div className="mt-2 border-l-2 border-border pl-2 text-[11px] text-muted-foreground">
                                {subtask.updates[0].description}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                          No subtasks found for this activity.
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                      <span>{hoveredSubtasks.length} subtasks</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPinnedActivityId(null)
                          setHoveredActivityId(null)
                          setHoverPopup(null)
                        }}
                        className="font-semibold uppercase tracking-widest text-warning"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </Card>
        </div>
      </div>

      {/* Panels: Alerts + Allocations */}
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="h-full w-full border-border bg-card">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Workforce</CardTitle>
              </div>
              <Button asChild size="sm" variant="outline" className="border-primary/20 bg-background/80">
                <Link href={projectId ? `/project/${projectId}/workforce` : "/project"}>Manage Wrokforce</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {workforceLoading ? (
                <WorkforceDonutSkeleton />
              ) : (
                <DonutChart
                  segments={workforceSegments}
                  total={workforceSummary.total}
                  centerLabel="Total workers"
                  ariaLabel="Workforce role distribution donut chart"
                />
              )}
            </CardContent>
          </Card>

          <Card className="h-full w-full border-border bg-card">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Assets</CardTitle>
              </div>
              <Button asChild size="sm" variant="outline" className="border-primary/20 bg-background/80">
                <Link href={projectId ? `/project/${projectId}/equipment` : "/project"}>Manage Assets</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {equipmentClassLoading ? (
                <WorkforceDonutSkeleton />
              ) : equipmentClassTotal === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                  No equipment classes found for this project yet.
                </div>
              ) : (
                <DonutChart
                  segments={equipmentClassSegments}
                  total={equipmentClassTotal}
                  centerLabel="Total Assets"
                  ariaLabel="Assets by class distribution donut chart"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
