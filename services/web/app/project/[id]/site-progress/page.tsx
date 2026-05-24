"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { ActivityDetailsPanel } from "@/components/site-progress/activity-details-panel"
import { LinearActivitiesBoard } from "@/components/site-progress/linear-activities-board"
import { AddActivityModal } from "@/components/site-progress/add-activity-modal"
import { UpdatesEvidenceTab } from "@/components/site-progress/updates-evidence-tab"
import { type Activity, type ActivityStatus, type Project } from "@/lib/site-data"
import { type Subtask, calculateProgressFromSubtasks } from "@/lib/subtasks-data"
import type { OnSiteMember } from "@/lib/site-team-types"
import type { ActivityWorkersSummary } from "@/components/site-progress/leaflet-map"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { MapPin, LayoutList, FileText, AlertTriangle, X } from "lucide-react"
import { createClient } from "@/lib/superbase"

export interface ActivityWorkerDetail {
  id: number
  name: string
  role: string
  discipline: string
  experience: number
  teamName: string | null
  isAvailable: boolean
}

const LeafletMap = dynamic(
  () => import("@/components/site-progress/leaflet-map").then((mod) => ({ default: mod.LeafletMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest bg-card">
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
  const [userRole, setUserRole] = useState<string | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [subtasksByActivity, setSubtasksByActivity] = useState<Record<number, Subtask[]>>({})
  const [teamMembers, setTeamMembers] = useState<OnSiteMember[]>([])
  const [teamLoading, setTeamLoading] = useState(true)
  const [teamError, setTeamError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("map-view")
  const [showAddModal, setShowAddModal] = useState(false)
  const [activityWorkersCache, setActivityWorkersCache] = useState<Record<number, ActivityWorkersSummary>>({})
  const [activityWorkersDetail, setActivityWorkersDetail] = useState<Record<number, ActivityWorkerDetail[]>>({})
  const [userRoleLoaded, setUserRoleLoaded] = useState(false)

  const engineerByActivity = useMemo(() => {
    const map: Record<number, string> = {}
    for (const [actId, workers] of Object.entries(activityWorkersDetail)) {
      const eng = workers.find((w) => w.role === "Site Engineer")
      if (eng) map[Number(actId)] = eng.name
    }
    return map
  }, [activityWorkersDetail])
  const [detailsTab, setDetailsTab] = useState<string | undefined>(undefined)
  const canSeeAdvancedTabs = userRoleLoaded && userRole !== "SITE_ENGINEER"

  useEffect(() => {
    const fetchRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user?.email) {
        setUserRoleLoaded(true)
        return
      }

      const { data: dbUser } = await supabase
        .from("user")
        .select("role")
        .eq("email", user.email)
        .maybeSingle()

      setUserRole(dbUser?.role ?? null)
      setUserRoleLoaded(true)
    }

    fetchRole()
  }, [])

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

  async function fetchAllActivityWorkers(zones: Activity[]) {
    const summaryCache: Record<number, ActivityWorkersSummary> = {}
    const detailCache: Record<number, ActivityWorkerDetail[]> = {}

    await Promise.all(
      zones.map(async (activity) => {
        try {
          const res = await fetch(`/api/project/${projectId}/activity/${activity.zoneID}/workers`, { cache: "no-store" })
          if (!res.ok) return
          const data = await res.json()
          summaryCache[activity.zoneID] = { roleCounts: data.roleCounts ?? {}, total: data.total ?? 0 }
          detailCache[activity.zoneID] = data.workers ?? []
        } catch {
          // silently skip
        }
      })
    )

    setActivityWorkersCache(summaryCache)
    setActivityWorkersDetail(detailCache)
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

      // Fetch workers for all activities
      fetchAllActivityWorkers(zones)

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

  const handleStatusChange = useCallback(
    async (activityId: number, newStatus: ActivityStatus) => {
      setActivities((prev) =>
        prev.map((a) => (a.zoneID === activityId ? { ...a, status: newStatus } : a))
      )
      setSelectedActivity((prev) =>
        prev?.zoneID === activityId ? { ...prev, status: newStatus } : prev
      )

      try {
        await fetch(`/api/project/${projectId}/zones/${activityId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
      } catch (error) {
        console.error("Status update error:", error)
        fetchProjectAndActivities()
      }
    },
    [projectId]
  )

  const selectedSubtasks = selectedActivity
    ? subtasksByActivity[selectedActivity.zoneID] ?? []
    : []


  return (
    <div className="flex flex-col gap-4 w-full pb-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Site Progress Tracking</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor site progress, activities, issues, and workforce in real time.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-secondary/30 border border-border p-1 h-auto">
          <TabsTrigger value="map-view" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2">
            <MapPin className="h-4 w-4" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="activity-tracker" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2">
            <LayoutList className="h-4 w-4" />
            Activity Tracker
          </TabsTrigger>
          {canSeeAdvancedTabs && (
            <TabsTrigger value="updates" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2">
              <FileText className="h-4 w-4" />
              Updates & Evidence
            </TabsTrigger>
          )}
          {canSeeAdvancedTabs && (
            <TabsTrigger value="issues" className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2">
              <AlertTriangle className="h-4 w-4" />
              Issues & Risks
            </TabsTrigger>
          )}
        </TabsList>

        {/* Map View */}
        <TabsContent value="map-view" className="mt-4">
          <div className="h-150 rounded-xl border border-border overflow-hidden">
            <LeafletMap
              activities={activities}
              project={project}
              loading={loading}
              onActivitySelect={(a) => {
                setSelectedActivity(a)
                setDetailsTab(undefined)
              }}
              onViewInTracker={(a) => {
                setSelectedActivity(a)
                setActiveTab("activity-tracker")
              }}
              selectedActivityId={selectedActivity?.zoneID}
              subtasksByActivity={subtasksByActivity}
              activityWorkersCache={activityWorkersCache}
              engineerByActivity={engineerByActivity}
              onViewPeople={(a) => {
                setSelectedActivity(a)
                setDetailsTab("people")
              }}
              className="h-full rounded-none border-0"
            />
          </div>
        </TabsContent>

        {/* Activity Tracker */}
        <TabsContent value="activity-tracker" className="mt-4">
          <div className="h-[calc(100vh-220px)] min-h-125 rounded-xl border border-border overflow-hidden">
            <LinearActivitiesBoard
              activities={activities}
              subtasksByActivity={subtasksByActivity}
              onActivitySelect={() => {}}
              selectedActivityId={selectedActivity?.zoneID}
              activityWorkersDetail={activityWorkersDetail}
              onViewOnMap={(activity) => {
                setSelectedActivity(activity)
                setActiveTab("map-view")
              }}
              onAddActivity={canSeeAdvancedTabs ? () => setShowAddModal(true) : undefined}
              onStatusChange={handleStatusChange}
              onToggleSubtask={handleToggleSubtask}
              onSubtaskUpdate={(activityId, subtaskId, description, evidencePhotoUrl) =>
                handleSubtaskUpdate(activityId, subtaskId, description, evidencePhotoUrl)
              }
            />
          </div>
        </TabsContent>

        {/* Updates & Evidence */}
        {canSeeAdvancedTabs && (
          <TabsContent value="updates" className="mt-4">
            <UpdatesEvidenceTab activities={activities} subtasksByActivity={subtasksByActivity} />
          </TabsContent>
        )}

        {/* Issues & Risks – placeholder */}
        {canSeeAdvancedTabs && (
          <TabsContent value="issues" className="mt-4">
            <div className="h-100 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-xl gap-2">
              <AlertTriangle className="h-10 w-10 opacity-30" />
              <p className="text-sm">Issues & Risks coming soon</p>
            </div>
          </TabsContent>
        )}

      </Tabs>

      <AddActivityModal
        projectId={projectId}
        project={project}
        externalOpen={showAddModal}
        onExternalOpenChange={setShowAddModal}
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
  )
}
