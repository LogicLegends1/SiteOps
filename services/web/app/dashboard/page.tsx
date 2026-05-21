"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
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

  useEffect(() => {
    void loadProjects()
  }, [loadProjects])

  return (
    <div className="h-[calc(100dvh-8rem)] min-h-96 overflow-hidden">
      <Card className="flex h-full min-h-0 flex-col overflow-hidden border-border bg-card">
        <CardHeader className="shrink-0">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-foreground text-xl">Projects</CardTitle>
            <CreateProjectDialog onCreated={loadProjects} />
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-hidden">
          <div className="flex h-full min-h-0 flex-row gap-4 overflow-hidden">
            <Card className="h-full min-w-0 w-3/5 shrink-0 overflow-hidden p-0 rounded-lg">
                  <LeafletMap
                    items={mapItems}
                    className="h-full w-full rounded-l-lg"
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

            <Card className="flex min-w-0 w-2/5 flex-col overflow-hidden rounded-lg">
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
