"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { type Activity, type Project } from "@/lib/site-data"
import { type Subtask, calculateProgressFromSubtasks, getSubtaskCounts, getTrackLabelFromSubtasks } from "@/lib/subtasks-data"
import { getIssuesByActivityId } from "@/lib/issues-data"
import { cn } from "@/lib/utils"

export interface ActivityWorkersSummary {
  roleCounts: Record<string, number>
  total: number
}

interface LeafletMapProps {
  activities: Activity[]
  project: Project | null
  loading?: boolean
  onActivitySelect: (activity: Activity) => void
  onViewInTracker?: (activity: Activity) => void
  onViewIssues?: (activity: Activity) => void
  selectedActivityId?: number
  className?: string
  subtasksByActivity?: Record<number, Subtask[]>
  activityWorkersCache?: Record<number, ActivityWorkersSummary>
  engineerByActivity?: Record<number, string>
  onViewPeople?: (activity: Activity) => void
}

const DEFAULT_MARKER_COLOR = "#EA4335"
const SELECTED_MARKER_COLOR = "#1a73e8"

function capitalizeRole(role: string): string {
  return role.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function createGooglePinSvg(color: string, isSelected: boolean) {
  const size = isSelected ? 40 : 32
  const dotColor = isSelected ? "#ffffff" : "#ffffff"
  const shadow = isSelected ? "drop-shadow(0 4px 6px rgba(0,0,0,0.4))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" style="filter:${shadow}">
    <rect width="${size}" height="${size}" fill="rgba(0,0,0,0)" style="cursor:pointer"/>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="#ffffff" stroke-width="0.5"/>
    <circle cx="12" cy="9" r="2.5" fill="${dotColor}"/>
  </svg>`
}

function createPinIcon(color: string, isSelected: boolean) {
  const size = isSelected ? 40 : 32
  return L.divIcon({
    className: "site-progress-gmap-marker",
    html: createGooglePinSvg(color, isSelected),
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
  })
}

function buildTooltipHtml(
  activity: Activity,
  subtasksByActivity?: Record<number, Subtask[]>,
  activityWorkersCache?: Record<number, ActivityWorkersSummary>,
  engineerByActivity?: Record<number, string>
): string {
  const subtasks = subtasksByActivity?.[activity.zoneID] ?? []
  const progress = subtasks.length > 0 ? calculateProgressFromSubtasks(subtasks) : activity.progress ?? 0
  const track = getTrackLabelFromSubtasks(subtasks)
  const issues = getIssuesByActivityId(activity.zoneID).filter((i) => i.status !== "resolved")
  const workers = activityWorkersCache?.[activity.zoneID]
  const crewSize = workers?.total ?? Math.max(6, (activity.zoneID * 3) % 14 + 4)

  const isCompleted = progress === 100 || activity.status === "COMPLETED"
  const isDelayed = track === "Behind" && !isCompleted
  const statusLabel = isCompleted ? "Completed" : isDelayed ? "Delayed" : "On Track"
  const statusColor = isCompleted ? "#10b981" : isDelayed ? "#f59e0b" : "#10b981"
  const statusBg = isCompleted ? "rgba(16,185,129,0.18)" : isDelayed ? "rgba(245,158,11,0.18)" : "rgba(16,185,129,0.18)"
  const progressBarColor = isCompleted ? "#10b981" : isDelayed ? "#f59e0b" : "#3b82f6"

  const n = (activity.name || "").toLowerCase()
  let equipment = "Various Equipment"
  if (n.includes("excavat") || n.includes("earthwork") || n.includes("bulk earth")) equipment = "2 Excavators, 3 Tippers"
  else if (n.includes("haul")) equipment = "4 Tippers, Loader"
  else if (n.includes("concrete") || n.includes("pcc") || n.includes("pour") || n.includes("footing")) equipment = "1 Mixer, 2 Vibrators"
  else if (n.includes("rebar") || n.includes("reinforc")) equipment = "Rebar Bender, Crane"
  else if (n.includes("drain") || n.includes("pipe") || n.includes("utility")) equipment = "1 Excavator, Pipe Layer"
  else if (n.includes("compact") || n.includes("sub-base") || n.includes("road")) equipment = "1 Roller, 2 Graders"
  else if (n.includes("formation") || n.includes("grading") || n.includes("leveling")) equipment = "Grader, Roller"
  else if (n.includes("inspect") || n.includes("qa") || n.includes("qc")) equipment = "Testing Equipment"

  const allUpdates = subtasks
    .flatMap((s) => s.updates)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  let lastUpdateHtml = `<span style="color:#475569;font-size:13px;">No updates yet</span>`
  if (allUpdates.length > 0) {
    const latest = allUpdates[0]
    const diffMs = Date.now() - new Date(latest.updatedAt).getTime()
    const diffH = Math.floor(diffMs / 3600000)
    const diffD = Math.floor(diffMs / 86400000)
    const timeAgo = diffH < 1 ? "Just now" : diffH < 24 ? `${diffH}h ago` : `${diffD}d ago`
    const imgSrc = latest.images?.[0]
    if (imgSrc) {
      lastUpdateHtml = `<div style="display:flex;align-items:center;gap:8px;">
        <img data-zoom-image="${imgSrc}" src="${imgSrc}" alt="" style="width:46px;height:34px;object-fit:cover;border-radius:5px;border:1px solid rgba(255,255,255,0.1);cursor:pointer;" />
        <span style="color:#94a3b8;font-size:13px;">${timeAgo}</span>
      </div>`
    } else {
      lastUpdateHtml = `<span style="color:#94a3b8;font-size:13px;">${timeAgo}</span>`
    }
  }

  const deadline = activity.deadline || activity.expectedCompletion
  const deadlineStr = deadline
    ? new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Not set"
  const engineer = engineerByActivity?.[activity.zoneID] || activity.assignedSupervisor || activity.assignedTeam || "Unassigned"
  const zone = activity.markerLabel || "—"
  const issueColor = issues.length > 0 ? "#ef4444" : "#475569"
  const completedSubtasks = subtasks.filter((s) => s.completed).length
  const totalSubtasks = subtasks.length
  const subtasksHtml = totalSubtasks > 0
    ? `<div style="padding:8px 0 6px;border-top:1px solid rgba(255,255,255,0.07);margin-bottom:8px;">
        <div style="font-size:13px;color:#64748b;margin-bottom:5px;">Subtasks <span style="color:#94a3b8;">${completedSubtasks}/${totalSubtasks} done</span></div>
        <div style="display:flex;flex-direction:column;gap:3px;">
          ${subtasks.slice(0, 5).map((st) => `
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${st.completed ? '#10b981' : 'rgba(255,255,255,0.1)'};border:1px solid ${st.completed ? '#10b981' : 'rgba(255,255,255,0.25)'};"></span>
              <span style="font-size:13px;color:${st.completed ? '#64748b' : '#e2e8f0'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:205px;${st.completed ? 'text-decoration:line-through;' : ''}">${st.title}</span>
            </div>`).join('')}
          ${subtasks.length > 5 ? `<span style="font-size:12px;color:#64748b;padding-left:14px;">+${subtasks.length - 5} more</span>` : ''}
        </div>
      </div>`
    : ''

  return `<div style="font-family:system-ui,-apple-system,sans-serif;min-width:340px;max-width:400px;color:#f1f5f9;">
    <div style="margin-bottom:10px;">
      <div style="font-size:16px;font-weight:700;color:#f8fafc;line-height:1.3;margin-bottom:3px;">${activity.name}</div>
    </div>
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
        <span style="font-size:13px;color:#64748b;">Progress</span>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:15px;font-weight:700;color:${progressBarColor};">${progress}%</span>
          <span style="font-size:12px;font-weight:600;padding:2px 8px;border-radius:10px;background:${statusBg};color:${statusColor};">${statusLabel}</span>
        </div>
      </div>
      <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:${progress}%;background:${progressBarColor};border-radius:3px;"></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:13px;padding:8px 0;border-top:1px solid rgba(255,255,255,0.07);border-bottom:1px solid rgba(255,255,255,0.07);margin-bottom:8px;">
      <span style="color:#64748b;">Planned Finish</span><span style="color:#e2e8f0;">${deadlineStr}</span>
      <span style="color:#64748b;">Site Engineer</span><span style="color:#e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${engineer}</span>
      <span style="color:#64748b;">Crew Size</span><span style="color:#e2e8f0;">${crewSize} workers</span>
      <span style="color:#64748b;">Assets</span><span style="color:#e2e8f0;">${equipment}</span>
    </div>
    ${subtasksHtml}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
      <span style="font-size:13px;color:#64748b;">Latest Update</span>
      ${lastUpdateHtml}
    </div>
    <div data-view-issues="${activity.zoneID}" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.07);cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='transparent'">
      <span style="font-size:13px;color:#64748b;">Open Issues</span>
      <span style="display:flex;align-items:center;gap:4px;font-size:14px;font-weight:700;color:${issueColor};">
        <span style="width:6px;height:6px;border-radius:50%;background:${issueColor};display:inline-block;"></span>
        ${issues.length}
      </span>
    </div>
    <button data-view-in-tracker="${activity.zoneID}" style="width:100%;padding:8px 0;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.4);border-radius:7px;color:#818cf8;font-size:14px;font-weight:600;cursor:pointer;letter-spacing:0.01em;">
      View Activity &rarr;
    </button>
  </div>`
}

// ── Weather Overlay ───────────────────────────────────────────────────────────

function getWeatherForecast(): {
  current: { temp: string; condition: string; wind: string; humidity: string }
  days: { label: string; high: string; low: string }[]
} {
  const today = new Date()
  const days = [
    {
      label: new Date(today.getTime() + 86400000).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      high: "32°",
      low: "22°",
    },
    {
      label: new Date(today.getTime() + 86400000 * 2).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      high: "30°",
      low: "23°",
    },
    {
      label: new Date(today.getTime() + 86400000 * 3).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      high: "31°",
      low: "22°",
    },
    {
      label: new Date(today.getTime() + 86400000 * 4).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      high: "29°",
      low: "22°",
    },
  ]
  return {
    current: { temp: "32°C", condition: "Sunny", wind: "18 km/h", humidity: "61%" },
    days,
  }
}

function WeatherOverlay({ activityName }: { activityName: string }) {
  const { current, days } = useMemo(() => getWeatherForecast(), [])
  const sunIcon = (
    <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )

  return (
    <div className="bg-[rgba(15,23,42,0.92)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[240px]">
        <div className="text-[11px] font-semibold text-white/70 mb-2">Weather</div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <svg className="w-8 h-8 text-yellow-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <div>
              <div className="text-xl font-bold text-white leading-none">{current.temp}</div>
              <div className="text-xs text-white/70 mt-0">{current.condition}</div>
            </div>
          </div>
          <div className="flex gap-2">
            {days.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-semibold text-white/50 uppercase">{day.label}</span>
                {sunIcon}
                <span className="text-[9px] font-bold text-white">{day.high}</span>
                <span className="text-[8px] text-white/40">{day.low}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/[0.08] text-[10px] text-white/50">
          <span>Wind: {current.wind}</span>
          <span>Humidity: {current.humidity}</span>
        </div>
      </div>
  )
}

// ── Crew & Machinery Combined Overlay ─────────────────────────────────────────

function CrewAndMachineryOverlay({
  activity,
  activityWorkersCache,
}: {
  activity: Activity
  activityWorkersCache?: Record<number, ActivityWorkersSummary>
}) {
  const workers = activityWorkersCache?.[activity.zoneID]
  const roleCounts = workers?.roleCounts ?? {}
  const totalCrew = workers?.total ?? 0

  const roleColors = ["bg-emerald-400", "bg-sky-400", "bg-amber-400", "bg-violet-400", "bg-rose-400"]

  const crewCategories = Object.entries(roleCounts).map(([role, count], i) => ({
    label: capitalizeRole(role),
    count,
    color: roleColors[i % roleColors.length],
  }))

  const fallbackCrew = [
    { label: "Active", count: 8, color: "bg-emerald-400" },
    { label: "Idle", count: 1, color: "bg-yellow-400" },
    { label: "Unavailable / Off Site", count: 2, color: "bg-red-400" },
  ]

  const machineryStatuses = [
    { label: "Active", count: 6, color: "bg-emerald-400" },
    { label: "Idle", count: 2, color: "bg-yellow-400" },
    { label: "Under Maintenance", count: 2, color: "bg-orange-400" },
    { label: "Breakdown / Broken", count: 1, color: "bg-red-400" },
  ]

  const crewRows = crewCategories.length > 0 ? crewCategories : fallbackCrew
  const [showAllCrew, setShowAllCrew] = useState(false)
  const visibleCrewRows = showAllCrew ? crewRows : crewRows.slice(0, 3)

  return (
    <div className="bg-[rgba(15,23,42,0.92)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[220px]">
      {/* Crew */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white/90">Crew</span>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/50">Total Crew On Site</div>
          <div className="text-lg font-bold text-white leading-none">{totalCrew || 11}</div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-3">
        {visibleCrewRows.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", s.color)} />
              <span className="text-xs text-white/70">{s.label}</span>
            </div>
            <span className="text-xs font-bold text-white">{s.count}</span>
          </div>
        ))}
        {crewRows.length > 3 && (
          <button
            onClick={() => setShowAllCrew((v) => !v)}
            className="text-[11px] text-sky-400 hover:text-sky-300 mt-0.5 pointer-events-auto cursor-pointer text-left w-fit"
          >
            {showAllCrew ? "See less" : `See more (+${crewRows.length - 3})`}
          </button>
        )}
      </div>

      <div className="border-t border-white/[0.08] pt-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-xs font-semibold text-white/70">Crew Requests</span>
          </div>
          <span className="text-[11px] font-semibold text-sky-400">2 Open Requests</span>
        </div>
        <div className="flex flex-col gap-1 pl-5">
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="text-[11px] text-white/50">Operator Request</span>
            <span className="text-[11px] font-bold text-white ml-auto">1</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="text-[11px] text-white/50">Labour Request</span>
            <span className="text-[11px] font-bold text-white ml-auto">1</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.08] my-3" />

      {/* Machinery */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white/90">Machinery</span>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/50">Total Active</div>
          <div className="text-lg font-bold text-white leading-none">11</div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-3">
        {machineryStatuses.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", s.color)} />
              <span className="text-xs text-white/70">{s.label}</span>
            </div>
            <span className="text-xs font-bold text-white">{s.count}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.08] pt-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-xs font-semibold text-white/70">Machinery Requests</span>
          </div>
          <span className="text-[11px] font-semibold text-sky-400">1 Open Request</span>
        </div>
        <div className="flex items-center gap-1.5 pl-5">
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span className="text-[11px] text-white/50">Excavator or Dump Truck</span>
          <span className="text-[11px] font-bold text-white ml-auto">1</span>
        </div>
      </div>
    </div>
  )
}

export function LeafletMap({
  activities,
  project,
  loading,
  onActivitySelect,
  onViewInTracker,
  onViewIssues,
  selectedActivityId,
  className,
  subtasksByActivity,
  activityWorkersCache,
  engineerByActivity,
  onViewPeople,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<number, L.Marker>>(new Map())
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [hoveredActivityId, setHoveredActivityId] = useState<number | null>(null)
  const [pinnedActivityId, setPinnedActivityId] = useState<number | null>(null)
  const [overlaysOnRight, setOverlaysOnRight] = useState(false)
  const pinnedActivityIdRef = useRef<number | null>(null)
  // Prevents popupclose from wiping the pin when we're switching between pins
  const isSwitchingPinRef = useRef(false)
  const onActivitySelectRef = useRef(onActivitySelect)

  useEffect(() => {
    onActivitySelectRef.current = onActivitySelect
  }, [onActivitySelect])

  const hoveredActivity = useMemo(
    () => activities.find((a) => a.zoneID === hoveredActivityId) ?? null,
    [activities, hoveredActivityId]
  )

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const defaultCenter: [number, number] = [6.9271, 80.7789]
    const mapCenter: [number, number] =
      project &&
      typeof project.locationLatitude === "number" &&
      typeof project.locationLongitude === "number"
        ? [project.locationLatitude, project.locationLongitude]
        : defaultCenter

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(mapCenter, 16)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    map.on("popupclose", () => {
      // If we're in the middle of switching pins, don't clear — the new pin
      // is already set and opening. The popupclose here is from the OLD popup.
      if (isSwitchingPinRef.current) return
      setPinnedActivityId(null)
      pinnedActivityIdRef.current = null
      setHoveredActivityId(null)
    })

    return () => {
      // cleanup if needed
    }
  }, [project])

  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker)
    })
    markersRef.current.clear()

    activities.forEach((activity) => {
      if (typeof activity.lat !== "number" || typeof activity.lng !== "number") return

      const isSelected = selectedActivityId === activity.zoneID
      const color = isSelected ? SELECTED_MARKER_COLOR : DEFAULT_MARKER_COLOR
      const icon = createPinIcon(color, isSelected)

      const popupHtml = buildTooltipHtml(activity, subtasksByActivity, activityWorkersCache, engineerByActivity)

      const marker = L.marker([activity.lat, activity.lng], {
        icon,
        title: activity.name,
        zIndexOffset: isSelected ? 1000 : 0,
      })
        .bindPopup(popupHtml, {
          className: "site-rich-popup",
          closeButton: true,
          maxWidth: 420,
          minWidth: 350,
          autoPan: false,
        })
        .on("click", (e) => {
          // Prevent this click from bubbling to the map layer
          if (e.originalEvent) e.originalEvent.stopPropagation()

          if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
          }

          // Clicking the already-pinned marker → unpin and close
          if (pinnedActivityIdRef.current === activity.zoneID) {
            setPinnedActivityId(null)
            pinnedActivityIdRef.current = null
            marker.closePopup()
            setHoveredActivityId(null)
            return
          }

          const map = mapRef.current!
          const markerPoint = map.latLngToContainerPoint(marker.getLatLng())
          const mapSize = map.getSize()
          setOverlaysOnRight(markerPoint.x < mapSize.x * 0.55)

          // Set the new pin BEFORE opening the popup so that when Leaflet
          // fires `popupclose` for the previous popup (synchronously inside
          // openPopup), the isSwitchingPinRef guard blocks the clear.
          isSwitchingPinRef.current = true
          setPinnedActivityId(activity.zoneID)
          pinnedActivityIdRef.current = activity.zoneID
          marker.openPopup()         // may fire popupclose for previous popup
          isSwitchingPinRef.current = false

          setHoveredActivityId(activity.zoneID)
          onActivitySelectRef.current(activity)

          // After the popup has rendered, measure its position against the map
          // container and pan by exactly the right amount to bring it fully into
          // view — handles pins at any edge or corner of the map.
          requestAnimationFrame(() => {
            const popupEl = marker.getPopup()?.getElement()
            if (!popupEl) return

            const mapContainer = map.getContainer()
            const mapRect = mapContainer.getBoundingClientRect()
            const popupRect = popupEl.getBoundingClientRect()
            const PAD = 16

            let panX = 0
            let panY = 0

            // Popup cut off at top → pan map UP so popup slides down into view
            if (popupRect.top < mapRect.top + PAD) {
              panY = -(mapRect.top + PAD - popupRect.top)
            // Popup cut off at bottom → pan map DOWN
            } else if (popupRect.bottom > mapRect.bottom - PAD) {
              panY = popupRect.bottom - mapRect.bottom + PAD
            }

            // Popup cut off at left → pan map LEFT so popup slides right into view
            if (popupRect.left < mapRect.left + PAD) {
              panX = -(mapRect.left + PAD - popupRect.left)
            // Popup cut off at right → pan map RIGHT
            } else if (popupRect.right > mapRect.right - PAD) {
              panX = popupRect.right - mapRect.right + PAD
            }

            if (panX !== 0 || panY !== 0) {
              map.panBy([panX, panY], { animate: true, duration: 0.25 })
            }
          })
        })
        .on("mouseover", () => {
          if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
          }
          const map = mapRef.current!
          const markerPoint = map.latLngToContainerPoint(marker.getLatLng())
          const mapSize = map.getSize()
          const isLeftSide = markerPoint.x < mapSize.x * 0.55
          setOverlaysOnRight(isLeftSide)

          marker.openPopup()
          setHoveredActivityId(activity.zoneID)
        })
        .on("mouseout", () => {
          // Do NOT close if this marker is pinned
          if (pinnedActivityIdRef.current === activity.zoneID) return

          closeTimeoutRef.current = setTimeout(() => {
            // Double-check pin hasn't changed during the delay
            if (pinnedActivityIdRef.current === activity.zoneID) return
            marker.closePopup()
            setHoveredActivityId(null)
          }, 200)
        })
        .addTo(mapRef.current!)

      markersRef.current.set(activity.zoneID, marker)
    })
  }, [activities, subtasksByActivity, activityWorkersCache])

  // Update marker styles (color/size) when selection changes — without destroying markers/popups
  useEffect(() => {
    if (!mapRef.current) return
    markersRef.current.forEach((marker, zoneID) => {
      const isSelected = selectedActivityId === zoneID
      const color = isSelected ? SELECTED_MARKER_COLOR : DEFAULT_MARKER_COLOR
      marker.setIcon(createPinIcon(color, isSelected))
      marker.setZIndexOffset(isSelected ? 1000 : 0)
    })
  }, [selectedActivityId])

  useEffect(() => {
    if (!mapRef.current || markersRef.current.size === 0) return
    const markers = Array.from(markersRef.current.values())
    const group = new L.FeatureGroup(markers)
    mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 17 })
  }, [activities])

  useEffect(() => {
    if (!mapRef.current || selectedActivityId == null) return
    const marker = markersRef.current.get(selectedActivityId)
    if (!marker) return
    const latlng = marker.getLatLng()
    mapRef.current.panTo(latlng, { animate: true })
  }, [selectedActivityId])

  useEffect(() => {
    const timer = setTimeout(() => mapRef.current?.invalidateSize(), 150)
    return () => clearTimeout(timer)
  }, [className])

  useEffect(() => {
    if (!mapContainerRef.current || !onViewPeople) return
    const container = mapContainerRef.current

    function handleClick(e: MouseEvent) {
      const btn = (e.target as HTMLElement).closest("[data-view-people]") as HTMLElement | null
      if (!btn) return
      e.stopPropagation()
      const zoneId = Number(btn.getAttribute("data-view-people"))
      const activity = activities.find((a) => a.zoneID === zoneId)
      if (activity && onViewPeople) {
        onViewPeople(activity)
      }
    }

    container.addEventListener("click", handleClick, true)
    return () => container.removeEventListener("click", handleClick, true)
  }, [activities, onViewPeople])

  useEffect(() => {
    if (!mapContainerRef.current) return
    const container = mapContainerRef.current

    function handleViewActivity(e: MouseEvent) {
      const btn = (e.target as HTMLElement).closest("[data-view-in-tracker]") as HTMLElement | null
      if (!btn) return
      e.stopPropagation()
      const zoneId = Number(btn.getAttribute("data-view-in-tracker"))
      const activity = activities.find((a) => a.zoneID === zoneId)
      if (activity) {
        if (onViewInTracker) {
          onViewInTracker(activity)
        } else {
          onActivitySelect(activity)
        }
        mapRef.current?.closePopup()
      }
    }

    function handleViewIssues(e: MouseEvent) {
      const btn = (e.target as HTMLElement).closest("[data-view-issues]") as HTMLElement | null
      if (!btn) return
      e.stopPropagation()
      const zoneId = Number(btn.getAttribute("data-view-issues"))
      const activity = activities.find((a) => a.zoneID === zoneId)
      if (activity && onViewIssues) {
        onViewIssues(activity)
        mapRef.current?.closePopup()
      }
    }

    function handleImageZoom(e: MouseEvent) {
      const img = (e.target as HTMLElement).closest("[data-zoom-image]") as HTMLElement | null
      if (!img) return
      e.stopPropagation()
      const imgUrl = img.getAttribute("data-zoom-image")
      if (imgUrl) {
        setZoomedImage(imgUrl)
      }
    }

    container.addEventListener("click", handleViewActivity, true)
    container.addEventListener("click", handleImageZoom, true)
    container.addEventListener("click", handleViewIssues, true)
    return () => {
      container.removeEventListener("click", handleViewActivity, true)
      container.removeEventListener("click", handleImageZoom, true)
      container.removeEventListener("click", handleViewIssues, true)
    }
  }, [activities, onActivitySelect, onViewInTracker, onViewIssues])

  useEffect(() => {
    const handlePopupMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest(".leaflet-popup")) {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current)
          closeTimeoutRef.current = null
        }
      }
    }

    const handlePopupMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest(".leaflet-popup")) {
        // If any marker is pinned, keep the popup alive
        if (pinnedActivityIdRef.current !== null) return

        closeTimeoutRef.current = setTimeout(() => {
          if (pinnedActivityIdRef.current !== null) return
          mapRef.current?.closePopup()
          setHoveredActivityId(null)
        }, 200)
      }
    }

    document.addEventListener("mouseover", handlePopupMouseEnter)
    document.addEventListener("mouseout", handlePopupMouseLeave)
    return () => {
      document.removeEventListener("mouseover", handlePopupMouseEnter)
      document.removeEventListener("mouseout", handlePopupMouseLeave)
    }
  }, [])


  useEffect(() => {
    const id = "site-progress-leaflet-styles"
    if (document.getElementById(id)) return
    const style = document.createElement("style")
    style.id = id
    style.textContent = `
      .site-progress-gmap-marker { background: transparent !important; border: none !important; }
      .site-progress-gmap-marker svg { cursor: pointer; }
      .site-rich-popup {
        z-index: 600 !important;
        background: rgba(15,23,42,0.96) !important;
        border: 1px solid rgba(51,65,85,0.8) !important;
        border-radius: 10px !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3) !important;
        backdrop-filter: blur(8px) !important;
      }
      .site-rich-popup .leaflet-popup-content-wrapper {
        background: transparent !important;
        border-radius: 10px !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
      .site-rich-popup .leaflet-popup-content {
        margin: 14px 16px !important;
        color: #f8fafc !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        max-height: 70vh !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }
      .site-rich-popup .leaflet-popup-tip {
        background: rgba(15,23,42,0.96) !important;
        border: 1px solid rgba(51,65,85,0.8) !important;
        box-shadow: none !important;
      }
      .site-rich-popup .leaflet-popup-close-button {
        color: #94a3b8 !important;
        font-size: 18px !important;
        padding: 6px 8px !important;
      }
      .site-rich-popup .leaflet-popup-close-button:hover {
        color: #f8fafc !important;
      }
    `
    document.head.appendChild(style)
  }, [])

  return (
    <div
      className={cn(
        "relative w-full h-full bg-secondary/30 overflow-hidden",
        className
      )}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-background/40 z-10 pointer-events-none">
          Loading map...
        </div>
      )}

      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Weather + Crew & Machinery overlays */}
      {hoveredActivity && (
        <div className={cn("absolute top-0 z-[400] pointer-events-none flex flex-col gap-3 animate-in fade-in duration-300", overlaysOnRight ? "right-4 slide-in-from-right-2" : "left-4 slide-in-from-left-2")}>
          <WeatherOverlay activityName={hoveredActivity.name} />
          <CrewAndMachineryOverlay activity={hoveredActivity} activityWorkersCache={activityWorkersCache} />
        </div>
      )}

      {/* Custom zoom controls */}
      {!(hoveredActivity && overlaysOnRight) && (
        <div className="absolute bottom-3 right-3 z-[400] flex flex-col gap-1">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="w-7 h-7 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-md border border-border/50 text-foreground hover:bg-background text-sm font-medium transition-colors"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="w-7 h-7 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-md border border-border/50 text-foreground hover:bg-background text-sm font-medium transition-colors"
            aria-label="Zoom out"
          >
            −
          </button>
        </div>
      )}

      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
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
              alt="Zoomed image"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
