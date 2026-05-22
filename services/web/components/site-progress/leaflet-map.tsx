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

const getMarkerIcons = () => {
  const markerIcon = L.icon({
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  const selectedMarkerIcon = L.icon({
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [30, 50],
    iconAnchor: [15, 50],
    popupAnchor: [1, -37],
    shadowSize: [41, 41],
  })

  return { markerIcon, selectedMarkerIcon }
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
    if (!mapContainerRef.current || mapRef.current) {
      return
    }

    const defaultCenter: [number, number] = [6.9271, 80.7789]
    const mapCenter: [number, number] =
      project &&
      typeof project.locationLatitude === "number" &&
      typeof project.locationLongitude === "number"
        ? [project.locationLatitude, project.locationLongitude]
        : defaultCenter

    const map = L.map(mapContainerRef.current).setView(mapCenter, 13)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    return () => {
      // Leaflet map is kept across strict-mode remounts; invalidateSize handles layout changes
    }
  }, [project])

  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker)
    })
    markersRef.current.clear()

    const { markerIcon, selectedMarkerIcon } = getMarkerIcons()

    activities.forEach((activity) => {
      if (typeof activity.lat !== "number" || typeof activity.lng !== "number") {
        return
      }

      const isSelected = selectedActivityId === activity.zoneID
      const marker = L.marker([activity.lat, activity.lng], {
        icon: isSelected ? selectedMarkerIcon : markerIcon,
        title: activity.name,
      })
        .bindPopup(
          `<div class="font-semibold">${activity.name}</div>
           <div class="text-sm text-gray-600">${activity.activity || "No activity"}</div>`
        )
        .bindTooltip(activity.markerLabel || activity.name, {
          permanent: true,
          direction: "right",
          offset: [12, 0],
          className: "leaflet-label",
        })
        .on("click", () => {
          onActivitySelect(activity)
        })
        .addTo(mapRef.current!)

      markersRef.current.set(activity.zoneID, marker)
    })
  }, [activities, selectedActivityId, onActivitySelect])

  useEffect(() => {
    if (!mapRef.current || markersRef.current.size === 0) return

    const markers = Array.from(markersRef.current.values())
    const group = new L.FeatureGroup(markers)
    mapRef.current.fitBounds(group.getBounds(), { padding: [40, 40] })
  }, [activities])

  useEffect(() => {
    const timer = setTimeout(() => {
      mapRef.current?.invalidateSize()
    }, 100)
    return () => clearTimeout(timer)
  }, [className])

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[420px] bg-secondary/30 border border-border overflow-hidden rounded-lg",
        className
      )}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-background/40 z-10 pointer-events-none">
          Loading map...
        </div>
      )}

      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded z-[400] pointer-events-none">
        © OpenStreetMap
      </div>
    </div>
  )
}
