"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useParams, useSearchParams } from "next/navigation"
import { ActivityDetailsPanel } from "@/components/site-progress/activity-details-panel"
import { LinearActivitiesBoard } from "@/components/site-progress/linear-activities-board"
import { AddActivityModal } from "@/components/site-progress/add-activity-modal"
import { UpdatesEvidenceTab } from "@/components/site-progress/updates-evidence-tab"
import { IssuesRisksTab } from "@/components/site-progress/issues-risks-tab"
import { type Activity, type ActivityStatus, type Project } from "@/lib/site-data"
import { type Subtask, calculateProgressFromSubtasks } from "@/lib/subtasks-data"
import type { OnSiteMember } from "@/lib/site-team-types"
import type { ActivityWorkersSummary } from "@/components/site-progress/leaflet-map"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
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

function getInitialTab(focusedView: string | null, requestedTab: string | null) {
  if (focusedView === "activity-tracker" || focusedView === "updates") {
    return focusedView
  }

  if (
    requestedTab === "map-view" ||
    requestedTab === "activity-tracker" ||
    requestedTab === "updates" ||
    requestedTab === "issues"
  ) {
    return requestedTab
  }

  return "map-view"
}

export default function ActivityProgressPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = Number(params.id) || 1
  const focusedView = searchParams.get("focus")
  const requestedTab = searchParams.get("tab")
  const isActivityFocus = focusedView === "activity-tracker"
  const isUpdatesFocus = focusedView === "updates"
  const hasFocusedView = isActivityFocus || isUpdatesFocus
  const initialTab = getInitialTab(focusedView, requestedTab)

  const [activities, setActivities] = useState<Activity[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [subtasksByActivity, setSubtasksByActivity] = useState<Record<number, Subtask[]>>({})
  const [teamMembers, setTeamMembers] = useState<OnSiteMember[]>([])
  const [teamLoading, setTeamLoading] = useState(true)
  const [teamError, setTeamError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(initialTab)
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
      photoUrls: string[] = []
    ) => {
      try {
        const res = await fetch(`/api/subtask/${subtaskId}/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description, photoUrls }),
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

  if (loading && !project) {
    return (
      <div className="flex min-h-[calc(100dvh-9rem)] w-full items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
          <Spinner className="h-5 w-5" />
          <span className="text-sm text-muted-foreground">Loading site progress...</span>
        </div>
      </div>
    )
  }


  return (
    <div className="flex flex-col gap-4 w-full pb-4 md:pb-8 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {!hasFocusedView && (
          <div className="border-b border-border">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("map-view")}
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === "map-view" ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground"}`}
              >
                Map View
              </button>
              <button
                onClick={() => setActiveTab("activity-tracker")}
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === "activity-tracker" ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground"}`}
              >
                Activity Tracker
              </button>
              <button
                onClick={() => setActiveTab("updates")}
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === "updates" ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground"}`}
              >
                Updates & Evidence
              </button>
              <button
                onClick={() => setActiveTab("issues")}
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === "issues" ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground"}`}
              >
                Issues & Risks
              </button>
            </div>
          </div>
        )}

        {/* Map View */}
        {!hasFocusedView && (
          <TabsContent value="map-view" className="mt-0">
          <div className="h-[calc(100vh-120px)] rounded-xl border border-border overflow-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
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
              onViewIssues={() => {
                setActiveTab("issues")
              }}
              onViewPeople={(a) => {
                setSelectedActivity(a)
                setDetailsTab("people")
              }}
              className="h-full rounded-none border-0"
            />
          </div>
          </TabsContent>
        )}

        {/* Activity Tracker */}
        {(!hasFocusedView || isActivityFocus) && (
          <TabsContent value="activity-tracker" className={hasFocusedView ? "mt-0" : "mt-4"}>
          <div className={`rounded-xl border border-border overflow-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent ${hasFocusedView ? "h-[calc(100dvh-8.5rem)] min-h-104" : "h-[calc(100dvh-14rem)] min-h-104 md:h-[calc(100vh-220px)] md:min-h-125"}`}>
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
              onSubtaskUpdate={(activityId, subtaskId, description, photoUrls) =>
                handleSubtaskUpdate(activityId, subtaskId, description, photoUrls)
              }
            />
          </div>
          </TabsContent>
        )}

        {/* Updates & Evidence */}
        {(!hasFocusedView || isUpdatesFocus) && (
          <TabsContent value="updates" className={hasFocusedView ? "mt-0" : "mt-4"}>
          <div className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            <UpdatesEvidenceTab activities={activities} subtasksByActivity={subtasksByActivity} />
          </div>
          </TabsContent>
        )}

        {/* Issues & Risks */}
        {!hasFocusedView && (
          <TabsContent value="issues" className="mt-4">
          <IssuesRisksTab activities={activities} />
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
