"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { type EquipmentItem } from "@/lib/equipment-data"

interface EquipmentLeafletMapProps {
  equipment: EquipmentItem[]
  zones: any[]
  selectedAssetId?: string | null
  onAssetSelect: (id: string) => void
}

// Custom Leaflet DivIcon creator for classic Google Maps teardrop thumbtack pins with responsive sizes
const createGooglePinMarker = (name: string, color: string, width: number, height: number) => {
  // Extract letter cleanly (e.g. "Zone A" -> "A", "Activity E" -> "E", "Staging Area" -> "S")
  let letter = name.substring(0, 1)
  if (name.includes("Zone ")) {
    letter = name.substring(name.indexOf("Zone ") + 5, name.indexOf("Zone ") + 6)
  } else if (name.includes("Activity ")) {
    letter = name.substring(name.indexOf("Activity ") + 9, name.indexOf("Activity ") + 10)
  } else if (name.toLowerCase().includes("staging")) {
    letter = "S"
  }

  // Draw character mathematically centered inside the white hub circle using SVG <text> tag
  // SVG scales everything inside the viewBox="0 0 24 24" automatically with width/height!
  const html = `
    <div class="relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-110">
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 24" style="filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.35));">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="#ffffff" stroke-width="1.5" />
        <circle cx="12" cy="9" r="5" fill="#ffffff" />
        <text x="12" y="12" fill="#18181b" font-size="8.5px" font-family="system-ui, -apple-system, sans-serif" font-weight="900" text-anchor="middle">
          ${letter}
        </text>
      </svg>
    </div>
  `

  return L.divIcon({
    html,
    className: "custom-leaflet-google-pin",
    iconSize: [width, height],
    iconAnchor: [width / 2, height]
  })
}

export function EquipmentLeafletMap({
  equipment,
  zones,
  selectedAssetId,
  onAssetSelect
}: EquipmentLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)
  
  // Dynamic zoom state to enable real-time pin scaling
  const [zoomLevel, setZoomLevel] = useState(18)

  // Bind React asset selection callback globally so Leaflet HTML popups can trigger it
  useEffect(() => {
    ;(window as any).selectAssetOnMap = (id: string) => {
      onAssetSelect(id)
    }
    return () => {
      delete (window as any).selectAssetOnMap
    }
  }, [onAssetSelect])

  // Responsive scale factor based on deep zoom level
  const zoomFactor = Math.max(1, 1 + (zoomLevel - 18) * 0.28) // grow by 28% for each level above 18
  const pinWidth = Math.round(34 * zoomFactor)
  const pinHeight = Math.round(42 * zoomFactor)

  // Inject custom stylesheet dynamically to style standard leaflet UI and responsive labels
  useEffect(() => {
    const labelFontSize = Math.round(8.5 * zoomFactor)
    const paddingY = 2.5 * zoomFactor
    const paddingX = 7 * zoomFactor

    const css = `
      .leaflet-container {
        background-color: #f4f4f5 !important;
        font-family: inherit;
      }
      .custom-leaflet-permanent-label {
        background: rgba(9, 9, 11, 0.95) !important;
        border: 1px solid rgba(63, 63, 70, 0.7) !important;
        color: #ffffff !important;
        font-weight: 700 !important;
        font-size: ${labelFontSize}px !important;
        border-radius: 4px !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45) !important;
        padding: ${paddingY}px ${paddingX}px !important;
        white-space: nowrap !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        pointer-events: none !important;
        transition: font-size 0.2s ease, padding 0.2s ease;
      }
      /* Remove default Leaflet tooltip arrow pointer for a sleek integrated tag */
      .custom-leaflet-permanent-label::before {
        display: none !important;
      }
      /* Custom Premium Dark Leaflet Popup Styling */
      .leaflet-popup-content-wrapper {
        background: #09090b !important;
        border: 1.5px solid #27272a !important;
        border-radius: 8px !important;
        padding: 0 !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6) !important;
      }
      .leaflet-popup-content {
        margin: 0 !important;
        line-height: inherit !important;
      }
      .leaflet-popup-tip {
        background: #09090b !important;
        border: 1.5px solid #27272a !important;
      }
      .leaflet-popup-close-button {
        color: #a1a1aa !important;
        font-size: 16px !important;
        top: 6px !important;
        right: 6px !important;
      }
      .leaflet-popup-close-button:hover {
        color: #ffffff !important;
      }
    `
    const style = document.createElement("style")
    style.innerHTML = css
    document.head.appendChild(style)
    return () => {
      style.remove()
    }
  }, [zoomFactor])

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Center at Colombo site coordinates matching site progress tracking map exactly
    const baseCenter: [number, number] = [6.926268, 79.860464]
    
    // Set maxZoom: 22 to unlock deep zoom capabilities
    const map = L.map(mapContainerRef.current, {
      center: baseCenter,
      zoom: 18,
      maxZoom: 22,
      zoomControl: true,
      attributionControl: true
    })

    // Standard OpenStreetMap tile layer configured with scale-stretching for zoom levels 20, 21, and 22
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 22,
      maxNativeZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    const layerGroup = L.layerGroup().addTo(map)
    
    mapRef.current = map
    layerGroupRef.current = layerGroup

    // Register active zoom change listener to trigger real-time React scaling
    map.on("zoomend", () => {
      setZoomLevel(map.getZoom())
    })

    return () => {
      map.off("zoomend")
      map.remove()
      mapRef.current = null
      layerGroupRef.current = null
    }
  }, [])

  // Draw Work Zones & Machinery Pins
  useEffect(() => {
    const map = mapRef.current
    const layerGroup = layerGroupRef.current
    if (!map || !layerGroup) return

    layerGroup.clearLayers()

    // Status colors for heavy zones
    const zoneColorMap: Record<string, string> = {
      "zone a": "#10b981", // Emerald
      "zone b": "#3b82f6", // Blue
      "zone c": "#a855f7", // Purple
      "zone d": "#f59e0b", // Amber
      "activity e": "#06b6d4", // Cyan for framing
      "staging": "#64748b" // Grey
    }

    const rawZones = zones.length > 0 ? zones : [
      { zoneID: 8, name: "Zone A: Earth Excavation", lat: 6.926268, lng: 79.860464, description: "Earth Excavation" },
      { zoneID: 9, name: "Zone B: Material Handling", lat: 6.926087, lng: 79.860172, description: "Material Handling" },
      { zoneID: 10, name: "Zone C: Concrete Pour", lat: 6.926338, lng: 79.859616, description: "Concrete Pour" },
      { zoneID: 11, name: "Zone D: Steel Erection", lat: 6.926658, lng: 79.860024, description: "Steel Erection" },
      { zoneID: 18, name: "Activity E: Structural Framing", lat: 6.926118, lng: 79.859985, description: "Structural Framing" },
      { zoneID: 25, name: "Staging Area: Storage & Support", lat: 6.925900, lng: 79.860200, description: "Storage & Support" }
    ]

    // 1. FILTER: Include only the 6 specific activities created by your friend in the database
    const allowedPatterns = ["zone a", "zone b", "zone c", "zone d", "activity e", "staging"]
    
    const renderedZones = rawZones.filter(zone => 
      allowedPatterns.some(pattern => zone.name.toLowerCase().includes(pattern))
    )

    // 2. Map equipment to their assigned zones for the click popup details list
    const zoneAssignments = new Map<string, EquipmentItem[]>()
    equipment.forEach(item => {
      const targetId = item.activeActivityId ? String(item.activeActivityId) : item.activeZoneId ? String(item.activeZoneId) : null
      if (!targetId) return
      
      const list = zoneAssignments.get(targetId) || []
      list.push(item)
      zoneAssignments.set(targetId, list)
    })

    // 3. Draw Google Maps thumbtacks with visible labels & interactive asset popups
    renderedZones.forEach((zone) => {
      const matchedKey = Object.keys(zoneColorMap).find(key => 
        zone.name.toLowerCase().includes(key)
      )
      const color = matchedKey ? zoneColorMap[matchedKey] : "#06b6d4"

      const zoneIDStr = String(zone.zoneID)
      const itemsInZone = zoneAssignments.get(zoneIDStr) || []
      const totalCount = itemsInZone.length

      // Build ultra-premium HTML popup detailing deployed assets
      let popupHtml = `
        <div class="p-3.5 min-w-[220px] bg-zinc-950 text-zinc-100 rounded-lg font-sans border border-zinc-800/80">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
            <span class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">DEPLOYED FLEET (${totalCount})</span>
          </div>
          <div class="text-xs font-extrabold text-white mb-2.5" style="color: ${color};">${zone.name}</div>
          <div class="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
      `

      if (totalCount === 0) {
        popupHtml += `<div class="text-[10px] text-zinc-500 italic py-1">No active equipment deployed.</div>`
      } else {
        itemsInZone.forEach(item => {
          let statusColor = "#10b981" // Active
          if (item.status === "idle") statusColor = "#f59e0b"
          if (item.status === "down") statusColor = "#ef4444"
          if (item.status === "maintenance") statusColor = "#6366f1"

          popupHtml += `
            <div class="flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/40 p-2 rounded cursor-pointer transition-colors duration-150" onclick="window.selectAssetOnMap('${item.id}')">
              <div class="flex flex-col min-w-0 pr-2">
                <span class="text-[10.5px] font-semibold text-zinc-200 truncate max-w-[120px]">${item.name}</span>
                <span class="text-[8px] font-medium text-zinc-500 truncate">${item.className}</span>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${statusColor};"></span>
                <span class="text-[8px] font-bold text-zinc-400 capitalize">${item.status}</span>
              </div>
            </div>
          `
        })
      }

      popupHtml += `
          </div>
        </div>
      `

      // Draw sleek responsive Google Maps Teardrop Pin
      const pinIcon = createGooglePinMarker(zone.name, color, pinWidth, pinHeight)
      L.marker([zone.lat, zone.lng], {
        icon: pinIcon,
        zIndexOffset: 100
      })
      // Bind a permanent tooltip below each pin to display the meaningful zone label directly!
      .bindTooltip(zone.name, { 
        permanent: true,
        direction: "bottom", 
        offset: [0, 8],
        className: "custom-leaflet-permanent-label"
      })
      // Bind premium custom dark-mode popup listing all deployed items
      .bindPopup(popupHtml, {
        maxWidth: 260,
        minWidth: 220
      })
      .addTo(layerGroup)
    })

  }, [equipment, zones, pinWidth, pinHeight])

  // 4. Pan map to focus the selected equipment's zone, STRICTLY PRESERVING the user's current zoom level!
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedAssetId) return

    // Find matching equipment item
    const item = equipment.find(e => e.id === selectedAssetId)
    if (!item) return

    // Find its assigned zone ID
    const targetZoneId = item.activeActivityId ? String(item.activeActivityId) : item.activeZoneId ? String(item.activeZoneId) : null
    if (!targetZoneId) return

    // Find the zone in our dataset
    const rawZones = zones.length > 0 ? zones : [
      { zoneID: 8, name: "Zone A: Earth Excavation", lat: 6.926268, lng: 79.860464, description: "Earth Excavation" },
      { zoneID: 9, name: "Zone B: Material Handling", lat: 6.926087, lng: 79.860172, description: "Material Handling" },
      { zoneID: 10, name: "Zone C: Concrete Pour", lat: 6.926338, lng: 79.859616, description: "Concrete Pour" },
      { zoneID: 11, name: "Zone D: Steel Erection", lat: 6.926658, lng: 79.860024, description: "Steel Erection" },
      { zoneID: 18, name: "Activity E: Structural Framing", lat: 6.926118, lng: 79.859985, description: "Structural Framing" },
      { zoneID: 25, name: "Staging Area: Storage & Support", lat: 6.925900, lng: 79.860200, description: "Storage & Support" }
    ]

    const matchedZone = rawZones.find(z => String(z.zoneID) === targetZoneId)
    if (matchedZone) {
      // Pan to center the zone pin, using map.getZoom() to preserve the user's exact zoom state!
      map.setView([matchedZone.lat, matchedZone.lng], map.getZoom(), { animate: true })
    }
  }, [selectedAssetId, equipment, zones])

  return (
    <div className="relative w-full h-full pointer-events-auto">
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  )
}
