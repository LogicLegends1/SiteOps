"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type ProjectFromApi = {
  projectid: number
  name: string | null
  status: string | null
}

export default function SiteEngineerActivityTrackerPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectFromApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/project", { cache: "no-store" })
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
    }

    void loadProjects()
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Activity Tracker</h2>
          <p className="mt-1 text-sm text-muted-foreground">Select a project to open its activity tracker details.</p>
        </div>
        <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading assigned projects...</CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">No assigned projects found.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <button
              key={project.projectid}
              type="button"
              onClick={() => router.push(`/project/${project.projectid}/site-progress?tab=activity-tracker`)}
              className="group rounded-3xl bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-500 p-px text-left"
            >
              <Card className="h-full rounded-[calc(1.5rem-1px)] border-0 bg-linear-to-br from-indigo-500 via-blue-500 to-cyan-400 text-white shadow-lg transition-transform duration-200 group-hover:-translate-y-1">
                <CardHeader>
                  <Badge className="w-fit bg-white/20 text-white hover:bg-white/20">Project {project.projectid}</Badge>
                  <CardTitle className="pt-3 text-xl">{project.name || "Untitled project"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/90">Open tracker board and manage activity progression.</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-white/80">
                    Status: {project.status ?? "Unknown"}
                  </p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
