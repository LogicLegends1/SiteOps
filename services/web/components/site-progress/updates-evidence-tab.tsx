"use client"

import { useState, useMemo, useEffect } from "react"
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

  for (const activity of activities) {
    const category = getCategoryFromActivity(activity)
    const subtasks = subtasksByActivity[activity.zoneID] ?? []
    for (const subtask of subtasks) {
      for (const upd of subtask.updates) {
        const seed = activity.zoneID + upd.id.charCodeAt(0)
        const weatherTag = WEATHER_CONDITIONS[seed % WEATHER_CONDITIONS.length]
        const soilTag = SOIL_CONDITIONS[seed % SOIL_CONDITIONS.length]
        const tags: Tag[] = [weatherTag]
        if (seed % 3 !== 0) tags.push(soilTag)
        const delta = ((seed * 7) % 20) - 3
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
          status: delta < 0 ? "delayed" : "on-track",
          progressDelta: delta,
          description: upd.description,
          images: upd.images ?? [],
          tags,
          commentCount: (seed % 4) + 1,
          attachmentCount: (upd.images ?? []).length + (seed % 3),
        })
      }
    }

    if (activity.progressUpdates?.length) {
      for (const pu of activity.progressUpdates) {
        const seed = activity.zoneID + pu.id.charCodeAt(0)
        const isDelayed = pu.status === "PAUSED" || pu.status === "CANCELLED"
        const delta = isDelayed ? -((seed % 8) + 1) : (seed % 15) + 2
        const tags: Tag[] = [WEATHER_CONDITIONS[seed % WEATHER_CONDITIONS.length]]
        if (isDelayed) tags.push({ label: "Rain Delay", type: "danger" })
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
          commentCount: (seed % 5) + 1,
          attachmentCount: (pu.images ?? []).length + 1,
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

function getTagStyles(type: Tag["type"]): string {
  switch (type) {
    case "weather": return "bg-slate-800/60 text-slate-300 border-white/[0.05]"
    case "warning": return "bg-amber-900/30 text-amber-400 border-amber-500/10"
    case "danger": return "bg-red-900/30 text-red-400 border-red-500/10"
    case "info": return "bg-slate-700/40 text-slate-300 border-white/[0.05]"
    default: return "bg-slate-800/60 text-slate-300 border-white/[0.05]"
  }
}

function UpdateCard({ entry }: { entry: UpdateEntry }) {
  const avatarColor = ACTIVITY_COLORS[entry.activityId % ACTIVITY_COLORS.length]
  const maxVisibleImages = 3
  const extraImages = entry.images.length > maxVisibleImages ? entry.images.length - maxVisibleImages : 0

  return (
    <div className="relative flex gap-0 mb-3">
      {/* Left gutter: time + timeline */}
      <div className="w-[80px] shrink-0 flex flex-col items-center pt-5 relative">
        <span className="text-[11px] font-semibold text-white/50 mb-2 tabular-nums">{entry.timeLabel}</span>
        <div className="w-[10px] h-[10px] rounded-full bg-[#0EA5E9] shadow-[0_0_10px_rgba(14,165,233,0.5)] ring-[3px] ring-[#0a1628] z-10" />
        <div className="flex-1 w-px bg-gradient-to-b from-[#0EA5E9]/30 via-[#0EA5E9]/10 to-transparent mt-1" />
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0 rounded-[16px] border border-white/[0.04] bg-[rgba(6,11,20,0.85)] hover:bg-[rgba(8,14,26,0.92)] hover:border-white/[0.07] transition-all duration-200 p-5 group">
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
          <div className="text-[17px] font-bold text-white leading-tight">{entry.activityName}</div>
          <div className="text-[13px] text-white/40 mt-0.5">{entry.zone} • {entry.category}</div>
        </div>

        {/* Description */}
        <p className="text-[14px] leading-[1.7] text-white/[0.78] max-w-[580px] mb-3">{entry.description}</p>

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
                className="relative shrink-0 w-[80px] h-[56px] rounded-[10px] overflow-hidden border border-white/[0.06] cursor-pointer group/img"
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
  const [viewMode, setViewMode] = useState<"day" | "activity">("day")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [activitySearch, setActivitySearch] = useState("")
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null)

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

  const groupedByDate = useMemo(() => groupByDate(allEntries), [allEntries])
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a))

  const visibleEntries = useMemo(() => {
    let filtered = allEntries
    if (viewMode === "day" && selectedDate) {
      filtered = groupedByDate[selectedDate] ?? []
    }
    if (selectedActivityId) {
      filtered = filtered.filter((e) => e.activityId === selectedActivityId)
    }
    return filtered
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

  const onTrackPct = totalUpdates > 0 ? Math.round((onTrackCount / totalUpdates) * 100) : 0
  const delayedPct = totalUpdates > 0 ? Math.round((delayedCount / totalUpdates) * 100) : 0

  const dateRangeLabel = sortedDates.length > 0
    ? `${formatDisplayDate(sortedDates[sortedDates.length - 1])} – ${formatDisplayDate(sortedDates[0])}`
    : ""

  return (
    <div className="grid grid-cols-[300px_minmax(0,1fr)_340px] h-[calc(100vh-200px)] min-h-[600px] rounded-[20px] overflow-hidden bg-gradient-to-br from-[#02050B] via-[#040912] to-[#050B14] border border-white/[0.06]"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 0 80px rgba(14,165,233,0.03)" }}
    >
      {/* ===== LEFT SIDEBAR ===== */}
      <div className="border-r border-white/[0.06] flex flex-col shrink-0 bg-[rgba(5,8,15,0.92)] overflow-hidden">
        {/* Toggle */}
        <div className="p-4 pb-3 shrink-0">
          <div className="flex rounded-[12px] border border-white/[0.08] overflow-hidden bg-black/30">
            <button
              type="button"
              onClick={() => { setViewMode("day"); setSelectedActivityId(null) }}
              className={cn(
                "flex-1 text-[12px] py-2.5 font-semibold transition-all duration-200",
                viewMode === "day"
                  ? "bg-[#0EA5E9] text-white shadow-[0_0_12px_rgba(14,165,233,0.3)]"
                  : "text-white/45 hover:text-white/70 hover:bg-white/[0.04]"
              )}
            >
              By Day
            </button>
            <button
              type="button"
              onClick={() => { setViewMode("activity"); setSelectedDate(null) }}
              className={cn(
                "flex-1 text-[12px] py-2.5 font-semibold transition-all duration-200 border-l border-white/[0.08]",
                viewMode === "activity"
                  ? "bg-[#0EA5E9] text-white shadow-[0_0_12px_rgba(14,165,233,0.3)]"
                  : "text-white/45 hover:text-white/70 hover:bg-white/[0.04]"
              )}
            >
              By Activity
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto ue-scroll">
          {/* Date list — shown in By Day mode */}
          {viewMode === "day" && (
            <div className="px-3 pb-2">
              {sortedDates.length === 0 ? (
                <p className="text-[11px] text-white/35 px-3 py-3">No updates yet</p>
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
          <div className={cn(viewMode === "day" ? "border-t border-white/[0.06]" : "")}>
            <div className="px-4 pt-3 pb-2">
              <h5 className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Activities</h5>
            </div>
            <div className="px-3 pb-3">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                <input
                  placeholder="Search activities..."
                  value={activitySearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActivitySearch(e.target.value)}
                  className="w-full pl-9 pr-3 h-9 text-[11px] bg-black/30 border border-white/[0.06] rounded-[10px] text-white placeholder-white/25 focus:outline-none focus:border-[#0EA5E9]/40 focus:ring-1 focus:ring-[#0EA5E9]/15 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]"
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
                      <span
                        className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {activity.name.charAt(0)}
                      </span>
                      <span className={cn("flex-1 text-[12px] truncate font-medium", isSelected ? "text-[#0EA5E9]" : "text-white/85")}>
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
      <div className="min-w-0 overflow-y-auto ue-scroll p-5 bg-[rgba(3,6,12,0.5)]">
        {visibleSortedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/35 gap-3">
            <FileText className="h-12 w-12 opacity-15" />
            <p className="text-sm font-medium">No updates found</p>
            <p className="text-[11px] opacity-50">Updates appear here as your team submits progress</p>
          </div>
        ) : (
          visibleSortedDates.map((date) => {
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
                  {dayEntries.map((entry) => (
                    <UpdateCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ===== RIGHT SIDEBAR ===== */}
      <div className="border-l border-white/[0.06] flex flex-col shrink-0 bg-[rgba(5,8,15,0.92)] overflow-hidden">
        <div className="p-4 space-y-4 overflow-y-auto ue-scroll flex-1">

          {/* Card 1 — Update Summary */}
          <div className="rounded-[16px] border border-white/[0.05] bg-[rgba(6,10,18,0.85)] p-4">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h4 className="text-[13px] font-bold text-white">Update Summary</h4>
                <p className="text-[10px] text-white/35 mt-0.5">{dateRangeLabel}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="bg-white/[0.03] rounded-[12px] p-2.5 border border-white/[0.04]">
                <div className="text-[18px] font-bold text-white leading-tight">{totalUpdates}</div>
                <div className="text-[9px] text-white/45 font-medium mt-0.5">Total Updates</div>
              </div>
              <div className="bg-emerald-500/8 rounded-[12px] p-2.5 border border-emerald-500/15">
                <div className="text-[18px] font-bold text-emerald-400 leading-tight">{onTrackCount} <span className="text-[11px] font-semibold text-emerald-400/60">({onTrackPct}%)</span></div>
                <div className="text-[9px] text-emerald-400/60 font-medium mt-0.5">On Track</div>
              </div>
              <div className="bg-red-500/8 rounded-[12px] p-2.5 border border-red-500/15">
                <div className="text-[18px] font-bold text-red-400 leading-tight">{delayedCount} <span className="text-[11px] font-semibold text-red-400/60">({delayedPct}%)</span></div>
                <div className="text-[9px] text-red-400/60 font-medium mt-0.5">Delayed</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-amber-500/8 rounded-[12px] p-2.5 border border-amber-500/15">
                <div className="text-[18px] font-bold text-amber-400 leading-tight">{openIssues.length}</div>
                <div className="text-[9px] text-amber-400/60 font-medium mt-0.5">Issues Raised</div>
              </div>
              <div className="bg-white/[0.03] rounded-[12px] p-2.5 border border-white/[0.04]">
                <div className="text-[18px] font-bold text-white leading-tight">{totalPhotos}</div>
                <div className="text-[9px] text-white/45 font-medium mt-0.5">Photos</div>
              </div>
              <div className="bg-white/[0.03] rounded-[12px] p-2.5 border border-white/[0.04]">
                <div className="text-[18px] font-bold text-white leading-tight">18</div>
                <div className="text-[9px] text-white/45 font-medium mt-0.5">Documents</div>
              </div>
            </div>
            <button type="button" className="mt-3 text-[11px] text-[#0EA5E9] hover:text-[#0EA5E9]/70 flex items-center gap-1 transition-colors font-medium">
              View Full Summary <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Card 2 — Pending Approvals */}
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

          {/* Card 3 — Missing Updates */}
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
                    <div
                      className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {activity.name.charAt(0)}
                    </div>
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
        </div>
      </div>
    </div>
  )
}
