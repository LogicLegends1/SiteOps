"use client"

import { useCallback, useEffect, useRef, type ReactNode } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { cn } from "@/lib/utils"

export type LeafletMapItemId = string | number

export interface LeafletMapItem {
  id: LeafletMapItemId
  lat: number
  lng: number
  title?: string
  description?: string
  popupHtml?: string
  tooltip?: string
}

export interface LeafletMapOptions {
  center?: [number, number]
  zoom?: number
  tileUrl?: string
  tileAttribution?: string
  minZoom?: number
  maxZoom?: number
  scrollWheelZoom?: boolean
  zoomControl?: boolean
  autoFitToMarkers?: boolean
  fitPadding?: [number, number]
}

export interface LeafletMarkerOptions {
  selectedItemId?: LeafletMapItemId
  getMarkerIcon?: (item: LeafletMapItem, isSelected: boolean) => L.Icon | L.DivIcon
  getPopupContent?: (item: LeafletMapItem) => string | HTMLElement | null | undefined
  getTooltipContent?: (item: LeafletMapItem) => string | HTMLElement | null | undefined
  allowUnsafeHtmlTooltip?: boolean
  tooltipPermanent?: boolean
  tooltipDirection?: L.Direction
  tooltipOffset?: L.PointExpression
}

export interface LeafletMapProps {
  items: LeafletMapItem[]
  className?: string
  mapClassName?: string
  loading?: boolean
  loadingContent?: ReactNode
  mapOptions?: LeafletMapOptions
  markerOptions?: LeafletMarkerOptions
  enableBoxSelection?: boolean
  onSelection?: (selectedIds: LeafletMapItemId[]) => void
  onMapClick?: (args: { event: L.LeafletMouseEvent; map: L.Map }) => void
  onMarkerClick?: (args: { item: LeafletMapItem; event: L.LeafletMouseEvent; marker: L.Marker }) => void
  onMarkerHover?: (args: {
    item: LeafletMapItem
    event: L.LeafletMouseEvent
    marker: L.Marker
    type: "enter" | "leave"
  }) => void
}

const DEFAULT_CENTER: [number, number] = [6.9271, 80.7789]
const DEFAULT_ZOOM = 13
const DEFAULT_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
const DEFAULT_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const DEFAULT_FIT_PADDING: [number, number] = [40, 40]
const DEFAULT_TOOLTIP_OFFSET: [number, number] = [0, -8]
const DEFAULT_MARKER_ICONS = getDefaultMarkerIcons()

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function pointExpressionKey(value?: L.PointExpression) {
  if (!value) return ""
  if (Array.isArray(value)) {
    const [x, y] = value
    return `${x}:${y}`
  }

  const pointLike = value as { x?: number; y?: number }
  if (typeof pointLike?.x === "number" && typeof pointLike?.y === "number") {
    return `${pointLike.x}:${pointLike.y}`
  }

  return JSON.stringify(value)
}

function pointExpressionToOffset(value?: L.PointExpression) {
  if (!value) return { x: 0, y: 0 }
  if (Array.isArray(value)) {
    const [x, y] = value
    return { x, y }
  }

  const pointLike = value as { x?: number; y?: number }
  return {
    x: pointLike.x ?? 0,
    y: pointLike.y ?? 0,
  }
}

function getDefaultMarkerIcons() {
  const markerIcon = L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
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
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [30, 50],
    iconAnchor: [15, 50],
    popupAnchor: [1, -37],
    shadowSize: [41, 41],
  })

  return { markerIcon, selectedMarkerIcon }
}

function getFallbackPopupContent(item: LeafletMapItem) {
  if (item.popupHtml) return item.popupHtml
  if (item.title || item.description) {
    return `<div class="font-semibold">${escapeHtml(item.title ?? "Untitled marker")}</div><div class="text-sm text-gray-600">${escapeHtml(item.description ?? "")}</div>`
  }
  return undefined
}

export function LeafletMap({
  items,
  className,
  mapClassName,
  loading = false,
  loadingContent,
  mapOptions,
  markerOptions,
  enableBoxSelection: enableBoxSelectionProp,
  onSelection,
  onMapClick,
  onMarkerClick,
  onMarkerHover,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const markersRef = useRef<Map<LeafletMapItemId, L.Marker>>(new Map())
  const hoverTooltipRef = useRef<HTMLDivElement | null>(null)
  const hoveredMarkerRef = useRef<L.Marker | null>(null)
  const hoveredContentRef = useRef<string | HTMLElement | null>(null)

  const mapCenter = mapOptions?.center ?? DEFAULT_CENTER
  const mapZoom = mapOptions?.zoom ?? DEFAULT_ZOOM
  const mapMinZoom = mapOptions?.minZoom
  const mapMaxZoom = mapOptions?.maxZoom
  const mapScrollWheelZoom = mapOptions?.scrollWheelZoom
  const mapZoomControl = mapOptions?.zoomControl
  const mapTileUrl = mapOptions?.tileUrl ?? DEFAULT_TILE_URL
  const mapTileAttribution = mapOptions?.tileAttribution ?? DEFAULT_TILE_ATTRIBUTION
  const mapAutoFit = mapOptions?.autoFitToMarkers ?? true
  const mapFitPadding = mapOptions?.fitPadding ?? DEFAULT_FIT_PADDING

  const selectedItemId = markerOptions?.selectedItemId
  const getMarkerIcon = markerOptions?.getMarkerIcon
  const getPopupContent = markerOptions?.getPopupContent
  const getTooltipContent = markerOptions?.getTooltipContent
  const allowUnsafeHtmlTooltip = markerOptions?.allowUnsafeHtmlTooltip ?? false
  const tooltipPermanent = markerOptions?.tooltipPermanent ?? false
  const tooltipDirection = markerOptions?.tooltipDirection ?? "top"
  const tooltipOffset = markerOptions?.tooltipOffset ?? DEFAULT_TOOLTIP_OFFSET
  const tooltipOffsetKey = pointExpressionKey(tooltipOffset)

  const enableBoxSelection = enableBoxSelectionProp ?? (mapOptions as any)?.enableBoxSelection ?? false

  const removeHoverTooltip = useCallback(() => {
    hoveredMarkerRef.current = null
    hoveredContentRef.current = null

    if (hoverTooltipRef.current) {
      hoverTooltipRef.current.remove()
      hoverTooltipRef.current = null
    }
  }, [])

  const updateHoverTooltipPosition = useCallback(() => {
    const map = mapRef.current
    const marker = hoveredMarkerRef.current
    const tooltip = hoverTooltipRef.current

    if (!map || !marker || !tooltip) return

    const latLng = marker.getLatLng()
    const layerPoint = map.latLngToLayerPoint(latLng)
    const { x, y } = pointExpressionToOffset(tooltipOffset)
    const verticalGap = tooltipDirection === "bottom" ? 12 : -12

    tooltip.style.left = `${layerPoint.x + x}px`
    tooltip.style.top = `${layerPoint.y + y + verticalGap}px`
  }, [tooltipDirection, tooltipOffsetKey])

  const showHoverTooltip = useCallback(
    (marker: L.Marker, content: string | HTMLElement) => {
      const map = mapRef.current
      if (!map) return

      hoveredMarkerRef.current = marker
      hoveredContentRef.current = content

      if (!hoverTooltipRef.current) {
        const tooltipElement = L.DomUtil.create(
          "div",
          "leaflet-hover-tooltip absolute z-10 pointer-events-none rounded border border-border bg-background/95 px-3 py-2 text-sm text-foreground shadow-lg backdrop-blur"
        )
        tooltipElement.style.transform = "translate(-50%, -100%)"
        tooltipElement.style.whiteSpace = "nowrap"
        tooltipElement.style.maxWidth = "240px"
        tooltipElement.style.overflow = "hidden"
        tooltipElement.style.textOverflow = "ellipsis"
        hoverTooltipRef.current = tooltipElement

        const pane = map.getPane("tooltipPane") ?? map.getContainer()
        pane.appendChild(tooltipElement)
      }

      const tooltipElement = hoverTooltipRef.current
      if (!tooltipElement) return

      tooltipElement.replaceChildren()
      if (typeof content === "string") {
        if (allowUnsafeHtmlTooltip) {
          tooltipElement.innerHTML = content
        } else {
          tooltipElement.textContent = content
        }
      } else {
        tooltipElement.appendChild(content)
      }

      tooltipElement.style.display = "block"
      updateHoverTooltipPosition()
    },
    [allowUnsafeHtmlTooltip, updateHoverTooltipPosition]
  )

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return
    }

    const map = L.map(mapContainerRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      minZoom: mapMinZoom,
      maxZoom: mapMaxZoom,
      scrollWheelZoom: mapScrollWheelZoom,
      zoomControl: mapZoomControl,
    })

    const tileLayer = L.tileLayer(mapTileUrl, {
      attribution: mapTileAttribution,
      maxZoom: mapMaxZoom ?? 19,
      minZoom: mapMinZoom,
    })

    tileLayer.addTo(map)
    mapRef.current = map
    tileLayerRef.current = tileLayer

    const updateTooltip = () => {
      updateHoverTooltipPosition()
    }

    map.on("move zoom resize", updateTooltip)

    // Box selection (click+drag while holding Shift) implementation
    let isDragging = false
    let startPoint: L.Point | null = null
    let selectionRect: L.Rectangle | null = null

    const onMouseDown = (e: L.LeafletMouseEvent) => {
      // require shift key for box selection to avoid interfering with panning
      // note: e.originalEvent may be undefined in some cases
      const orig = (e as any)?.originalEvent as MouseEvent | undefined
      if (!orig || !orig.shiftKey) return
      isDragging = true
      startPoint = map.latLngToLayerPoint(e.latlng)
      if (selectionRect) {
        selectionRect.remove()
        selectionRect = null
      }
    }

    const onMouseMove = (e: L.LeafletMouseEvent) => {
      if (!isDragging || !startPoint) return
      const currentPoint = map.latLngToLayerPoint(e.latlng)
      const p1 = map.layerPointToLatLng(startPoint)
      const p2 = map.layerPointToLatLng(currentPoint)
      const bounds = L.latLngBounds(p1, p2)
      if (!selectionRect) {
        selectionRect = L.rectangle(bounds, { color: "#3b82f6", weight: 1, fillOpacity: 0.12 }).addTo(map)
      } else {
        selectionRect.setBounds(bounds)
      }
    }

    const onMouseUp = (e: L.LeafletMouseEvent) => {
      if (!isDragging) return
      isDragging = false
      if (!selectionRect) return
      const bounds = selectionRect.getBounds()
      // gather selected marker ids
      const selected: LeafletMapItemId[] = []
      markersRef.current.forEach((marker, id) => {
        if (bounds.contains(marker.getLatLng())) {
          selected.push(id)
        }
      })
      selectionRect.remove()
      selectionRect = null
      startPoint = null
      // call callback if provided
      ;(map as any)._onSelection?.(selected)
    }

    // register handlers if enabled
    if (enableBoxSelection) {
      map.on("mousedown", onMouseDown)
      map.on("mousemove", onMouseMove)
      map.on("mouseup", onMouseUp)
    }

    return () => {
      map.off("move zoom resize", updateTooltip)
      if (enableBoxSelection) {
        map.off("mousedown")
        map.off("mousemove")
        map.off("mouseup")
      }
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current.clear()
      removeHoverTooltip()
      map.remove()
      mapRef.current = null
      tileLayerRef.current = null
    }
  }, [
    `${mapCenter[0]}:${mapCenter[1]}`,
    mapZoom,
    mapMinZoom,
    mapMaxZoom,
    mapScrollWheelZoom,
    mapZoomControl,
    mapTileUrl,
    mapTileAttribution,
    removeHoverTooltip,
    updateHoverTooltipPosition,
    enableBoxSelection,
  ])

  // expose selection handler to map instance so mouseup can trigger callback
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current as any
    map._onSelection = (selected: LeafletMapItemId[]) => {
      try {
        onSelection?.(selected)
      } catch (err) {
        // ignore
      }
    }
    return () => {
      if (map) map._onSelection = undefined
    }
  }, [onSelection])

  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current
    const handleMapClick = (event: L.LeafletMouseEvent) => {
      onMapClick?.({ event, map })
    }

    map.on("click", handleMapClick)
    return () => {
      map.off("click", handleMapClick)
    }
  }, [onMapClick])

  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current
    const { markerIcon, selectedMarkerIcon } = DEFAULT_MARKER_ICONS

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    items.forEach((item) => {
      if (typeof item.lat !== "number" || typeof item.lng !== "number") {
        return
      }

      const isSelected = selectedItemId === item.id
      const icon = getMarkerIcon?.(item, isSelected) ??
        (isSelected ? selectedMarkerIcon : markerIcon)

      const marker = L.marker([item.lat, item.lng], {
        icon,
        title: item.title,
      }).addTo(map)

      const popupContent = getPopupContent?.(item) ?? getFallbackPopupContent(item)
      if (popupContent) {
        marker.bindPopup(popupContent)
      }

      const tooltipContent = getTooltipContent?.(item) ?? item.tooltip

      marker.on("click", (event: L.LeafletMouseEvent) => {
        onMarkerClick?.({ item, event, marker })
      })

      marker.on("mouseover", (event: L.LeafletMouseEvent) => {
        onMarkerHover?.({ item, event, marker, type: "enter" })
        if (tooltipContent) {
          showHoverTooltip(marker, tooltipContent)
        }
      })

      marker.on("mouseout", (event: L.LeafletMouseEvent) => {
        onMarkerHover?.({ item, event, marker, type: "leave" })
        if (!tooltipPermanent) {
          removeHoverTooltip()
        }
      })

      markersRef.current.set(item.id, marker)
    })
  }, [
    items,
    selectedItemId,
    getMarkerIcon,
    getPopupContent,
    getTooltipContent,
    tooltipPermanent,
    tooltipDirection,
    tooltipOffsetKey,
    onMarkerClick,
    onMarkerHover,
    showHoverTooltip,
    removeHoverTooltip,
  ])

  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current

    if (mapAutoFit && markersRef.current.size > 0) {
      const group = new L.FeatureGroup(Array.from(markersRef.current.values()))
      map.fitBounds(group.getBounds(), {
        padding: mapFitPadding,
      })
      return
    }

    map.setView(mapCenter, mapZoom)
  }, [
    items,
    mapAutoFit,
    `${mapFitPadding[0]}:${mapFitPadding[1]}`,
    `${mapCenter[0]}:${mapCenter[1]}`,
    mapZoom,
  ])

  return (
    <div className={cn("relative z-0 isolate w-full overflow-hidden rounded-lg border border-border bg-secondary/30", className)}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40 text-sm text-muted-foreground">
          {loadingContent ?? "Loading map..."}
        </div>
      )}

      <div
        ref={mapContainerRef}
        className={cn("h-96 w-full", mapClassName)}
      />
    </div>
  )
}
