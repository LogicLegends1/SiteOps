"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { type Activity, type Project } from "@/lib/site-data"
import { cn } from "@/lib/utils"

interface LeafletMapProps {
  activities: Activity[]
  project: Project | null
  loading?: boolean
  onActivitySelect: (activity: Activity) => void
  selectedActivityId?: number
  className?: string
}

const DEFAULT_MARKER_COLOR = "#94a3b8"
const SELECTED_MARKER_COLOR = "#22d3ee"

function createPinIcon(color: string, size = 32) {
  return L.divIcon({
    className: "site-progress-marker",
    html: `<div style="
      width:${size}px;
      height:${size}px;
      background:${color};
      border:3px solid #fff;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
  })
}

export function LeafletMap({
  activities,
  project,
  loading,
  onActivitySelect,
  selectedActivityId,
  className,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<number, L.Marker>>(new Map())

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
    }).setView(mapCenter, 13)

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

    const defaultIcon = createPinIcon(DEFAULT_MARKER_COLOR, 28)
    const selectedIcon = createPinIcon(SELECTED_MARKER_COLOR, 36)

    activities.forEach((activity) => {
      if (typeof activity.lat !== "number" || typeof activity.lng !== "number") return

      const isSelected = selectedActivityId === activity.zoneID
      const marker = L.marker([activity.lat, activity.lng], {
        icon: isSelected ? selectedIcon : defaultIcon,
        title: activity.name,
        zIndexOffset: isSelected ? 1000 : 0,
      })
        .bindPopup(
          `<div style="font-family:system-ui,sans-serif;min-width:120px">
            <div style="font-weight:600;margin-bottom:4px">${activity.name}</div>
            <div style="font-size:12px;color:#64748b">${activity.activity || ""}</div>
          </div>`
        )
        .bindTooltip(activity.markerLabel || activity.name, {
          permanent: !isSelected,
          direction: "right",
          offset: [14, 0],
          className: isSelected ? "leaflet-label leaflet-label-selected" : "leaflet-label",
        })
        .on("click", () => onActivitySelect(activity))
        .addTo(mapRef.current!)

      markersRef.current.set(activity.zoneID, marker)
    })
  }, [activities, selectedActivityId, onActivitySelect])

  useEffect(() => {
    if (!mapRef.current || markersRef.current.size === 0) return
    const markers = Array.from(markersRef.current.values())
    const group = new L.FeatureGroup(markers)
    mapRef.current.fitBounds(group.getBounds(), { padding: [36, 36], maxZoom: 15 })
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
    const id = "site-progress-leaflet-styles"
    if (document.getElementById(id)) return
    const style = document.createElement("style")
    style.id = id
    style.textContent = `
      .leaflet-label { background: rgba(15,23,42,0.92) !important; border: 1px solid #334155 !important;
        color: #e2e8f0 !important; font-size: 11px !important; font-weight: 500 !important;
        padding: 2px 6px !important; border-radius: 4px !important; }
      .leaflet-label-selected { border-color: #22d3ee !important; color: #22d3ee !important; font-weight: 600 !important; }
      .site-progress-marker { background: transparent !important; border: none !important; }
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

        <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground bg-background/80 px-2 py-1 rounded z-[400] pointer-events-none">
          © OpenStreetMap
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-3 text-[10px] text-muted-foreground bg-background/80 px-2 py-1 rounded z-[400] pointer-events-none">
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm rotate-45 border border-white shadow-sm"
              style={{ background: DEFAULT_MARKER_COLOR }}
            />
            Activity
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-sm rotate-45 border border-white shadow-sm"
              style={{ background: SELECTED_MARKER_COLOR }}
            />
            Selected
          </span>
        </div>
      </div>
  )
}
