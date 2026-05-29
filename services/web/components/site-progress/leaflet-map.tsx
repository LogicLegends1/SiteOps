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

// ── Weather Overlay (dummy data) ──────────────────────────────────────────────

interface WeatherDay {
  label: string
  icon: string
  temp: string
  high: string
  low: string
  condition: string
  wind: string
  humidity: string
}

function getWeatherForecast(): WeatherDay[] {
  const today = new Date()
  const days: WeatherDay[] = [
    {
      label: "Today",
      icon: "☀️",
      temp: "32°C",
      high: "33°",
      low: "26°",
      condition: "Sunny",
      wind: "12 km/h",
      humidity: "62%",
    },
    {
      label: new Date(today.getTime() + 86400000).toLocaleDateString("en-US", { weekday: "short" }),
      icon: "⛅",
      temp: "30°C",
      high: "31°",
      low: "25°",
      condition: "Partly Cloudy",
      wind: "15 km/h",
      humidity: "68%",
    },
    {
      label: new Date(today.getTime() + 86400000 * 2).toLocaleDateString("en-US", { weekday: "short" }),
      icon: "🌧️",
      temp: "28°C",
      high: "29°",
      low: "24°",
      condition: "Light Rain",
      wind: "20 km/h",
      humidity: "78%",
    },
    {
      label: new Date(today.getTime() + 86400000 * 3).toLocaleDateString("en-US", { weekday: "short" }),
      icon: "🌤️",
      temp: "31°C",
      high: "32°",
      low: "25°",
      condition: "Mostly Sunny",
      wind: "10 km/h",
      humidity: "60%",
    },
  ]
  return days
}

function WeatherOverlay({ activityName }: { activityName: string }) {
  const forecast = useMemo(() => getWeatherForecast(), [])

  return (
    <div className="absolute top-14 left-4 z-[400] pointer-events-none animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="bg-[rgba(15,23,42,0.92)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[170px]">
        <div className="flex items-center gap-1.5 mb-2 px-0.5">
          <svg className="w-3 h-3 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          </svg>
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Site Weather</span>
        </div>
        <div className="flex flex-col gap-1">
          {forecast.map((day, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 border transition-all",
                i === 0
                  ? "bg-gradient-to-r from-sky-500/15 to-sky-500/5 border-sky-500/20"
                  : "bg-white/[0.03] border-white/[0.06]"
              )}
            >
              <span className="text-[16px] leading-none">{day.icon}</span>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-wide",
                      i === 0 ? "text-sky-400" : "text-white/40"
                    )}
                  >
                    {day.label}
                  </span>
                  <span className="text-[11px] font-extrabold text-white leading-none">
                    {day.temp}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={cn(
                      "text-[9px] font-semibold",
                      i === 0 ? "text-sky-300/80" : "text-white/45"
                    )}
                  >
                    {day.condition}
                  </span>
                  <span className="text-[8px] text-white/30">💨{day.wind}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Crew Breakdown Overlay ────────────────────────────────────────────────────

function getCrewBreakdown(activity: Activity, activityWorkersCache?: Record<number, ActivityWorkersSummary>): { role: string; count: number }[] {
  const workers = activityWorkersCache?.[activity.zoneID]
  if (workers && Object.keys(workers.roleCounts).length > 0) {
    return Object.entries(workers.roleCounts)
      .filter(([, count]) => count > 0)
      .map(([role, count]) => ({ role: capitalizeRole(role), count }))
      .sort((a, b) => b.count - a.count)
  }
  // Fallback deterministic crew based on activity
  const n = (activity.name || "").toLowerCase()
  if (n.includes("excavat") || n.includes("earthwork") || n.includes("bulk earth")) {
    return [{ role: "Excavator Operators", count: 2 }, { role: "General Laborers", count: 6 }, { role: "Site Engineers", count: 1 }, { role: "Tipper Drivers", count: 3 }]
  } else if (n.includes("concrete") || n.includes("pcc") || n.includes("pour") || n.includes("footing")) {
    return [{ role: "Masons", count: 4 }, { role: "General Laborers", count: 5 }, { role: "Site Engineers", count: 1 }, { role: "Steel Fixers", count: 2 }]
  } else if (n.includes("rebar") || n.includes("reinforc")) {
    return [{ role: "Steel Fixers", count: 4 }, { role: "Crane Operators", count: 1 }, { role: "General Laborers", count: 3 }, { role: "Site Engineers", count: 1 }]
  } else if (n.includes("drain") || n.includes("pipe") || n.includes("utility")) {
    return [{ role: "General Laborers", count: 4 }, { role: "Excavator Operators", count: 1 }, { role: "Site Engineers", count: 1 }]
  } else if (n.includes("compact") || n.includes("sub-base") || n.includes("road")) {
    return [{ role: "General Laborers", count: 5 }, { role: "Surveyors", count: 1 }, { role: "Site Engineers", count: 1 }]
  }
  return [{ role: "Site Engineers", count: 1 }, { role: "General Laborers", count: 4 }, { role: "Masons", count: 2 }]
}

function CrewBreakdownOverlay({ activity, activityWorkersCache }: { activity: Activity; activityWorkersCache?: Record<number, ActivityWorkersSummary> }) {
  const crew = useMemo(() => getCrewBreakdown(activity, activityWorkersCache), [activity, activityWorkersCache])
  const total = crew.reduce((sum, c) => sum + c.count, 0)

  return (
    <div className="absolute top-14 right-4 z-[400] pointer-events-none animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="bg-[rgba(15,23,42,0.92)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[180px]">
        <div className="flex items-center gap-1.5 mb-2 px-0.5">
          <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Crew</span>
          <span className="ml-auto text-[10px] font-bold text-emerald-400">{total}</span>
        </div>
        <div className="flex flex-col gap-1">
          {crew.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
            >
              <span className="text-[10px] text-white/70 font-medium">{item.role}</span>
              <span className="text-[11px] font-bold text-emerald-300 ml-3">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Machinery & Assets Breakdown Overlay ──────────────────────────────────────

function getMachineryBreakdown(activity: Activity): { name: string; count: number; type: "machinery" | "asset" }[] {
  const n = (activity.name || "").toLowerCase()
  if (n.includes("excavat") || n.includes("earthwork") || n.includes("bulk earth")) {
    return [
      { name: "Excavators", count: 2, type: "machinery" },
      { name: "Tippers", count: 3, type: "machinery" },
      { name: "Safety Barriers", count: 8, type: "asset" },
    ]
  } else if (n.includes("haul")) {
    return [
      { name: "Tippers", count: 4, type: "machinery" },
      { name: "Loader", count: 1, type: "machinery" },
      { name: "Fuel Bowser", count: 1, type: "asset" },
    ]
  } else if (n.includes("concrete") || n.includes("pcc") || n.includes("pour") || n.includes("footing")) {
    return [
      { name: "Concrete Mixer", count: 1, type: "machinery" },
      { name: "Vibrators", count: 2, type: "machinery" },
      { name: "Formwork Sets", count: 4, type: "asset" },
    ]
  } else if (n.includes("rebar") || n.includes("reinforc")) {
    return [
      { name: "Rebar Bender", count: 1, type: "machinery" },
      { name: "Crawler Crane", count: 1, type: "machinery" },
      { name: "Rebar Stock (tons)", count: 12, type: "asset" },
    ]
  } else if (n.includes("drain") || n.includes("pipe") || n.includes("utility")) {
    return [
      { name: "Excavator", count: 1, type: "machinery" },
      { name: "Pipe Layer", count: 1, type: "machinery" },
      { name: "Pipe Sections", count: 20, type: "asset" },
    ]
  } else if (n.includes("compact") || n.includes("sub-base") || n.includes("road")) {
    return [
      { name: "Roller", count: 1, type: "machinery" },
      { name: "Graders", count: 2, type: "machinery" },
      { name: "Water Bowser", count: 1, type: "asset" },
    ]
  } else if (n.includes("formation") || n.includes("grading") || n.includes("leveling")) {
    return [
      { name: "Grader", count: 1, type: "machinery" },
      { name: "Roller", count: 1, type: "machinery" },
      { name: "Survey Equipment", count: 2, type: "asset" },
    ]
  }
  return [
    { name: "General Equipment", count: 2, type: "machinery" },
    { name: "Tool Kits", count: 3, type: "asset" },
    { name: "Safety Gear Sets", count: 6, type: "asset" },
  ]
}

function MachineryAssetsOverlay({ activity }: { activity: Activity }) {
  const items = useMemo(() => getMachineryBreakdown(activity), [activity])
  const machinery = items.filter((i) => i.type === "machinery")
  const assets = items.filter((i) => i.type === "asset")

  return (
    <div className="absolute bottom-14 right-4 z-[400] pointer-events-none animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="bg-[rgba(15,23,42,0.92)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[190px]">
        <div className="flex items-center gap-1.5 mb-2 px-0.5">
          <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Machinery & Assets</span>
        </div>
        {machinery.length > 0 && (
          <div className="mb-1.5">
            <span className="text-[9px] font-semibold text-amber-400/70 uppercase tracking-wider px-2">Machinery</span>
            <div className="flex flex-col gap-1 mt-1">
              {machinery.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                >
                  <span className="text-[10px] text-white/70 font-medium">{item.name}</span>
                  <span className="text-[11px] font-bold text-amber-300 ml-3">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {assets.length > 0 && (
          <div>
            <span className="text-[9px] font-semibold text-orange-400/70 uppercase tracking-wider px-2">Assets</span>
            <div className="flex flex-col gap-1 mt-1">
              {assets.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                >
                  <span className="text-[10px] text-white/70 font-medium">{item.name}</span>
                  <span className="text-[11px] font-bold text-orange-300 ml-3">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
      zoomControl: true,
      attributionControl: false,
    }).setView(mapCenter, 16)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    map.on("popupclose", () => {
      setHoveredActivityId(null)
    })

    return () => {
      // kept for strict-mode; invalidateSize handles resize
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
          autoPan: true,
          autoPanPadding: L.point(40, 40),
        })
        .on("click", () => {
          onActivitySelect(activity)
        })
        .on("mouseover", () => {
          if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
          }
          // Pan map so popup appears dead center on screen
          const map = mapRef.current!
          const latlng = marker.getLatLng()
          const mapSize = map.getSize()
          // Popup extends ~200px above marker; offset marker below center by that amount
          const popupHeight = 200
          const targetContainerPoint = L.point(mapSize.x / 2, mapSize.y / 2 + popupHeight / 2)
          const targetLatLng = map.containerPointToLatLng(targetContainerPoint)
          const currentMarkerPoint = map.latLngToContainerPoint(latlng)
          const dx = currentMarkerPoint.x - mapSize.x / 2
          const dy = currentMarkerPoint.y - (mapSize.y / 2 + popupHeight / 2)
          const currentCenter = map.getCenter()
          const currentCenterPoint = map.latLngToContainerPoint(currentCenter)
          const newCenterPoint = L.point(currentCenterPoint.x + dx, currentCenterPoint.y + dy)
          const newCenter = map.containerPointToLatLng(newCenterPoint)
          map.panTo(newCenter, { animate: true, duration: 0.3 })
          marker.openPopup()
          setHoveredActivityId(activity.zoneID)
        })
        .on("mouseout", () => {
          closeTimeoutRef.current = setTimeout(() => {
            marker.closePopup()
            setHoveredActivityId(null)
          }, 200)
        })
        .addTo(mapRef.current!)

      markersRef.current.set(activity.zoneID, marker)
    })
  }, [activities, selectedActivityId, onActivitySelect, subtasksByActivity, activityWorkersCache])

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
        closeTimeoutRef.current = setTimeout(() => {
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

      {/* Weather forecast overlay */}
      {hoveredActivity && <WeatherOverlay activityName={hoveredActivity.name} />}

      {/* Crew breakdown overlay */}
      {hoveredActivity && <CrewBreakdownOverlay activity={hoveredActivity} activityWorkersCache={activityWorkersCache} />}

      {/* Machinery & Assets breakdown overlay */}
      {hoveredActivity && <MachineryAssetsOverlay activity={hoveredActivity} />}

      <div className="absolute bottom-3 left-3 text-[10px] text-muted-foreground bg-background/90 backdrop-blur-sm px-2.5 py-1.5 rounded-md z-[400] pointer-events-none border border-border/50">
        © OpenStreetMap
      </div>
      <div className="absolute bottom-3 right-3 flex items-center gap-3 text-[10px] text-muted-foreground bg-background/90 backdrop-blur-sm px-2.5 py-1.5 rounded-md z-[400] pointer-events-none border border-border/50">
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={DEFAULT_MARKER_COLOR} stroke="#fff" strokeWidth="1"/>
            <circle cx="12" cy="9" r="2.5" fill="#fff"/>
          </svg>
          Activity
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={SELECTED_MARKER_COLOR} stroke="#fff" strokeWidth="1"/>
            <circle cx="12" cy="9" r="2.5" fill="#fff"/>
          </svg>
          Selected
        </span>
      </div>

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
