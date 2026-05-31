"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ClipboardEdit, History } from "lucide-react"
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
    key: "log-progress",
    label: "Action Required",
    title: "Log Daily Execution",
    description: "Update site progress, report crew/machinery status, and submit field labor requests.",
    icon: ClipboardEdit,
    buttonText: "Update progress",
    href: (projectId: number | null) =>
      projectId
        ? `/project/${projectId}/site-progress?tab=activity-tracker&focus=activity-tracker`
        : "/dashboard/site-engineer/activity-tracker",
  },
  {
    key: "submission-history",
    label: "History",
    title: "Submission History",
    description: "Review past field updates, submitted issues, and uploaded photo evidence.",
    icon: History,
    buttonText: "View history",
    href: (projectId: number | null) =>
      projectId
        ? `/project/${projectId}/site-progress?tab=updates&focus=updates`
        : "/dashboard/site-engineer/updates-evidence",
  },
] as const


export default function DashboardPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
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
          .select("role, username")
          .eq("email", user.email)
          .maybeSingle()

        if (isMounted) {
          setUserRole(dbUser?.role ?? null)
          setUserName(dbUser?.username || user.email.split("@")[0] || null)
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
    const greetingName = userName 
      ? userName.charAt(0).toUpperCase() + userName.slice(1) 
      : "Engineer"

    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-8">
        <div className="border-b border-neutral-900 pb-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Hello, {greetingName}</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Select a workspace to start logging daily execution.
          </p>
        </div>

        <div className="grid gap-3.5 md:grid-cols-2">
          {siteEngineerActions.map((action) => {
            const Icon = action.icon

            return (
              <Link
                key={action.key}
                href={action.href(singleAssignedProjectId)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                      {action.label}
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-black">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="text-lg font-bold tracking-tight text-neutral-950">
                      {action.title}
                    </h3>
                    <p className="text-xs font-medium leading-relaxed text-neutral-500">
                      {action.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex w-full items-center justify-between rounded-lg bg-black px-4 py-2.5 text-white transition-colors hover:bg-neutral-800">
                  <span className="text-[13px] font-semibold">
                    {action.buttonText}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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