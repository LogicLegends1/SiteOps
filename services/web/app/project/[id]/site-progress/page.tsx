"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { ActivityDetailsPanel } from "@/components/site-progress/activity-details-panel"
import { ActivitiesOverviewPanel } from "@/components/site-progress/activities-overview-panel"
import { TeamOnSitePanel } from "@/components/site-progress/team-on-site-panel"
import { AddActivityModal } from "@/components/site-progress/add-activity-modal"
import { type Activity, type Project } from "@/lib/site-data"
import { type Subtask, calculateProgressFromSubtasks } from "@/lib/subtasks-data"

const LeafletMap = dynamic(
  () => import("@/components/site-progress/leaflet-map").then((mod) => ({ default: mod.LeafletMap })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-card border border-border rounded-lg min-h-[420px] flex items-center justify-center text-muted-foreground">
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

      await fetchSubtasks()

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
    async (activityId: number, subtaskId: string, description: string) => {
      try {
        const res = await fetch(`/api/subtask/${subtaskId}/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to save update")

        setSubtasksByActivity((prev) => ({
          ...prev,
          [activityId]: (prev[activityId] ?? []).map((s) => {
            if (s.id !== subtaskId) return s
            return {
              ...s,
              updates: [data.log, ...s.updates],
            }
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

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Site Progress Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time observability of all construction activities
          </p>
        </div>
        <AddActivityModal
          projectId={projectId}
          onActivityAdded={(newActivity) => {
            setActivities((prev) => [...prev, newActivity])
            setSubtasksByActivity((prev) => ({ ...prev, [newActivity.zoneID]: [] }))
            setSelectedActivity(newActivity)
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-4 items-stretch min-h-[420px]">
        <div className="min-h-[420px] h-full">
          <LeafletMap
            activities={activities}
            project={project}
            loading={loading}
            onActivitySelect={setSelectedActivity}
            selectedActivityId={selectedActivity?.zoneID}
            className="h-full min-h-[420px]"
          />
        </div>

        <div className="flex flex-col gap-4 min-h-[420px] h-full">
          <ActivitiesOverviewPanel
            activities={activities}
            subtasksByActivity={subtasksByActivity}
            selectedActivityId={selectedActivity?.zoneID}
            onActivitySelect={setSelectedActivity}
          />
          <TeamOnSitePanel projectId={projectId} />
        </div>
      </div>

      <ActivityDetailsPanel
        activity={selectedActivity}
        subtasks={selectedSubtasks}
        progressPercent={
          selectedActivity
            ? calculateProgressFromSubtasks(selectedSubtasks)
            : 0
        }
        onToggleSubtask={(subtaskId) => {
          if (selectedActivity) handleToggleSubtask(selectedActivity.zoneID, subtaskId)
        }}
        onSubtaskUpdate={(subtaskId, description) => {
          if (selectedActivity) {
            handleSubtaskUpdate(selectedActivity.zoneID, subtaskId, description)
          }
        }}
        onUpdateSubmitted={fetchProjectAndActivities}
      />
    </div>
  )
}
