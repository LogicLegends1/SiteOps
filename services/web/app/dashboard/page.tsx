"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { LayoutList, Camera } from "lucide-react"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import dynamic from "next/dynamic"
import type { LeafletMapItem } from "@/components/ui/leaflet-map"
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog"
import { createClient } from "@/lib/superbase"

const LeafletMap = dynamic(
  () => import("@/components/ui/leaflet-map").then((mod) => ({ default: mod.LeafletMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 w-full items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
        Loading map...
      </div>
    ),
  }
)

type ProjectFromApi = {
  projectid: number
  name: string | null
  locationlongitude: number | string | null
  locationlatitude: number | string | null
  projectdiagram?: string | null
  status: string | null
}

const mapProjectsToMapItems = (projects: ProjectFromApi[]): LeafletMapItem[] =>
  [...projects]
    .sort((a, b) => a.projectid - b.projectid)
    .map((p) => {
      // some backends store coordinates as strings — coerce to numbers when possible
      const lat =
        typeof p.locationlatitude === "number"
          ? p.locationlatitude
          : typeof p.locationlatitude === "string" && p.locationlatitude.trim() !== ""
          ? Number(p.locationlatitude)
          : null

      const lng =
        typeof p.locationlongitude === "number"
          ? p.locationlongitude
          : typeof p.locationlongitude === "string" && p.locationlongitude.trim() !== ""
          ? Number(p.locationlongitude)
          : null

      return {
        raw: p,
        lat: Number.isFinite(lat as number) ? (lat as number) : null,
        lng: Number.isFinite(lng as number) ? (lng as number) : null,
      }
    })
    .filter((x) => x.lat !== null && x.lng !== null)
    .map((x) => ({
      id: x.raw.projectid,
      title: x.raw.name ?? "Untitled project",
      lng: x.lng as number,
      lat: x.lat as number,
      description: x.raw.status ?? "Unknown",
      tooltip: `Project ID: ${x.raw.projectid}`,
    }))


export default function DashboardPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userRoleLoaded, setUserRoleLoaded] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchRole = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user?.email || !isMounted) {
          setUserRole(null)
          return
        }

        const { data: dbUser } = await supabase
          .from("user")
          .select("role")
          .eq("email", user.email)
          .maybeSingle()

        if (isMounted) {
          setUserRole(dbUser?.role ?? null)
        }
      } catch {
        if (isMounted) {
          setUserRole(null)
        }
      } finally {
        if (isMounted) {
          setUserRoleLoaded(true)
        }
      }
    }

    fetchRole()

    return () => {
      isMounted = false
    }
  }, [])

  const createProjectTooltip = useCallback((item: LeafletMapItem) => {
    const status = item.description ?? "Unknown"

    const container = document.createElement("div")
    container.className = "bg-background/90 rounded"

    const title = document.createElement("div")
    title.className = "font-semibold text-sm text-foreground"
    title.textContent = item.title ?? "Untitled project"

    const id = document.createElement("div")
    id.className = "text-xs text-muted-foreground mt-1"
    id.textContent = `Project ID: ${item.id}`

    const statusLine = document.createElement("div")
    statusLine.className = "text-xs text-muted-foreground"
    statusLine.textContent = `Status: ${status}`

    container.append(title, id, statusLine)
    return container
  }, [])

  const mapOptions = useMemo(
    () => ({
      center: [7.0, 80.3] as [number, number],
      zoom: 7,
      autoFitToMarkers: true,
      fitPadding: [60, 60] as [number, number],
      maxZoom: 19,
      scrollWheelZoom: true,
      zoomControl: true,
      enableBoxSelection: true,
    }),
    []
  )

  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([])

  const [projects, setProjects] = useState<ProjectFromApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = useCallback(async () => {
    setLoading(true)

    try {
      const res = await fetch("/api/project")
      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(json?.error ?? "Failed to load projects")
        setProjects([])
        return
      }

      const sortedProjects = (json.projects ?? []).slice().sort((a: ProjectFromApi, b: ProjectFromApi) => {
        return a.projectid - b.projectid
      })

      setProjects(sortedProjects)
      setError(null)
    } catch {
      setError("Failed to load projects")
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  const mapItems = useMemo(() => mapProjectsToMapItems(projects), [projects])
  const singleAssignedProjectId = projects.length === 1 ? projects[0]?.projectid : null

  useEffect(() => {
    void loadProjects()
  }, [loadProjects])

  if (!userRoleLoaded) {
    return (
      <div className="min-h-[calc(100dvh-8rem)]">
        <Card className="border-border bg-card">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Loading dashboard...
          </CardContent>
        </Card>
      </div>
    )
  }

  if (userRole === "SITE_ENGINEER") {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Site Engineer Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a workspace to continue with focused execution tasks.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href={
              singleAssignedProjectId
                ? `/project/${singleAssignedProjectId}/site-progress?tab=activity-tracker&focus=activity-tracker`
                : "/dashboard/site-engineer/activity-tracker"
            }
            className="group rounded-3xl bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-500 p-px"
          >
            <div className="h-full rounded-[calc(1.5rem-1px)] bg-linear-to-br from-indigo-500 via-blue-500 to-cyan-400 p-6 text-white shadow-lg transition-transform duration-200 group-hover:-translate-y-1">
              <div className="mb-10 flex items-center justify-between">
                <Badge className="bg-white/20 text-white hover:bg-white/20">Execution</Badge>
                <LayoutList className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Primary Action</p>
              <h3 className="mt-2 text-2xl font-bold leading-tight">Activity Tracker</h3>
              <p className="mt-3 text-sm text-white/90">Open progress boards and update task flow by project.</p>
            </div>
          </Link>

          <Link
            href={
              singleAssignedProjectId
                ? `/project/${singleAssignedProjectId}/site-progress?tab=updates&focus=updates`
                : "/dashboard/site-engineer/updates-evidence"
            }
            className="group rounded-3xl bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 p-px"
          >
            <div className="h-full rounded-[calc(1.5rem-1px)] bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 p-6 text-white shadow-lg transition-transform duration-200 group-hover:-translate-y-1">
              <div className="mb-10 flex items-center justify-between">
                <Badge className="bg-white/20 text-white hover:bg-white/20">Reporting</Badge>
                <Camera className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Primary Action</p>
              <h3 className="mt-2 text-2xl font-bold leading-tight">Updates &amp; Evidence</h3>
              <p className="mt-3 text-sm text-white/90">Post daily updates and upload on-site proof photos.</p>
            </div>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100dvh-8rem)] overflow-hidden">
      <Card className="flex h-full min-h-0 flex-col overflow-hidden border-border bg-card">
        <CardHeader className="shrink-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-foreground text-xl">Projects</CardTitle>
            <CreateProjectDialog onCreated={loadProjects} />
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
          <div className="flex min-h-0 flex-col gap-4 overflow-visible lg:h-full lg:flex-row lg:overflow-hidden">
            <Card className="h-[55vh] min-h-90 min-w-0 overflow-hidden rounded-lg p-0 sm:h-[60vh] lg:h-[calc(100vh-12rem)] lg:w-3/5 lg:shrink-0">
                  <LeafletMap
                    items={mapItems}
                    className="h-full w-full rounded-lg lg:rounded-l-lg"
                    mapClassName="h-full w-full"
                    mapOptions={mapOptions}
                    markerOptions={{
                      selectedItemId: selectedProjectIds[0] ?? undefined,
                      getTooltipContent: createProjectTooltip,
                      tooltipPermanent: false,
                      tooltipDirection: "top",
                      tooltipOffset: [0, -12],
                    }}
                    enableBoxSelection
                    onSelection={(ids) => {
                      // ids are marker ids (same as project ids)
                      const numeric = ids.map((i) => Number(i))
                      setSelectedProjectIds(numeric)
                    }}
                    onMarkerClick={({ item }) => {
                      router.push(`/project/${item.id}`)
                    }}
                  />
            </Card>

            <Card className="flex min-w-0 flex-col overflow-hidden rounded-lg lg:h-[calc(100vh-12rem)] lg:w-2/5">
              <CardHeader className="shrink-0 border-b border-border pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">Project List</CardTitle>
                  <Badge variant="secondary">{projects.length}</Badge>
                </div>
              </CardHeader>

              <CardContent className="min-h-0 flex-1 p-0">
                <ScrollArea className="h-full">
                  {loading ? (
                    <div className="p-4 text-sm text-muted-foreground">Loading projects…</div>
                  ) : error ? (
                    <Empty className="border-none">
                      <EmptyHeader>
                        <EmptyTitle>Error</EmptyTitle>
                        <EmptyDescription>{error}</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : projects.length === 0 ? (
                    <Empty className="border-none">
                      <EmptyHeader>
                        <EmptyTitle>No projects found</EmptyTitle>
                        <EmptyDescription>
                          There are no projects to display.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <ItemGroup className="gap-2 p-2">
                      {projects.map((project) => {
                        const status = project.status ?? "Unknown"

                        return (
                          <Item
                            key={project.projectid}
                            asChild
                            variant={selectedProjectIds.includes(project.projectid) ? "muted" : "outline"}
                            size="sm"
                          >
                            <button
                              type="button"
                              className="w-full cursor-pointer text-left"
                              onClick={() => router.push(`/project/${project.projectid}`)}
                            >
                              <ItemContent>
                                <ItemHeader>
                                  <ItemTitle>{project.name || "Untitled project"}</ItemTitle>
                                  <Badge variant="outline">{status}</Badge>
                                </ItemHeader>
                                <ItemDescription>Project ID: {project.projectid}</ItemDescription>
                              </ItemContent>
                            </button>
                          </Item>
                        )
                      })}
                    </ItemGroup>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}