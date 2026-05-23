"use client"

import { useEffect, useRef, useState } from "react"
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
  selectedActivityId?: number
  className?: string
  subtasksByActivity?: Record<number, Subtask[]>
  activityWorkersCache?: Record<number, ActivityWorkersSummary>
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
  activityWorkersCache?: Record<number, ActivityWorkersSummary>
): string {
  const subtasks = subtasksByActivity?.[activity.zoneID] ?? []
  const progress = subtasks.length > 0 ? calculateProgressFromSubtasks(subtasks) : activity.progress ?? 0
  const track = getTrackLabelFromSubtasks(subtasks)
  const issues = getIssuesByActivityId(activity.zoneID)
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
  let lastUpdateHtml = `<span style="color:#475569;font-size:11px;">No updates yet</span>`
  if (allUpdates.length > 0) {
    const latest = allUpdates[0]
    const diffMs = Date.now() - new Date(latest.updatedAt).getTime()
    const diffH = Math.floor(diffMs / 3600000)
    const diffD = Math.floor(diffMs / 86400000)
    const timeAgo = diffH < 1 ? "Just now" : diffH < 24 ? `${diffH}h ago` : `${diffD}d ago`
    const imgSrc = latest.images?.[0]
    if (imgSrc) {
      lastUpdateHtml = `<div style="display:flex;align-items:center;gap:8px;">
        <img src="${imgSrc}" alt="" style="width:46px;height:34px;object-fit:cover;border-radius:5px;border:1px solid rgba(255,255,255,0.1);" />
        <span style="color:#94a3b8;font-size:11px;">${timeAgo}</span>
      </div>`
    } else {
      lastUpdateHtml = `<span style="color:#94a3b8;font-size:11px;">${timeAgo}</span>`
    }
  }

  const deadline = activity.deadline || activity.expectedCompletion
  const deadlineStr = deadline
    ? new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Not set"
  const engineer = activity.assignedSupervisor || activity.assignedTeam || "Unassigned"
  const zone = activity.markerLabel || "—"
  const issueColor = issues.length > 0 ? "#ef4444" : "#475569"

  return `<div style="font-family:system-ui,-apple-system,sans-serif;min-width:265px;max-width:290px;color:#f1f5f9;">
    <div style="margin-bottom:10px;">
      <div style="font-size:14px;font-weight:700;color:#f8fafc;line-height:1.3;margin-bottom:3px;">${activity.name}</div>
      <div style="font-size:11px;color:#94a3b8;">Zone</div>
      <div style="font-size:11px;color:#cbd5e1;font-weight:500;">${zone}</div>
    </div>
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
        <span style="font-size:11px;color:#64748b;">Progress</span>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:13px;font-weight:700;color:${progressBarColor};">${progress}%</span>
          <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px;background:${statusBg};color:${statusColor};">${statusLabel}</span>
        </div>
      </div>
      <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:${progress}%;background:${progressBarColor};border-radius:3px;"></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:auto 1fr;gap:5px 12px;font-size:11px;padding:8px 0;border-top:1px solid rgba(255,255,255,0.07);border-bottom:1px solid rgba(255,255,255,0.07);margin-bottom:8px;">
      <span style="color:#64748b;">Planned Finish</span><span style="color:#e2e8f0;">${deadlineStr}</span>
      <span style="color:#64748b;">Assigned Engineer</span><span style="color:#e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${engineer}</span>
      <span style="color:#64748b;">Crew Size</span><span style="color:#e2e8f0;">${crewSize} workers</span>
      <span style="color:#64748b;">Equipment</span><span style="color:#e2e8f0;">${equipment}</span>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
      <span style="font-size:11px;color:#64748b;">Latest Update</span>
      ${lastUpdateHtml}
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.07);">
      <span style="font-size:11px;color:#64748b;">Open Issues</span>
      <span style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;color:${issueColor};">
        <span style="width:6px;height:6px;border-radius:50%;background:${issueColor};display:inline-block;"></span>
        ${issues.length}
      </span>
    </div>
    <button data-view-activity="${activity.zoneID}" style="width:100%;padding:8px 0;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.4);border-radius:7px;color:#818cf8;font-size:12px;font-weight:600;cursor:pointer;letter-spacing:0.01em;">
      View Activity &rarr;
    </button>
  </div>`
}

export function LeafletMap({
  activities,
  project,
  loading,
  onActivitySelect,
  selectedActivityId,
  className,
  subtasksByActivity,
  activityWorkersCache,
  onViewPeople,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<number, L.Marker>>(new Map())
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

      const popupHtml = buildTooltipHtml(activity, subtasksByActivity, activityWorkersCache)

      const marker = L.marker([activity.lat, activity.lng], {
        icon,
        title: activity.name,
        zIndexOffset: isSelected ? 1000 : 0,
      })
        .bindPopup(popupHtml, {
          className: "site-rich-popup",
          closeButton: true,
          maxWidth: 320,
          minWidth: 270,
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
          marker.openPopup()
        })
        .on("mouseout", () => {
          closeTimeoutRef.current = setTimeout(() => {
            marker.closePopup()
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
      const btn = (e.target as HTMLElement).closest("[data-view-activity]") as HTMLElement | null
      if (!btn) return
      e.stopPropagation()
      const zoneId = Number(btn.getAttribute("data-view-activity"))
      const activity = activities.find((a) => a.zoneID === zoneId)
      if (activity) {
        onActivitySelect(activity)
        mapRef.current?.closePopup()
      }
    }

    container.addEventListener("click", handleViewActivity, true)
    return () => container.removeEventListener("click", handleViewActivity, true)
  }, [activities, onActivitySelect])

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
    </div>
  )
}
