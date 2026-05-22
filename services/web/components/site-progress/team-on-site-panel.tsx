"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Users, MapPin } from "lucide-react"

export type OnSiteMember = {
  id: string
  name: string
  initials: string
  role: string
  status: "online" | "away" | "offline"
  location: string
}

interface TeamOnSitePanelProps {
  projectId: number
}

function statusBadgeClass(status: OnSiteMember["status"]) {
  switch (status) {
    case "online":
      return "bg-primary/20 text-primary border-primary/30"
    case "away":
      return "bg-warning/20 text-warning border-warning/30"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function TeamOnSitePanel({ projectId }: TeamOnSitePanelProps) {
  const [members, setMembers] = useState<OnSiteMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/project/${projectId}/workforce/on-site`, {
          cache: "no-store",
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to load team")
        if (!cancelled) setMembers(data.members ?? [])
      } catch (e) {
        if (!cancelled) {
          setMembers([])
          setError(e instanceof Error ? e.message : "Failed to load team")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [projectId])

  const online = members.filter((m) => m.status === "online").length
  const away = members.filter((m) => m.status === "away").length

  return (
    <Card className="bg-card border-border flex-1 flex flex-col min-h-0 overflow-hidden">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Team On Site
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {loading ? "Loading..." : `${online} online, ${away} away`}
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-2 pt-0 min-h-0">
        {error && (
          <p className="text-xs text-muted-foreground text-center py-4">{error}</p>
        )}
        {!loading && !error && members.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            No workers found for this project
          </p>
        )}
        {members.map((member) => (
          <div
            key={member.id}
            className="rounded-lg border border-border bg-secondary/20 p-3 space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                {member.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
              <Badge
                variant="outline"
                className={cn("text-[10px] capitalize shrink-0", statusBadgeClass(member.status))}
              >
                {member.status}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-12">
              <MapPin className="h-3 w-3 shrink-0 text-primary" />
              <span className="truncate">{member.location}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
