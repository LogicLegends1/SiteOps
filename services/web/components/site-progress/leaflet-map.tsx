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
  const { completed, total } = getSubtaskCounts(subtasks)
  const track = getTrackLabelFromSubtasks(subtasks)
  const issues = getIssuesByActivityId(activity.zoneID)

  const trackColor = track === "On Track" ? "#10b981" : "#ef4444"
  const trackBg = track === "On Track" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)"
  const progressBarColor = progress === 100 ? "#10b981" : progress > 50 ? "#3b82f6" : "#f59e0b"

  let subtaskHtml = ""
  if (subtasks.length > 0) {
    subtaskHtml = `<div style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.08);padding-top:8px;">
      <div style="font-size:10px;color:#94a3b8;font-weight:600;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">Subtasks (${completed}/${total})</div>
      ${subtasks.map((s) => `<div style="display:flex;align-items:center;gap:6px;padding:2px 0;font-size:11px;">
        <span style="width:8px;height:8px;border-radius:50%;border:1.5px solid ${s.completed ? "#10b981" : "#64748b"};background:${s.completed ? "#10b981" : "transparent"};flex-shrink:0;"></span>
        <span style="color:${s.completed ? "#64748b" : "#e2e8f0"};${s.completed ? "text-decoration:line-through;" : ""}overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px;">${s.title}</span>
      </div>`).join("")}
    </div>`
  }

  let issuesHtml = ""
  if (issues.length > 0) {
    issuesHtml = `<div style="margin-top:6px;display:flex;align-items:center;gap:5px;font-size:10px;color:#f59e0b;">
      <span style="font-weight:600;">⚠ ${issues.length} Issue${issues.length > 1 ? "s" : ""}</span>
    </div>`
  }

  let peopleHtml = ""
  const activityWorkers = activityWorkersCache?.[activity.zoneID]
  if (activityWorkers && activityWorkers.total > 0) {
    const rolePills = Object.entries(activityWorkers.roleCounts)
      .map(([role, count]) => `<div style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;background:rgba(129,140,248,0.08);border:1px solid rgba(129,140,248,0.15);border-radius:6px;">
        <span style="font-size:10px;color:#c7d2fe;">${capitalizeRole(role)}</span>
        <span style="font-size:11px;font-weight:700;color:#818cf8;">${count}</span>
      </div>`)
      .join("")
    peopleHtml = `<div style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.08);padding-top:8px;">
      <div style="font-size:10px;color:#94a3b8;font-weight:600;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">People (${activityWorkers.total})</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">${rolePills}</div>
      <button data-view-people="${activity.zoneID}" style="width:100%;padding:5px 10px;background:rgba(129,140,248,0.15);border:1px solid rgba(129,140,248,0.3);border-radius:6px;color:#818cf8;font-size:10px;font-weight:600;cursor:pointer;text-transform:uppercase;letter-spacing:0.5px;">View Full Team</button>
    </div>`
  }

  return `<div style="font-family:system-ui,-apple-system,sans-serif;min-width:200px;max-width:280px;padding:0;">
    <div style="font-size:13px;font-weight:700;color:#f8fafc;margin-bottom:4px;line-height:1.3;">${activity.name}</div>
    <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${activity.description || activity.activity || ""}</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      <div style="flex:1;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;">
        <div style="width:${progress}%;height:100%;background:${progressBarColor};border-radius:2px;transition:width 0.3s;"></div>
      </div>
      <span style="font-size:12px;font-weight:700;color:#f8fafc;">${progress}%</span>
    </div>
    <div style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:10px;background:${trackBg};font-size:10px;font-weight:600;color:${trackColor};">
      <span style="width:6px;height:6px;border-radius:50%;background:${trackColor};"></span>
      ${track}
    </div>
    ${issuesHtml}
    ${peopleHtml}
    ${subtaskHtml}
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
          maxWidth: 300,
          minWidth: 220,
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
        margin: 12px 14px !important;
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
