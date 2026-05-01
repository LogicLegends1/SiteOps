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
  locationlongitude: number | null
  locationlatitude: number | null
  projectdiagram?: string | null
  status: string | null
}

const mapProjectsToMapItems = (projects: ProjectFromApi[]): LeafletMapItem[] =>
  projects
    .filter((p) => typeof p.locationlatitude === "number" && typeof p.locationlongitude === "number")
    .map((p) => ({
      id: p.projectid,
      title: p.name ?? "Untitled project",
      lng: p.locationlongitude as number,
      lat: p.locationlatitude as number,
      description: p.status ?? "Unknown",
      tooltip: `Project ID: ${p.projectid}`,
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
    }),
    []
  )

  const [projects, setProjects] = useState<LeafletMapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetch('/api/project')
      .then(async (res) => {
        const json = await res.json().catch(() => ({}))
        if (!mounted) return
        if (!res.ok) {
          setError(json?.error ?? 'Failed to load projects')
          setProjects([])
        } else {
          setProjects(mapProjectsToMapItems(json.projects ?? []))
          setError(null)
        }
      })
      .catch(() => {
        if (!mounted) return
        setError('Failed to load projects')
        setProjects([])
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="h-[calc(100dvh-8rem)] min-h-96 overflow-hidden">
      <Card className="flex h-full min-h-0 flex-col overflow-hidden border-border bg-card">
        <CardHeader className="shrink-0">
          <CardTitle className="text-foreground text-xl">Projects</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-hidden">
          <div className="flex h-full min-h-0 flex-row gap-4 overflow-hidden">
            <Card className="h-full max-h-full max-w-full aspect-square shrink overflow-hidden p-0">
              <LeafletMap
                items={projects}
                className="h-full"
                mapClassName="h-full"
                mapOptions={mapOptions}
                markerOptions={{
                  getTooltipContent: createProjectTooltip,
                  tooltipPermanent: false,
                  tooltipDirection: "top",
                  tooltipOffset: [0, -12],
                }}
                onMarkerClick={({ item }) => {
                  router.push(`/project/${item.id}`)
                }}
              />
            </Card>

            <Card className="flex min-w-0 flex-1 flex-col overflow-hidden">
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
                        const status = project.description ?? "Unknown"

                        return (
                          <Item
                            key={project.id}
                            asChild
                            variant="outline"
                            size="sm"
                          >
                            <button
                              type="button"
                              className="w-full cursor-pointer text-left"
                              onClick={() => router.push(`/project/${project.id}`)}
                            >
                              <ItemContent>
                                <ItemHeader>
                                  <ItemTitle>{project.title || "Untitled project"}</ItemTitle>
                                  <Badge variant="outline">{status}</Badge>
                                </ItemHeader>
                                <ItemDescription>Project ID: {project.id}</ItemDescription>
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
