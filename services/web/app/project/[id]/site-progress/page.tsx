"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { ActivityDetailsPanel } from "@/components/site-progress/activity-details-panel"
import { ActivitiesOverviewPanel } from "@/components/site-progress/activities-overview-panel"
import { TeamOnSitePanel } from "@/components/site-progress/team-on-site-panel"
import { SiteProgressKpiStrip } from "@/components/site-progress/site-progress-kpi-strip"
import { AddActivityModal } from "@/components/site-progress/add-activity-modal"
import { type Activity, type Project } from "@/lib/site-data"
import { type Subtask, calculateProgressFromSubtasks } from "@/lib/subtasks-data"
import type { OnSiteMember } from "@/lib/site-team-types"
import { MapPin, Maximize2 } from "lucide-react"

/** Matches equipment map row — fits ~5 list items per sidebar panel without scrolling */
const MAP_ROW_HEIGHT = "h-[680px]"

const LeafletMap = dynamic(
  () => import("@/components/site-progress/leaflet-map").then((mod) => ({ default: mod.LeafletMap })),
  {
    ssr: false,
    loading: () => (
      <div
        className={`bg-card border border-border rounded-xl ${MAP_ROW_HEIGHT} flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest`}
      >
        Loading map...
      </div>
    ),
  }
)

function normalizeSubtasksByActivity(
  raw: Record<string, Subtask[]> | Record<number, Subtask[]> | undefined
): Record<number, Subtask[]> {
  if (!raw) return {}
  const result: Record<number, Subtask[]> = {}
  for (const [key, value] of Object.entries(raw)) {
    result[Number(key)] = value
  }
  return result
}

export default function ActivityProgressPage() {
  const params = useParams()
  const projectId = Number(params.id) || 1

  const [activities, setActivities] = useState<Activity[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [subtasksByActivity, setSubtasksByActivity] = useState<Record<number, Subtask[]>>({})
  const [teamMembers, setTeamMembers] = useState<OnSiteMember[]>([])
  const [teamLoading, setTeamLoading] = useState(true)
  const [teamError, setTeamError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchSubtasks() {
    try {
      const res = await fetch(`/api/project/${projectId}/subtasks`, { cache: "no-store" })
      const data = await res.json()
      if (res.ok) {
        setSubtasksByActivity(normalizeSubtasksByActivity(data.subtasksByActivity))
      }
    } catch (error) {
      console.error("Error fetching subtasks:", error)
    }
  }

  async function fetchTeamOnSite() {
    try {
      setTeamLoading(true)
      setTeamError(null)
      const res = await fetch(`/api/project/${projectId}/workforce/on-site`, { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load team")
      setTeamMembers(data.members ?? [])
    } catch (e) {
      setTeamMembers([])
      setTeamError(e instanceof Error ? e.message : "Failed to load team")
    } finally {
      setTeamLoading(false)
    }
  }

  async function fetchProjectAndActivities() {
    try {
      setLoading(true)

      const projectRes = await fetch(`/api/project/${projectId}`, { cache: "no-store" })
      if (projectRes.ok) {
        const projectData = await projectRes.json()
        setProject(projectData.project)
      }

      const activitiesRes = await fetch(`/api/project/${projectId}/zones`, { cache: "no-store" })
      const activitiesData = await activitiesRes.json()

      if (!activitiesRes.ok) {
        throw new Error(activitiesData.error || "Failed to fetch activities")
      }

      const zones: Activity[] = activitiesData.zones || []
      setActivities(zones)

      await Promise.all([fetchSubtasks(), fetchTeamOnSite()])

      if (selectedActivity) {
        const updated = zones.find((a) => a.zoneID === selectedActivity.zoneID)
        setSelectedActivity(updated ?? null)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectAndActivities()
  }, [projectId])

  const handleToggleSubtask = useCallback(
    async (activityId: number, subtaskId: string) => {
      const list = subtasksByActivity[activityId]
      const subtask = list?.find((s) => s.id === subtaskId)
      if (!subtask) return

      const nextCompleted = !subtask.completed

      setSubtasksByActivity((prev) => ({
        ...prev,
        [activityId]: (prev[activityId] ?? []).map((s) =>
          s.id === subtaskId ? { ...s, completed: nextCompleted } : s
        ),
      }))

      try {
        const res = await fetch(`/api/subtask/${subtaskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: nextCompleted }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to update subtask")

        if (data.activity?.progress != null) {
          setActivities((prev) =>
            prev.map((a) =>
              a.zoneID === activityId ? { ...a, progress: data.activity.progress } : a
            )
          )
          setSelectedActivity((prev) =>
            prev?.zoneID === activityId ? { ...prev, progress: data.activity.progress } : prev
          )
        }

        await fetchSubtasks()
      } catch (error) {
        console.error("Toggle subtask error:", error)
        await fetchSubtasks()
      }
    },
    [subtasksByActivity]
  )

  const handleSubtaskUpdate = useCallback(
    async (
      activityId: number,
      subtaskId: string,
      description: string,
      evidencePhotoUrl?: string
    ) => {
      try {
        const res = await fetch(`/api/subtask/${subtaskId}/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description,
            evidencePhoto: evidencePhotoUrl ?? null,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to save update")

        setSubtasksByActivity((prev) => ({
          ...prev,
          [activityId]: (prev[activityId] ?? []).map((s) => {
            if (s.id !== subtaskId) return s
            return { ...s, updates: [data.log, ...s.updates] }
          }),
        }))
      } catch (error) {
        console.error("Subtask update error:", error)
      }
    },
    []
  )

  const selectedSubtasks = selectedActivity
    ? subtasksByActivity[selectedActivity.zoneID] ?? []
    : []

  const teamOnline = teamMembers.filter((m) => m.status === "online").length

  return (
    <div className="flex flex-col gap-5 w-full pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Site Progress Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live map, activity progress by subtasks, and workforce placement
          </p>
        </div>
        <AddActivityModal
          projectId={projectId}
          project={project}
          onActivityAdded={(newActivity, subtasks = []) => {
            if (newActivity.lat != null && newActivity.lng != null) {
              setActivities((prev) => [...prev, newActivity as Activity])
            }
            setSubtasksByActivity((prev) => ({
              ...prev,
              [newActivity.zoneID]: subtasks,
            }))
            setSelectedActivity(newActivity as Activity)
            fetchSubtasks()
          }}
        />
      </div>

      <SiteProgressKpiStrip
        activities={activities}
        subtasksByActivity={subtasksByActivity}
        teamOnline={teamOnline}
        teamTotal={teamMembers.length}
      />

      <div
        className={`grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-4 ${MAP_ROW_HEIGHT}`}
      >
        <div className={`flex flex-col min-h-0 ${MAP_ROW_HEIGHT}`}>
          <div className="flex items-center justify-between px-4 py-2.5 border border-b-0 border-border rounded-t-xl bg-card shrink-0">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Site Map
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Cyan pin = selected activity · click any pin to inspect
              </p>
            </div>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Maximize2 className="h-3 w-3" />
              {activities.length} on map
            </span>
          </div>
          <div className="flex-1 min-h-0 rounded-b-xl overflow-hidden border border-border">
            <LeafletMap
              activities={activities}
              project={project}
              loading={loading}
              onActivitySelect={setSelectedActivity}
              selectedActivityId={selectedActivity?.zoneID}
              className="h-full rounded-none border-0"
            />
          </div>
        </div>

        <div className={`flex flex-col gap-3 min-h-0 ${MAP_ROW_HEIGHT}`}>
          <div className="h-[58%] min-h-0 shrink-0">
            <ActivitiesOverviewPanel
              activities={activities}
              subtasksByActivity={subtasksByActivity}
              selectedActivityId={selectedActivity?.zoneID}
              onActivitySelect={setSelectedActivity}
            />
          </div>
          <div className="h-[42%] min-h-0 shrink-0">
            <TeamOnSitePanel
              members={teamMembers}
              loading={teamLoading}
              error={teamError}
            />
          </div>
        </div>
      </div>

      <ActivityDetailsPanel
        activity={selectedActivity}
        subtasks={selectedSubtasks}
        progressPercent={
          selectedActivity ? calculateProgressFromSubtasks(selectedSubtasks) : 0
        }
        onToggleSubtask={(subtaskId) => {
          if (selectedActivity) handleToggleSubtask(selectedActivity.zoneID, subtaskId)
        }}
        onSubtaskUpdate={(subtaskId, description, evidencePhotoUrl) => {
          if (selectedActivity) {
            handleSubtaskUpdate(
              selectedActivity.zoneID,
              subtaskId,
              description,
              evidencePhotoUrl
            )
          }
        }}
        onUpdateSubmitted={fetchProjectAndActivities}
      />
    </div>
  )
}
