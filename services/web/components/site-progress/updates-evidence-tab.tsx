"use client"

import { useState, useMemo } from "react"
import { type Activity } from "@/lib/site-data"
import { type Subtask } from "@/lib/subtasks-data"
import { issues } from "@/lib/issues-data"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Search,
  MessageSquare,
  Paperclip,
  ExternalLink,
  AlertTriangle,
  FileText,
  ChevronRight,
  Cloud,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react"

interface UpdatesEvidenceTabProps {
  activities: Activity[]
  subtasksByActivity: Record<number, Subtask[]>
}

interface UpdateEntry {
  id: string
  time: string
  timeLabel: string
  author: string
  role: string
  activityId: number
  activityName: string
  zone: string
  status: "on-track" | "delayed" | "completed"
  progressDelta: number | null
  description: string
  images: string[]
  tags: string[]
}

const ZONE_COLORS: Record<string, string> = {
  "Zone A": "#6366f1",
  "Zone B": "#f59e0b",
  "Zone C": "#10b981",
  "Zone D": "#3b82f6",
  "Zone E": "#8b5cf6",
}

const WEATHER_CONDITIONS = [
  "Light Rain · 24°C",
  "Sunny · 28°C",
  "Cloudy · 26°C",
  "Heavy Rain · 22°C",
  "Partly Cloudy · 27°C",
]

const PENDING_APPROVALS = [
  { id: "pa1", name: "Foundation pour – Grid A1", zone: "Foundation", color: "#6366f1", engineer: "Kasun Silva" },
  { id: "pa2", name: "Drainage line D3", zone: "Drainage", color: "#10b981", engineer: "Sunil Fernando" },
  { id: "pa3", name: "Excavation – Section B1", zone: "Earthworks", color: "#f59e0b", engineer: "Kasun Silva" },
  { id: "pa4", name: "Rebar inspection – A3", zone: "Foundation", color: "#6366f1", engineer: "Sunil Fernando" },
]

function getZoneColor(zone: string): string {
  for (const [key, color] of Object.entries(ZONE_COLORS)) {
    if (zone.includes(key)) return color
  }
  return "#6b7280"
}

function formatDisplayDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function groupByDate(entries: UpdateEntry[]): Record<string, UpdateEntry[]> {
  const groups: Record<string, UpdateEntry[]> = {}
  for (const entry of entries) {
    const date = entry.time.split("T")[0]
    if (!groups[date]) groups[date] = []
    groups[date].push(entry)
  }
  return groups
}

function buildUpdateEntries(
  activities: Activity[],
  subtasksByActivity: Record<number, Subtask[]>
): UpdateEntry[] {
  const entries: UpdateEntry[] = []

  for (const activity of activities) {
    const subtasks = subtasksByActivity[activity.zoneID] ?? []
    for (const subtask of subtasks) {
      for (const upd of subtask.updates) {
        entries.push({
          id: upd.id,
          time: upd.updatedAt,
          timeLabel: formatTime(upd.updatedAt),
          author: upd.updatedBy,
          role: "Site Engineer",
          activityId: activity.zoneID,
          activityName: activity.name,
          zone: activity.markerLabel || "Zone",
          status: "on-track",
          progressDelta: Math.floor(Math.random() * 15) + 3,
          description: upd.description,
          images: upd.images ?? [],
          tags: [WEATHER_CONDITIONS[(activity.zoneID + upd.id.charCodeAt(0)) % WEATHER_CONDITIONS.length]],
        })
      }
    }

    if (activity.progressUpdates?.length) {
      for (const pu of activity.progressUpdates) {
        entries.push({
          id: pu.id,
          time: pu.updatedAt,
          timeLabel: formatTime(pu.updatedAt),
          author: pu.updatedBy,
          role: "Site Engineer",
          activityId: activity.zoneID,
          activityName: activity.name,
          zone: activity.markerLabel || "Zone",
          status:
            pu.status === "PAUSED" || pu.status === "CANCELLED" ? "delayed" : "on-track",
          progressDelta: null,
          description: pu.description,
          images: pu.images ?? [],
          tags: [],
        })
      }
    }
  }

  return entries.sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  )
}

function DateHeading({ date }: { date: string }) {
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
  const label =
    date === today
      ? `Today • ${formatDisplayDate(date)}`
      : date === yesterday
      ? `Yesterday • ${formatDisplayDate(date)}`
      : formatDisplayDate(date)
  return <>{label}</>
}

function UpdateCard({ entry }: { entry: UpdateEntry }) {
  const avatarColor = ["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"][entry.activityId % 5]
  return (
    <div className="px-5 py-4 hover:bg-secondary/10 transition-colors border-b border-border/40 last:border-0">
      <div className="flex items-start gap-3">
        {/* Time + timeline dot */}
        <div className="flex flex-col items-center shrink-0 pt-1 w-14">
          <span className="text-[10px] text-muted-foreground font-mono leading-none">{entry.timeLabel}</span>
          <div className="mt-1.5 w-2 h-2 rounded-full bg-primary/60 ring-2 ring-primary/20" />
        </div>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white"
          style={{ background: avatarColor }}
        >
          {getInitials(entry.author)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-foreground">{entry.author}</span>
                <span className="text-[10px] text-muted-foreground">{entry.role}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                <span className="text-xs font-medium text-foreground">{entry.activityName}</span>
                <span className="text-muted-foreground text-xs">·</span>
                <span className="text-[11px] text-muted-foreground">{entry.zone}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {entry.progressDelta !== null && (
                <span
                  className={cn(
                    "text-xs font-bold px-1.5 py-0.5 rounded",
                    entry.progressDelta >= 0
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  )}
                >
                  {entry.progressDelta >= 0 ? "+" : ""}{entry.progressDelta}%
                </span>
              )}
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] h-5 px-2",
                  entry.status === "on-track"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : entry.status === "delayed"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {entry.status === "on-track" ? "On Track" : entry.status === "delayed" ? "Delayed" : "Completed"}
              </Badge>
              <button type="button" className="text-muted-foreground hover:text-foreground ml-1">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{entry.description}</p>

          {/* Weather + extra tags */}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {entry.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground border border-border/50"
                >
                  {i === 0 && <Cloud className="h-2.5 w-2.5 shrink-0" />}
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Images — all shown horizontally */}
          {entry.images.length > 0 && (
            <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">
              {entry.images.map((src, idx) => (
                <a
                  key={idx}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-20 h-14 rounded-lg overflow-hidden border border-border shrink-0 hover:opacity-90 transition-opacity"
                >
                  <img src={src} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center gap-4 mt-2.5">
            <button type="button" className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              <MessageSquare className="h-3 w-3" />
              <span>2</span>
            </button>
            <button type="button" className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              <Paperclip className="h-3 w-3" />
              <span>{entry.images.length}</span>
            </button>
            <button type="button" className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function UpdatesEvidenceTab({ activities, subtasksByActivity }: UpdatesEvidenceTabProps) {
  const [viewMode, setViewMode] = useState<"day" | "activity">("day")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [activitySearch, setActivitySearch] = useState("")
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null)

  const allEntries = useMemo(
    () => buildUpdateEntries(activities, subtasksByActivity),
    [activities, subtasksByActivity]
  )

  const groupedByDate = useMemo(() => groupByDate(allEntries), [allEntries])
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a))

  const visibleEntries = useMemo(() => {
    if (viewMode === "day") {
      return selectedDate ? groupedByDate[selectedDate] ?? [] : allEntries
    }
    return selectedActivityId
      ? allEntries.filter((e) => e.activityId === selectedActivityId)
      : allEntries
  }, [allEntries, groupedByDate, selectedDate, selectedActivityId, viewMode])

  const visibleGrouped = useMemo(() => groupByDate(visibleEntries), [visibleEntries])
  const visibleSortedDates = Object.keys(visibleGrouped).sort((a, b) => b.localeCompare(a))

  const activityUpdateCounts = useMemo(() => {
    const counts: Record<number, number> = {}
    for (const e of allEntries) counts[e.activityId] = (counts[e.activityId] ?? 0) + 1
    return counts
  }, [allEntries])

  const filteredActivities = activities.filter(
    (a) =>
      activitySearch.trim() === "" ||
      a.name.toLowerCase().includes(activitySearch.toLowerCase())
  )

  const totalUpdates = allEntries.length
  const onTrackCount = allEntries.filter((e) => e.status === "on-track").length
  const delayedCount = allEntries.filter((e) => e.status === "delayed").length
  const totalPhotos = allEntries.reduce((sum, e) => sum + e.images.length, 0)
  const openIssues = issues.filter((i) => i.status !== "resolved")
  const activitiesWithUpdates = new Set(allEntries.map((e) => e.activityId))
  const missingActivities = activities.filter((a) => !activitiesWithUpdates.has(a.zoneID))

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px] rounded-xl border border-border overflow-hidden bg-card">
      {/* Left sidebar */}
      <div className="w-[210px] border-r border-border flex flex-col shrink-0">
        {/* Toggle */}
        <div className="p-3 border-b border-border shrink-0">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("day")}
              className={cn(
                "flex-1 text-xs py-1.5 font-medium transition-colors",
                viewMode === "day"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary/40"
              )}
            >
              By Day
            </button>
            <button
              type="button"
              onClick={() => setViewMode("activity")}
              className={cn(
                "flex-1 text-xs py-1.5 font-medium transition-colors border-l border-border",
                viewMode === "activity"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary/40"
              )}
            >
              By Activity
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Date section */}
          <div className="p-2 space-y-0.5">
            {sortedDates.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 py-1">No updates yet</p>
            ) : (
              sortedDates.map((date) => {
                const count = groupedByDate[date].length
                const isToday = date === new Date().toISOString().split("T")[0]
                const isSelected = viewMode === "day" && selectedDate === date
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      if (viewMode === "day") {
                        setSelectedDate(isSelected ? null : date)
                      }
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between gap-2",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : viewMode === "day"
                        ? "hover:bg-secondary/40 text-foreground"
                        : "text-foreground/50 cursor-default"
                    )}
                  >
                    <span className="font-medium truncate">
                      {isToday ? `Today \u2022 ${formatDisplayDate(date)}` : formatDisplayDate(date)}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] shrink-0",
                        isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })
            )}
          </div>

          {/* Divider + Activities section */}
          <div className="border-t border-border mt-1 pt-2 px-2">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider px-1 mb-2">
              Activities
            </p>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="pl-7 h-7 text-xs bg-secondary/20"
              />
            </div>
            <div className="space-y-0.5">
              {filteredActivities.map((activity) => {
                const count = activityUpdateCounts[activity.zoneID] ?? 0
                const isSelected = viewMode === "activity" && selectedActivityId === activity.zoneID
                const color = getZoneColor(activity.markerLabel || activity.name)
                return (
                  <button
                    key={activity.zoneID}
                    type="button"
                    onClick={() => {
                      if (viewMode === "activity") {
                        setSelectedActivityId(isSelected ? null : activity.zoneID)
                      }
                    }}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2",
                      isSelected
                        ? "bg-primary/10 border border-primary/30"
                        : viewMode === "activity"
                        ? "hover:bg-secondary/40 border border-transparent"
                        : "border border-transparent opacity-60 cursor-default"
                    )}
                  >
                    <span
                      className="w-4 h-4 rounded shrink-0 flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {(activity.markerLabel || activity.name).charAt(0)}
                    </span>
                    <span className={cn("flex-1 truncate", isSelected ? "text-primary font-medium" : "text-foreground")}>
                      {activity.name}
                    </span>
                    {count > 0 && (
                      <span className="h-4 min-w-[16px] px-1 rounded-sm bg-secondary text-[9px] font-medium text-muted-foreground flex items-center justify-center shrink-0">
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Center feed */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {visibleSortedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <FileText className="h-10 w-10 opacity-30" />
            <p className="text-sm">No updates found</p>
            <p className="text-xs opacity-70">
              Updates appear here as your team submits progress
            </p>
          </div>
        ) : (
          visibleSortedDates.map((date) => {
            const dayEntries = visibleGrouped[date]
            return (
              <div key={date}>
                <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm px-5 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    <DateHeading date={date} />
                  </h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {dayEntries.length} update{dayEntries.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="divide-y divide-border/50">
                  {dayEntries.map((entry) => (
                    <UpdateCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Right sidebar */}
      <div className="w-[270px] border-l border-border overflow-y-auto shrink-0">
        {/* Update Summary */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Update Summary
            </h4>
            <button type="button" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
              View Full Summary <ArrowRight className="h-2.5 w-2.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-secondary/30 rounded-lg p-2.5">
              <div className="text-lg font-bold text-foreground">{totalUpdates}</div>
              <div className="text-[10px] text-muted-foreground">Total Updates</div>
            </div>
            <div className="bg-emerald-500/10 rounded-lg p-2.5">
              <div className="text-lg font-bold text-emerald-400">{onTrackCount}</div>
              <div className="text-[10px] text-muted-foreground">On Track</div>
            </div>
            <div className="bg-amber-500/10 rounded-lg p-2.5">
              <div className="text-lg font-bold text-amber-400">{delayedCount}</div>
              <div className="text-[10px] text-muted-foreground">Delayed</div>
            </div>
            <div className="bg-red-500/10 rounded-lg p-2.5">
              <div className="text-lg font-bold text-red-400">{openIssues.length}</div>
              <div className="text-[10px] text-muted-foreground">Issues Raised</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-2.5">
              <div className="text-lg font-bold text-foreground">{totalPhotos}</div>
              <div className="text-[10px] text-muted-foreground">Photos</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-2.5">
              <div className="text-lg font-bold text-foreground">18</div>
              <div className="text-[10px] text-muted-foreground">Documents</div>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Pending Approvals
            </h4>
            <button type="button" className="text-[10px] text-primary hover:underline">
              View All
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">
            {PENDING_APPROVALS.length} updates awaiting approval
          </p>
          <div className="space-y-2">
            {PENDING_APPROVALS.map((item) => (
              <div key={item.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-secondary/20 transition-colors group">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{item.name}</p>
                  <span
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                    style={{ background: `${item.color}22`, color: item.color }}
                  >
                    {item.zone}
                  </span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Missing Updates */}
        {missingActivities.length > 0 && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Missing Updates
              </h4>
              <button type="button" className="text-[10px] text-primary hover:underline">
                View All
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">
              {missingActivities.length} activities missing updates
            </p>
            <div className="space-y-2">
              {missingActivities.slice(0, 4).map((activity) => (
                <div key={activity.zoneID} className="flex items-center justify-between gap-2">
                  <p className="text-xs text-foreground truncate flex-1">{activity.name}</p>
                  <Badge className="text-[9px] bg-orange-500/15 text-orange-400 border-orange-500/30 shrink-0 h-4 px-1.5">
                    {Math.floor(Math.random() * 3) + 1}d
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open Issues */}
        {openIssues.length > 0 && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Open Issues
              </h4>
              <span className="text-[10px] text-muted-foreground">{openIssues.length}</span>
            </div>
            <div className="space-y-2">
              {openIssues.slice(0, 4).map((issue) => (
                <div key={issue.id} className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{issue.title}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {issue.priority} priority
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explore Activity Tracker CTA */}
        <div className="p-4">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors"
          >
            Explore Activity Tracker
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
