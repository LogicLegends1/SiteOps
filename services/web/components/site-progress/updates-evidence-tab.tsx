"use client"

import { useState, useMemo, useEffect } from "react"
import { useProjectContext } from "@/app/contexts/project-context"
import { type Activity } from "@/lib/site-data"
import { type Subtask } from "@/lib/subtasks-data"
import { issues } from "@/lib/issues-data"
import { cn } from "@/lib/utils"
import {
  Search,
  MessageSquare,
  Paperclip,
  ExternalLink,
  FileText,
  ChevronRight,
  ChevronLeft,
  Cloud,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react"

interface UpdatesEvidenceTabProps {
  activities: Activity[]
  subtasksByActivity: Record<number, Subtask[]>
}

interface Tag {
  label: string
  type: "weather" | "warning" | "danger" | "info"
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
  category: string
  status: "on-track" | "delayed" | "completed"
  progressDelta: number | null
  description: string
  images: string[]
  tags: Tag[]
  commentCount: number
  attachmentCount: number
}

const ACTIVITY_COLORS: string[] = [
  "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4", "#84cc16", "#ec4899", "#6366f1"
]

const ZONE_COLORS: Record<string, string> = {
  "Zone A": "#6366f1",
  "Zone B": "#f59e0b",
  "Zone C": "#10b981",
  "Zone D": "#3b82f6",
  "Zone E": "#8b5cf6",
}

const WEATHER_CONDITIONS: Tag[] = [
  { label: "Light Rain · 24°C", type: "weather" },
  { label: "Sunny · 28°C", type: "weather" },
  { label: "Cloudy · 26°C", type: "weather" },
  { label: "Heavy Rain · 22°C", type: "weather" },
  { label: "Partly Cloudy · 27°C", type: "weather" },
]

const SOIL_CONDITIONS: Tag[] = [
  { label: "Soft Soil", type: "warning" },
  { label: "Hard Soil", type: "info" },
  { label: "Water Seepage", type: "danger" },
  { label: "Rain Delay", type: "danger" },
  { label: "Rocky Terrain", type: "info" },
]

const PENDING_APPROVALS = [
  { id: "pa1", name: "Foundation pour – Grid A1", zone: "Foundation", color: "#6366f1", engineer: "Sunil Fernando", date: "May 23, 2026" },
  { id: "pa2", name: "Drainage line D3", zone: "Drainage", color: "#10b981", engineer: "Dulanjana Perera", date: "May 23, 2026" },
  { id: "pa3", name: "Excavation – Section B1", zone: "Earthworks", color: "#f59e0b", engineer: "Kasun Silva", date: "May 22, 2026" },
  { id: "pa4", name: "Rebar inspection – A3", zone: "Foundation", color: "#6366f1", engineer: "Sunil Fernando", date: "May 22, 2026" },
]

function getZoneColor(zone: string): string {
  for (const [key, color] of Object.entries(ZONE_COLORS)) {
    if (zone.includes(key)) return color
  }
  return "#6b7280"
}

function getActivityColor(index: number): string {
  return ACTIVITY_COLORS[index % ACTIVITY_COLORS.length]
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
    hour12: true,
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

function getCategoryFromActivity(activity: Activity): string {
  if (activity.activity) return activity.activity
  const name = activity.name.toLowerCase()
  if (name.includes("excavat") || name.includes("earth")) return "Earthworks"
  if (name.includes("foundation") || name.includes("concrete")) return "Foundation"
  if (name.includes("drain")) return "Drainage"
  if (name.includes("road") || name.includes("sub-base")) return "Road Works"
  if (name.includes("util") || name.includes("electr")) return "Utilities"
  if (name.includes("superstructure") || name.includes("structur")) return "Structural"
  return "General"
}

function buildUpdateEntries(
  activities: Activity[],
  subtasksByActivity: Record<number, Subtask[]>
): UpdateEntry[] {
  const entries: UpdateEntry[] = []
  const now = new Date()

  for (const activity of activities) {
    const category = getCategoryFromActivity(activity)
    const subtasks = subtasksByActivity[activity.zoneID] ?? []
    const totalSubtasks = subtasks.length
    const subtaskWeight = totalSubtasks > 0 ? Math.round(100 / totalSubtasks) : 0

    for (const subtask of subtasks) {
      const sortedUpdates = [...subtask.updates].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      const isOverdue = !subtask.completed && new Date(subtask.dueDate) < now

      for (let i = 0; i < sortedUpdates.length; i++) {
        const upd = sortedUpdates[i]
        const isLatestForSubtask = i === 0
        const delta = subtask.completed && isLatestForSubtask ? subtaskWeight : null
        const status: UpdateEntry["status"] = subtask.completed
          ? "completed"
          : isOverdue
          ? "delayed"
          : "on-track"

        const seed = activity.zoneID + upd.id.charCodeAt(0)
        const tags: Tag[] = [WEATHER_CONDITIONS[seed % WEATHER_CONDITIONS.length]]
        if (isOverdue) tags.push({ label: "Overdue", type: "danger" })

        entries.push({
          id: upd.id,
          time: upd.updatedAt,
          timeLabel: formatTime(upd.updatedAt),
          author: upd.updatedBy,
          role: "Site Engineer",
          activityId: activity.zoneID,
          activityName: activity.name,
          zone: activity.markerLabel || "Zone",
          category,
          status,
          progressDelta: delta,
          description: upd.description,
          images: upd.images ?? [],
          tags,
          commentCount: sortedUpdates.length,
          attachmentCount: (upd.images ?? []).length,
        })
      }
    }

    if (activity.progressUpdates?.length) {
      const sorted = [...activity.progressUpdates].sort(
        (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      )
      let prevProgress = 0
      for (const pu of sorted) {
        const isDelayed = pu.status === "PAUSED" || pu.status === "CANCELLED"
        const currentProgress = activity.progress ?? 0
        const perUpdateDelta = totalSubtasks > 0
          ? Math.round(currentProgress / Math.max(sorted.length, 1))
          : null
        const delta = isDelayed ? 0 : perUpdateDelta
        const tags: Tag[] = [WEATHER_CONDITIONS[(activity.zoneID + sorted.indexOf(pu)) % WEATHER_CONDITIONS.length]]
        if (isDelayed) tags.push({ label: "Work Paused", type: "danger" })

        entries.push({
          id: pu.id,
          time: pu.updatedAt,
          timeLabel: formatTime(pu.updatedAt),
          author: pu.updatedBy,
          role: "Site Engineer",
          activityId: activity.zoneID,
          activityName: activity.name,
          zone: activity.markerLabel || "Zone",
          category,
          status: isDelayed ? "delayed" : "on-track",
          progressDelta: delta,
          description: pu.description,
          images: pu.images ?? [],
          tags,
          commentCount: sorted.length,
          attachmentCount: (pu.images ?? []).length,
        })
        prevProgress = currentProgress
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

function getTagStyles(type: Tag["type"]): string {
  switch (type) {
    case "weather": return "bg-slate-800/60 text-slate-300 border-white/[0.05]"
    case "warning": return "bg-amber-900/30 text-amber-400 border-amber-500/10"
    case "danger": return "bg-red-900/30 text-red-400 border-red-500/10"
    case "info": return "bg-slate-700/40 text-slate-300 border-white/[0.05]"
    default: return "bg-slate-800/60 text-slate-300 border-white/[0.05]"
  }
}

function UpdateCard({ entry, isLatest = false, onImageClick }: { entry: UpdateEntry; isLatest?: boolean; onImageClick?: (src: string) => void }) {
  const avatarColor = ACTIVITY_COLORS[entry.activityId % ACTIVITY_COLORS.length]
  const maxVisibleImages = 5
  const extraImages = entry.images.length > maxVisibleImages ? entry.images.length - maxVisibleImages : 0

  return (
    <div className="relative flex gap-0 mb-3">
      {/* Left gutter: timeline node + time */}
      <div className="w-12 sm:w-18 shrink-0 flex flex-col items-center relative">
        {/* Vertical line behind everything */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-white/20" />
        {/* Node */}
        {isLatest ? (
          <div className="relative z-10 mt-4 sm:mt-5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-[#0EA5E9] bg-[#060b14] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]" />
          </div>
        ) : (
          <div className="relative z-10 mt-4 sm:mt-5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white/40 bg-[#060b14] flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white/40" />
          </div>
        )}
        {/* Time label below node */}
        <span className="text-[9px] sm:text-[10px] font-medium text-white/40 mt-1.5 tabular-nums whitespace-nowrap">{entry.timeLabel}</span>
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0 rounded-[16px] border border-white/[0.04] bg-[rgba(6,11,20,0.85)] hover:bg-[rgba(8,14,26,0.92)] hover:border-white/[0.07] transition-all duration-200 p-4 sm:p-5 group">
        {/* Card header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Left: avatar + name */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold text-white shadow-lg"
              style={{ background: avatarColor }}
            >
              {getInitials(entry.author)}
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-semibold text-white leading-tight truncate">{entry.author}</div>
              <div className="text-[12px] text-white/45">{entry.role}</div>
            </div>
          </div>

          {/* Right: progress + status + menu */}
          <div className="flex items-center gap-3 shrink-0">
            {entry.progressDelta !== null && (
              <div className="text-right">
                <div className={cn(
                  "text-[15px] font-bold leading-tight",
                  entry.progressDelta >= 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {entry.progressDelta >= 0 ? "+" : ""}{entry.progressDelta}%
                </div>
                <div className="text-[10px] text-white/40 font-medium">Progress</div>
              </div>
            )}
            <span className={cn(
              "text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap",
              entry.status === "on-track"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : entry.status === "delayed"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                : "bg-slate-500/15 text-slate-400 border border-slate-500/20"
            )}>
              {entry.status === "on-track" ? "On Track" : entry.status === "delayed" ? "Delayed" : "Completed"}
            </span>
            <button type="button" className="text-white/30 hover:text-white/70 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Activity title + zone/category */}
        <div className="mb-2.5">
          <div className="text-[15px] sm:text-[17px] font-bold text-white leading-tight">{entry.activityName}</div>
          <div className="text-[13px] text-white/40 mt-0.5">{entry.zone} • {entry.category}</div>
        </div>

        {/* Description */}
        <p className="text-[13px] sm:text-[14px] leading-[1.7] text-white/78 sm:max-w-145 mb-3">{entry.description}</p>

        {/* Metadata chips */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {entry.tags.map((tag, i) => (
              <span
                key={i}
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-[5px] rounded-full border",
                  getTagStyles(tag.type)
                )}
              >
                {tag.type === "weather" && <Cloud className="h-3 w-3 shrink-0 opacity-70" />}
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {/* Image gallery */}
        {entry.images.length > 0 && (
          <div className="flex gap-2 mb-3 flex-nowrap overflow-hidden">
            {entry.images.slice(0, maxVisibleImages).map((src, idx) => (
              <div
                key={idx}
                onClick={() => onImageClick?.(src)}
                className="relative shrink-0 w-21 h-14 sm:w-25 sm:h-17 rounded-[10px] overflow-hidden border border-white/6 cursor-pointer group/img"
              >
                <img src={src} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200" />
                {idx === maxVisibleImages - 1 && extraImages > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                    <span className="text-white text-sm font-semibold">+{extraImages}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center justify-end gap-4 text-white/35 pt-1">
          <button type="button" className="flex items-center gap-1.5 text-[12px] hover:text-blue-400 transition-colors">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{entry.commentCount}</span>
          </button>
          <button type="button" className="flex items-center gap-1.5 text-[12px] hover:text-blue-400 transition-colors">
            <Paperclip className="h-3.5 w-3.5" />
            <span>{entry.attachmentCount}</span>
          </button>
          <button type="button" className="flex items-center gap-1 text-[12px] hover:text-blue-400 transition-colors">
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function UpdatesEvidenceTab({ activities, subtasksByActivity }: UpdatesEvidenceTabProps) {
  const viewMode: "day" = "day"
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [activitySearch, setActivitySearch] = useState("")
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const DAYS_PER_PAGE = 5

  useEffect(() => {
    const styleId = "updates-evidence-scrollbar-styles"
    if (document.getElementById(styleId)) return
    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      .ue-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
      .ue-scroll::-webkit-scrollbar-track { background: transparent; }
      .ue-scroll::-webkit-scrollbar-thumb { background: rgba(14,165,233,0.15); border-radius: 4px; }
      .ue-scroll::-webkit-scrollbar-thumb:hover { background: rgba(14,165,233,0.3); }
    `
    document.head.appendChild(style)
    return () => { document.getElementById(styleId)?.remove() }
  }, [])

  const allEntries = useMemo(
    () => buildUpdateEntries(activities, subtasksByActivity),
    [activities, subtasksByActivity]
  )

  const { userName, userRole } = useProjectContext()

  const entries = useMemo(() => {
    if (userRole === "SITE_ENGINEER" && userName) {
      return allEntries.filter((e) => e.author === userName)
    }
    return allEntries
  }, [allEntries, userName, userRole])

  const groupedByDate = useMemo(() => groupByDate(entries), [entries])
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a))

  const visibleEntries = useMemo(() => {
    let filtered = entries
    if (viewMode === "day" && selectedDate) {
      filtered = groupedByDate[selectedDate] ?? []
    }
    if (selectedActivityId) {
      filtered = filtered.filter((e) => e.activityId === selectedActivityId)
    }
    return filtered
  }, [entries, groupedByDate, selectedDate, selectedActivityId])

  useEffect(() => { setCurrentPage(0) }, [selectedDate, selectedActivityId])

  const visibleGrouped = useMemo(() => groupByDate(visibleEntries), [visibleEntries])
  const visibleSortedDates = Object.keys(visibleGrouped).sort((a, b) => b.localeCompare(a))

  const totalPages = Math.ceil(visibleSortedDates.length / DAYS_PER_PAGE)
  const paginatedDates = visibleSortedDates.slice(currentPage * DAYS_PER_PAGE, (currentPage + 1) * DAYS_PER_PAGE)

  const activityUpdateCounts = useMemo(() => {
    const counts: Record<number, number> = {}
    for (const e of entries) counts[e.activityId] = (counts[e.activityId] ?? 0) + 1
    return counts
  }, [entries])

  const filteredActivities = useMemo(() => {
    const base = userRole === "SITE_ENGINEER"
      ? activities.filter((a) => (activityUpdateCounts[a.zoneID] ?? 0) > 0)
      : activities

    return base.filter((a) =>
      activitySearch.trim() === "" || a.name.toLowerCase().includes(activitySearch.toLowerCase())
    )
  }, [activities, activitySearch, activityUpdateCounts, userRole])

  const totalUpdates = entries.length
  const onTrackCount = entries.filter((e) => e.status === "on-track").length
  const delayedCount = entries.filter((e) => e.status === "delayed").length
  const totalPhotos = entries.reduce((sum, e) => sum + e.images.length, 0)
  const openIssues = issues.filter((i) => i.status !== "resolved")
  const activitiesWithUpdates = new Set(entries.map((e) => e.activityId))
  const missingActivities = activities.filter((a) => !activitiesWithUpdates.has(a.zoneID))

  const onTrackPct = totalUpdates > 0 ? Math.round((onTrackCount / totalUpdates) * 100) : 0
  const delayedPct = totalUpdates > 0 ? Math.round((delayedCount / totalUpdates) * 100) : 0

  const dateRangeLabel = sortedDates.length > 0
    ? `${formatDisplayDate(sortedDates[sortedDates.length - 1])} – ${formatDisplayDate(sortedDates[0])}`
    : ""

  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)_280px] h-auto min-h-[calc(100dvh-9rem)] md:h-[calc(100vh-200px)] md:min-h-150 rounded-[20px] overflow-hidden border border-border bg-background dark:bg-linear-to-br dark:from-[#02050B] dark:via-[#040912] dark:to-[#050B14]"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 0 80px rgba(14,165,233,0.03)" }}
    >
      {/* ===== LEFT SIDEBAR ===== */}
      <div className="border-b md:border-b-0 md:border-r border-border flex flex-col shrink-0 bg-muted/20 dark:bg-[rgba(5,8,15,0.92)] overflow-hidden">
        <div className="p-4 pb-3 shrink-0" />

        <div className="flex-1 overflow-y-auto ue-scroll">
          {/* Date list — shown in By Day mode */}
          {viewMode === "day" && (
            <div className="px-3 pb-2">
              {sortedDates.length === 0 ? (
                <p className="text-[11px] text-muted-foreground px-3 py-3">No updates yet</p>
              ) : (
                <div className="space-y-0.5">
                  {sortedDates.map((date) => {
                    const count = groupedByDate[date].length
                    const isToday = date === new Date().toISOString().split("T")[0]
                    const isSelected = selectedDate === date
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => setSelectedDate(isSelected ? null : date)}
                        className={cn(
                          "w-full text-left px-4 py-[12px] rounded-[14px] transition-all duration-150",
                          isSelected
                            ? "bg-[#0EA5E9]/12 border border-[#0EA5E9]/25 shadow-[0_0_16px_rgba(14,165,233,0.12)]"
                            : "hover:bg-white/[0.03] border border-transparent"
                        )}
                      >
                        <div className={cn("text-[13px] font-semibold leading-tight", isSelected ? "text-white" : "text-white/90")}>
                          {isToday ? `Today • ${formatDisplayDate(date)}` : formatDisplayDate(date)}
                        </div>
                        <div className={cn("text-[11px] mt-0.5", isSelected ? "text-[#0EA5E9]/80" : "text-white/35")}>
                          {count} update{count !== 1 ? "s" : ""}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Divider + Activities section */}
          <div className={cn(viewMode === "day" ? "border-t border-border" : "")}>
            <div className="px-4 pt-3 pb-2">
              <h5 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Activities</h5>
            </div>
            <div className="px-3 pb-3">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  placeholder="Search activities..."
                  value={activitySearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActivitySearch(e.target.value)}
                  className="w-full pl-9 pr-3 h-9 text-[11px] bg-background/80 dark:bg-black/30 border border-border rounded-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#0EA5E9]/40 focus:ring-1 focus:ring-[#0EA5E9]/15 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]"
                />
              </div>
              <div className="space-y-0.5">
                {filteredActivities.map((activity, idx) => {
                  const count = activityUpdateCounts[activity.zoneID] ?? 0
                  const isSelected = selectedActivityId === activity.zoneID
                  const color = getActivityColor(idx)
                  return (
                    <button
                      key={activity.zoneID}
                      type="button"
                      onClick={() => setSelectedActivityId(isSelected ? null : activity.zoneID)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-[12px] transition-all duration-150 flex items-center gap-2.5",
                        isSelected
                          ? "bg-[#0EA5E9]/10 border border-[#0EA5E9]/25 shadow-[0_0_14px_rgba(14,165,233,0.08)]"
                          : "hover:bg-white/[0.03] border border-transparent"
                      )}
                    >
                      {/* avatar removed for compact activity list */}
                      <span className={cn("flex-1 text-[12px] truncate font-medium", isSelected ? "text-[#0EA5E9]" : "text-foreground")}>
                        {activity.name}
                      </span>
                      {count > 0 && (
                        <span className="h-[20px] min-w-[20px] px-1.5 rounded-md bg-white/[0.07] text-[10px] font-semibold text-white/50 flex items-center justify-center shrink-0">
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
      </div>

      {/* ===== CENTER TIMELINE ===== */}
      <div className="min-w-0 overflow-y-auto ue-scroll p-3 sm:p-4 md:p-5 bg-muted/10 dark:bg-[rgba(3,6,12,0.5)]">
        {visibleSortedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <FileText className="h-12 w-12 opacity-15" />
            <p className="text-sm font-medium">No updates found</p>
            <p className="text-[11px] opacity-50">Updates appear here as your team submits progress</p>
          </div>
        ) : (
          <>
            {paginatedDates.map((date) => {
              const dayEntries = visibleGrouped[date]
              return (
                <div key={date} className="mb-5">
                  <div className="sticky top-0 z-10 backdrop-blur-md bg-[#030710]/90 px-5 py-2.5 rounded-[14px] border border-white/[0.05] mb-3 flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-white">
                      <DateHeading date={date} />
                    </h3>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/[0.05] text-white/45">
                      {dayEntries.length} update{dayEntries.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div>
                    {dayEntries.map((entry, idx) => (
                      <UpdateCard key={entry.id} entry={entry} isLatest={idx === 0} onImageClick={setZoomedImage} />
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 py-4 mt-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-[11px] font-medium text-white/60 hover:bg-white/[0.06] hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Newer
                </button>
                <span className="text-[10px] text-white/40 tabular-nums">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-[11px] font-medium text-white/60 hover:bg-white/[0.06] hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Older
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== RIGHT SIDEBAR ===== */}
      <div className="border-t md:border-t-0 md:border-l border-white/6 flex flex-col shrink-0 bg-[rgba(5,8,15,0.92)] overflow-hidden">
        <div className="p-4 space-y-4 overflow-y-auto ue-scroll flex-1">

          {/* Update Summary removed for Site Engineer view */}

          {/* Card 2 — Pending Approvals */}
          {userRole !== "SITE_ENGINEER" && (
            <div className="rounded-[16px] border border-white/[0.05] bg-[rgba(6,10,18,0.85)] p-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[13px] font-bold text-white">Pending Approvals</h4>
              <button type="button" className="text-[11px] text-[#0EA5E9] hover:text-[#0EA5E9]/70 transition-colors font-medium">
                View All
              </button>
            </div>
            <p className="text-[10px] text-white/35 mb-3">
              {PENDING_APPROVALS.length + 1} updates awaiting approval
            </p>
            <div className="space-y-1">
              {PENDING_APPROVALS.map((item) => (
                <div key={item.id} className="flex items-center gap-2.5 py-2 px-2.5 rounded-[10px] hover:bg-white/[0.03] transition-colors group cursor-pointer">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: item.color, boxShadow: `0 0 6px ${item.color}40` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white/90 font-medium truncate">{item.name}</p>
                    <p className="text-[9px] text-white/30 mt-0.5 truncate">
                      {item.date} • {item.engineer}
                    </p>
                  </div>
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md shrink-0"
                    style={{ background: `${item.color}18`, color: item.color }}
                  >
                    {item.zone}
                  </span>
                  <ChevronRight className="h-3 w-3 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              ))}
            </div>
            </div>
          )}

          {/* Card 3 — Missing Updates */}
          {userRole !== "SITE_ENGINEER" && (
            <div className="rounded-[16px] border border-white/[0.05] bg-[rgba(6,10,18,0.85)] p-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[13px] font-bold text-white">Missing Updates</h4>
              <button type="button" className="text-[11px] text-[#0EA5E9] hover:text-[#0EA5E9]/70 transition-colors font-medium">
                View All
              </button>
            </div>
            <p className="text-[10px] text-white/35 mb-3">
              {Math.max(missingActivities.length, 4)} activities missing updates
            </p>
            <div className="space-y-1">
              {(missingActivities.length > 0 ? missingActivities.slice(0, 4) : activities.slice(0, 4)).map((activity, idx) => {
                const color = getActivityColor(idx + 3)
                const daysArr = [2, 1, 1, 1]
                const days = daysArr[idx % daysArr.length]
                return (
                  <div key={activity.zoneID} className="flex items-center gap-2.5 py-2 px-2.5 rounded-[10px] hover:bg-white/[0.03] transition-colors group cursor-pointer">
                    {/* avatar removed from missing updates list */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white/90 font-medium truncate">{activity.name} – {activity.markerLabel || "Zone"}</p>
                      <p className="text-[9px] text-white/30 mt-0.5">No update in {days} day{days !== 1 ? "s" : ""}</p>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/10 shrink-0 whitespace-nowrap">
                      {days} day{days !== 1 ? "s" : ""}
                    </span>
                    <ChevronRight className="h-3 w-3 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              className="mt-3 text-[11px] text-[#0EA5E9] hover:text-[#38bdf8] flex items-center gap-1 transition-colors font-medium"
            >
              Explore Activity Tracker <ArrowRight className="h-3 w-3" />
            </button>
            </div>
          )}
        </div>
      </div>

      {/* Image lightbox */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-2xl font-light"
              onClick={() => setZoomedImage(null)}
            >
              ×
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed evidence"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
