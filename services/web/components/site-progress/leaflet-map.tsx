"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type Activity, type Project } from "@/lib/site-data"

interface LeafletMapProps {
  activities: Activity[]
  project: Project | null
  loading?: boolean
  onActivitySelect: (activity: Activity) => void
  selectedActivityId?: number
}

// Create a function to get marker icons that's called at runtime
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
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<number, L.Marker>>(new Map())

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return
    }

    const defaultCenter: [number, number] = [6.9271, 80.7789] // Sri Lanka center
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
      // Don't destroy the map on unmount in strict mode
    }
  }, [project])

  // Update markers when activities change
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker)
    })
    markersRef.current.clear()

    const { markerIcon, selectedMarkerIcon } = getMarkerIcons()

    // Add new markers
    activities.forEach((activity) => {
      // Skip activities without valid coordinates
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
           <div class="text-sm text-gray-600">${activity.activity || "No activity"}</div>
           <div class="text-xs mt-1">Progress: ${activity.progress}%</div>`
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

  // Auto-fit map to show all markers
  useEffect(() => {
    if (!mapRef.current || markersRef.current.size === 0) return

    const markers = Array.from(markersRef.current.values())
    if (markers.length === 0) return

    const group = new L.FeatureGroup(markers)
    mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] })
  }, [activities])

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Site Map</CardTitle>
            <CardDescription>Click markers to view activity details</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative w-full bg-secondary/30 border border-border overflow-hidden rounded-lg pointer-events-auto">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-background/40 z-10 pointer-events-none">
              Loading activities...
            </div>
          )}

          <div
            ref={mapContainerRef}
            className="h-96 w-full"
            style={{
              border: "1px solid var(--border)",
            }}
          />

          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded z-[400] pointer-events-none">
            © OpenStreetMap
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
