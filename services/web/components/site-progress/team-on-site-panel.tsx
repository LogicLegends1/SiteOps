"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Users, MapPin } from "lucide-react"
import type { OnSiteMember } from "@/lib/site-team-types"

interface TeamOnSitePanelProps {
  members: OnSiteMember[]
  loading?: boolean
  error?: string | null
}

function statusBadgeClass(status: OnSiteMember["status"]) {
  switch (status) {
    case "online":
      return "bg-primary/15 text-primary border-primary/30"
    case "away":
      return "bg-warning/15 text-warning border-warning/30"
    default:
      return "bg-muted/50 text-muted-foreground"
  }
}

function statusDot(status: OnSiteMember["status"]) {
  switch (status) {
    case "online":
      return "bg-primary shadow-[0_0_6px_hsl(var(--primary))]"
    case "away":
      return "bg-warning"
    default:
      return "bg-muted-foreground"
  }
}

export function TeamOnSitePanel({ members, loading, error }: TeamOnSitePanelProps) {
  const online = members.filter((m) => m.status === "online").length
  const away = members.filter((m) => m.status === "away").length

  return (
    <div className="flex flex-col h-full min-h-0 bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border shrink-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-primary" />
          Team On Site
        </h3>
        <p className="text-[10px] text-muted-foreground mt-1">
          {loading
            ? "Loading roster..."
            : `${online} on assignment · ${away} unavailable`}
        </p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
        {error && (
          <p className="text-xs text-muted-foreground text-center py-6">{error}</p>
        )}
        {!loading && !error && members.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">
            No workers linked to teams for this project
          </p>
        )}
        {members.map((member) => (
          <div
            key={member.id}
            className="rounded-lg border border-border/80 bg-secondary/15 px-2.5 py-2 hover:bg-secondary/25 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                {member.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-foreground truncate">{member.name}</p>
                  <span
                    className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusDot(member.status))}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{member.role}</p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] h-5 px-1.5 capitalize shrink-0",
                  statusBadgeClass(member.status)
                )}
              >
                {member.status}
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-1 pl-[42px] text-[10px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 text-primary/80" />
              <span className="truncate">{member.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
