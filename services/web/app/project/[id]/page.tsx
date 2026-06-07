"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import DonutChart from "@/components/charts/DonutChart"
import { equipmentStatusColorMap, workforceDisciplineColorMap, getColorFromMap } from "@/lib/colorMap"
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

type WorkforceDisciplineSummary = {
  total: number
  byDiscipline: Record<string, number>
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

function formatDisciplineLabel(value: string) {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function getTimelineRank(status?: string) {
  switch ((status || "").toUpperCase()) {
    case "COMPLETED":
      return 0
    case "IN_PROGRESS":
      return 1
    case "PENDING":
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
  const [workforceSummary, setWorkforceSummary] = useState<WorkforceDisciplineSummary | null>(null)
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
    const fetchWorkforceDisciplineSummary = async () => {
      if (!projectId) {
        setWorkforceLoading(false)
        return
      }

      try {
        setWorkforceLoading(true)
        const response = await fetch(`/api/project/${projectId}/workforce/discipline`, { cache: "no-store" })

        if (!response.ok) {
          throw new Error(`Failed to load workforce data (${response.status})`)
        }

        const payload = await response.json()
        setWorkforceSummary({
          total: Number(payload.summary?.total ?? 0),
          byDiscipline: payload.summary?.byDiscipline && typeof payload.summary.byDiscipline === "object" ? payload.summary.byDiscipline : {},
        })
      } catch (error) {
        console.error("Error fetching workforce data:", error)
        setWorkforceSummary(null)
      } finally {
        setWorkforceLoading(false)
      }
    }

    fetchWorkforceDisciplineSummary()
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
  const workforceSegments = useMemo<DonutSegment[]>(() => {
    return Object.entries(workforceSummary?.byDiscipline ?? {})
      .filter(([, value]) => Number(value) > 0)
      .sort((left, right) => Number(right[1]) - Number(left[1]))
      .map(([discipline, value]) => ({
        key: discipline,
        label: formatDisciplineLabel(discipline),
        value: Number(value),
        colorClass: getColorFromMap(workforceDisciplineColorMap, discipline, "text-zinc-400"),
      }))
  }, [workforceSummary])
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
    <div className="flex flex-col gap-6 max-w-full min-w-0">
      {/* Hero / Header */}
      <div className="grid gap-6 lg:grid-cols-1 items-start min-w-0">
        <div className="w-full min-w-0">
          <Card className="relative py-0 overflow-hidden border-border/70 bg-linear-to-br from-background via-background to-primary/5 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)] min-w-0">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
            </div>

            <div className="relative p-3 lg:p-8 min-w-0">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between min-w-0">
                <div className="flex-1 space-y-4 min-w-0">

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
                  <div className="flex flex-wrap items-center p-1 gap-4">
                  <div className="flex flex-col gap-1 rounded-2xl border border-border/70 bg-background/75 px-5 py-4 shadow-sm backdrop-blur-sm min-w-20">
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Start</p>
                    <p className="text-sm font-semibold text-foreground">{formatDate(project?.createdat)}</p>
                  </div>
                  <div className="flex flex-col gap-1 rounded-2xl border border-border/70 bg-background/75 px-5 py-4 shadow-sm backdrop-blur-sm min-w-20">
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Target</p>
                    <p className="text-sm font-semibold text-foreground">{formatDate(project?.projectdeadline)}</p>
                  </div>
                  <div className="flex flex-col gap-1 rounded-2xl border border-border/70 bg-background/75 px-5 py-4 shadow-sm backdrop-blur-sm min-w-30">
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Budget</p>
                    <p className="text-sm font-semibold text-foreground">$4.2M</p>
                  </div>
                  </div>
                </div>

                <div className="flex w-full flex-col shrink-0 sm:flex-row lg:w-auto lg:min-w-fit lg:flex-col min-w-0">
                  <div className="w-full flex-1 min-w-0">
                    {workforceLoading ? (
                      <WorkforceDonutSkeleton />
                    ) : workforceSummary?.total === 0 ? (
                      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-center text-muted-foreground mt-4">
                        No workers found.
                      </div>
                    ) : (
                      <DonutChart
                        segments={workforceSegments}
                        total={workforceSummary?.total ?? 0}
                        centerLabel="Workers"
                        ariaLabel="Workforce discipline distribution donut chart"
                      />
                    )}
                  </div>
                  <div className="w-full flex-1 min-w-0">
                    {equipmentClassLoading ? (
                      <WorkforceDonutSkeleton />
                    ) : equipmentClassTotal === 0 ? (
                      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-center text-muted-foreground mt-4">
                        No assets found.
                      </div>
                    ) : (
                      <DonutChart
                        segments={equipmentClassSegments}
                        total={equipmentClassTotal}
                        centerLabel="Assets"
                        ariaLabel="Assets by class distribution donut chart"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Activity Timeline</CardTitle>
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
                          const isHovered = (pinnedActivityId ?? hoveredActivityId) === activity.activityid
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
                    className="fixed z-100 w-80 -translate-x-1/2 -translate-y-full rounded-xl border border-border bg-card p-3 shadow-2xl"
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
    </div>
  )
}
