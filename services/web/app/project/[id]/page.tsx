"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useMemo, useState } from "react"

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

export default function ProjectPage() {
  const params = useParams<{ id?: string }>()
  const projectId = params.id
  const [activities, setActivities] = useState<Activity[]>([])
  const [project, setProject] = useState<ProjectRecord | null>(null)
  const [hoveredActivityId, setHoveredActivityId] = useState<number | null>(null)
  const [hoverPopup, setHoverPopup] = useState<{ x: number; y: number } | null>(null)

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
      } catch (error) {
        console.error("Error fetching project data:", error)
      }
    }

    fetchProjectData()
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
  const hoveredActivity = timelineActivities.find((activity) => activity.activityid === hoveredActivityId) ?? timelineActivities[0] ?? null
  const pendingActivities = timelineActivities
    .filter((activity) => activity.status?.toUpperCase() === "PENDING")
    .sort((left, right) => left.progress - right.progress || (left.activityid ?? 0) - (right.activityid ?? 0))
  const inProgressActivities = timelineActivities
    .filter((activity) => activity.status?.toUpperCase() === "IN_PROGRESS")
    .sort((left, right) => left.progress - right.progress || (left.activityid ?? 0) - (right.activityid ?? 0))
  const completedActivities = timelineActivities
    .filter((activity) => activity.status?.toUpperCase() === "COMPLETED")
    .sort((left, right) => left.progress - right.progress || (left.activityid ?? 0) - (right.activityid ?? 0))

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

                <div className="grid gap-3 sm:grid-cols-3 xl:min-w-90">
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
                    <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500" />Pending</span>
                    <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />In progress</span>
                    <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success" />Completed</span>
                  </div>
                </div>

                <div className="relative overflow-visible pb-6">
                  <div className="overflow-x-auto overflow-y-visible pb-24">
                    <div className="min-w-225 relative pt-12">
                    <div className="absolute left-8 right-8 top-14 h-0.5 rounded-full bg-border" />

                    <div className="flex items-start justify-between gap-6 px-6">
                      {timelineActivities.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No activities available for this project</div>
                      ) : (
                        timelineActivities.map((activity, index) => {
                          const isHovered = hoveredActivityId === activity.activityid || (!hoveredActivityId && index === 0)
                          const currentStatus = activity.status?.toUpperCase()
                          const dotColor = currentStatus === "COMPLETED" ? "bg-success" : currentStatus === "IN_PROGRESS" ? "bg-primary" : "bg-green-500"

                          return (
                            <button
                              key={activity.activityid}
                              type="button"
                              onMouseEnter={(event) => {
                                const rect = event.currentTarget.getBoundingClientRect()
                                setHoveredActivityId(activity.activityid)
                                setHoverPopup({
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                })
                              }}
                              onFocus={(event) => {
                                const rect = event.currentTarget.getBoundingClientRect()
                                setHoveredActivityId(activity.activityid)
                                setHoverPopup({
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                })
                              }}
                              onMouseLeave={() => {
                                setHoveredActivityId(null)
                                setHoverPopup(null)
                              }}
                              onBlur={() => {
                                setHoveredActivityId(null)
                                setHoverPopup(null)
                              }}
                              className="relative flex w-28 flex-col items-center outline-none"
                            >
                              <span
                                className={`relative z-10 h-5 w-5 rounded-full border-4 border-background shadow-md transition-transform ${dotColor} ${isHovered ? "scale-125 ring-4 ring-primary/25" : ""}`}
                              />
                              <span className="mt-3 text-center text-xs font-medium text-foreground line-clamp-2">
                                {activity.name || activity.description || `Activity ${activity.activityid}`}
                              </span>
                              <span className="mt-1 text-center text-[11px] text-muted-foreground">
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
                    className="pointer-events-none fixed z-100 w-64 -translate-x-1/2 -translate-y-full rounded-xl border border-border bg-card p-2 shadow-2xl"
                    style={{ left: hoverPopup.x, top: hoverPopup.y - 12 }}
                  >
                    <div className="relative h-32 w-full overflow-hidden rounded-lg bg-muted">
                      {hoveredActivity.imageurl ? (
                        <Image
                          src={hoveredActivity.imageurl}
                          alt={hoveredActivity.name || hoveredActivity.description || "Activity image"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-medium text-foreground">{hoveredActivity.name || hoveredActivity.description || `Activity ${hoveredActivity.activityid}`}</span>
                      <span className="text-muted-foreground">{hoveredActivity.progress}%</span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{formatProjectStatus(hoveredActivity.status)}</div>
                  </div>
                )}
              </div>

            </div>
          </Card>
        </div>
      </div>

      {/* Panels: Alerts */}
      <div className="flex justify-start">
        <Card className="bg-card border-border w-full lg:w-1/2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>Site notifications and issues</CardDescription>
            </div>
            <Badge variant="destructive">3 Open</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {activeIssues.map((issue) => (
                <div key={issue.id} className="p-3 rounded-lg border border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">{issue.title}</div>
                      <div className="text-xs text-muted-foreground">{issue.owner} • {issue.id}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge className={getPriorityColor(issue.priority)} variant="secondary">{issue.priority}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">{issue.status}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
