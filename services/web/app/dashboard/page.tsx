"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { LayoutList, Camera, ArrowRight } from "lucide-react"
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

const siteEngineerActions = [
  {
    key: "activity-tracker",
    label: "Execution",
    title: "Activity Tracker",
    description: "Open progress boards and update task flow by project.",
    icon: LayoutList,
    href: (projectId: number | null) =>
      projectId
        ? `/project/${projectId}/site-progress?tab=activity-tracker&focus=activity-tracker`
        : "/dashboard/site-engineer/activity-tracker",
    gradient: "from-slate-950 via-indigo-950 to-cyan-950",
    accent: "from-cyan-400 to-sky-300",
  },
  {
    key: "updates-evidence",
    label: "History",
    title: "Updates & Evidence",
    description: "Review daily updates and upload proof photos from site work.",
    icon: Camera,
    href: (projectId: number | null) =>
      projectId
        ? `/project/${projectId}/site-progress?tab=updates&focus=updates`
        : "/dashboard/site-engineer/updates-evidence",
    gradient: "from-slate-950 via-orange-950 to-amber-900",
    accent: "from-amber-300 to-rose-200",
  },
] as const


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
          {siteEngineerActions.map((action) => {
            const Icon = action.icon

            return (
              <Link
                key={action.key}
                href={action.href(singleAssignedProjectId)}
                className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-border hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className={`relative flex h-full min-h-60 flex-col justify-between overflow-hidden rounded-3xl bg-linear-to-br ${action.gradient} p-6 text-white`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_32%)]" />
                  <div className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-linear-to-br ${action.accent} opacity-20 blur-3xl transition-transform duration-300 group-hover:scale-110`} />

                  <div className="relative flex items-start justify-between gap-4">
                    <Badge className="border border-white/20 bg-white/15 text-white shadow-sm backdrop-blur-sm hover:bg-white/15">
                      {action.label}
                    </Badge>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-lg backdrop-blur-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="relative space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Primary Action</p>
                      <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight">
                        {action.title}
                      </h3>
                      <p className="mt-3 max-w-sm text-sm leading-6 text-white/85">
                        {action.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-white/15 pt-4">
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
                        Open workspace
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white/95 backdrop-blur-sm transition-transform duration-200 group-hover:translate-x-1">
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
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