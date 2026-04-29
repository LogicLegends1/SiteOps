"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { ActivityDetailsPanel } from "@/components/site-progress/activity-details-panel"
import { AddActivityModal } from "@/components/site-progress/add-activity-modal"
import { type Activity, type Project } from "@/lib/site-data"

const LeafletMap = dynamic(() => import("@/components/site-progress/leaflet-map").then(mod => ({ default: mod.LeafletMap })), {
  ssr: false,
  loading: () => <div className="bg-card border-border rounded-lg p-4 h-96 flex items-center justify-center text-muted-foreground">Loading map...</div>,
})

export default function ActivityProgressPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)

  const projectId = 1

  async function fetchProjectAndActivities() {
    try {
      setLoading(true)

      // Fetch project details
      const projectRes = await fetch(`/api/project/${projectId}`, {
        cache: "no-store",
      })

      if (!projectRes.ok) {
        const projectData = await projectRes.json()
        console.error("Failed to fetch project:", projectData.error)
      } else {
        const projectData = await projectRes.json()
        setProject(projectData.project)
      }

      // Fetch activities
      const activitiesRes = await fetch(`/api/project/${projectId}/zones`, {
        cache: "no-store",
      })

      const activitiesData = await activitiesRes.json()

      if (!activitiesRes.ok) {
        throw new Error(activitiesData.error || "Failed to fetch activities")
      }

      setActivities(activitiesData.zones || [])

      if (selectedActivity) {
        const updatedSelectedActivity = (activitiesData.zones || []).find(
          (activity: Activity) => activity.zoneID === selectedActivity.zoneID
        )
        setSelectedActivity(updatedSelectedActivity || null)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectAndActivities()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Activity Progress</h1>
        <AddActivityModal projectId={projectId} onActivityAdded={(newActivity) => {
          setActivities([...activities, newActivity])
        }} />
      </div>

      <div className="flex flex-col gap-6">
        <div className="w-full">
          <LeafletMap
            activities={activities}
            project={project}
            loading={loading}
            onActivitySelect={setSelectedActivity}
            selectedActivityId={selectedActivity?.zoneID}
          />
        </div>

        <div className="w-full">
          <ActivityDetailsPanel activity={selectedActivity} onUpdateSubmitted={fetchProjectAndActivities} />
        </div>
      </div>
    </div>
  )
}