"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type Zone, getStatusColor, getStatusBorderColor } from "@/lib/site-data"
import { cn } from "@/lib/utils"

interface SiteMapProps {
  zones: Zone[]
  loading?: boolean
  onZoneSelect: (zone: Zone) => void
  selectedZoneId?: number
  onUploadComplete?: () => void
}

export function SiteMap({
  zones,
  loading,
  onZoneSelect,
  selectedZoneId,
  onUploadComplete,
}: SiteMapProps) {
  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Site Map</CardTitle>
            <CardDescription>
              Upload a map image for each zone
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative aspect-square w-full rounded-lg bg-secondary/30 border border-border overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="10%" height="10%" patternUnits="userSpaceOnUse">
                <path
                  d="M 100 0 L 0 0 0 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-border/50"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-background/40 z-10">
              Loading zones...
            </div>
          )}

          {!loading &&
            zones.map((zone) => (
              <ZoneBox
                key={zone.zoneID}
                zone={zone}
                selected={selectedZoneId === zone.zoneID}
                onSelect={() => onZoneSelect(zone)}
                onUploadComplete={onUploadComplete}
              />
            ))}

          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Project Construction Site
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ZoneBox({
  zone,
  selected,
  onSelect,
  onUploadComplete,
}: {
  zone: Zone
  selected: boolean
  onSelect: () => void
  onUploadComplete?: () => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleUpload(file: File) {
    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`/api/zones/${zone.zoneID}/maps`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      onUploadComplete?.()
    } catch (error) {
      console.error("Upload error:", error)
      alert(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div
      className={cn(
        "absolute rounded-lg border-2 overflow-hidden transition-all duration-200 group",
        "hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20",
        getStatusBorderColor(zone.status),
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      style={{
        left: `${zone.posX}%`,
        top: `${zone.posY}%`,
        width: `${zone.widthPercent}%`,
        height: `${zone.heightPercent}%`,
      }}
    >
      <button
        onClick={onSelect}
        className="relative w-full h-full"
      >
        {zone.imageUrl ? (
          <>
            <Image
              src={zone.imageUrl}
              alt={zone.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No image uploaded</span>
          </div>
        )}

        <div className={cn("absolute top-2 right-2 h-3 w-3 rounded-full", getStatusColor(zone.status))} />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
          <span className="text-lg font-bold text-white drop-shadow">{zone.name}</span>
          <span className="text-xs text-white/80 line-clamp-1">
            {zone.activity || zone.description || "No activity"}
          </span>

          <Badge
            variant="secondary"
            className="text-xs mt-2 bg-black/50 text-white border-white/10"
          >
            {zone.progress}%
          </Badge>
        </div>
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleUpload(file)
          }}
        />

        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={uploading}
          onClick={(e) => {
            e.stopPropagation()
            inputRef.current?.click()
          }}
        >
          {uploading ? "Uploading..." : zone.imageUrl ? "Change Image" : "Add Image"}
        </Button>
      </div>
    </div>
  )
}