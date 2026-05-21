"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { Plus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const LeafletMap = dynamic(
  () => import("@/components/ui/leaflet-map").then((mod) => ({ default: mod.LeafletMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-60 w-full items-center justify-center rounded-md border border-border bg-card text-sm text-muted-foreground">
        Loading map...
      </div>
    ),
  }
)

type ProjectStatus = "PENDING" | "IN_PROGRESS" | "PAUSED" | "COMPLETED" | "CANCELLED"

interface CreateProjectDialogProps {
  onCreated: () => void | Promise<void>
}

const STATUS_OPTIONS: ProjectStatus[] = ["PENDING", "IN_PROGRESS", "PAUSED", "COMPLETED", "CANCELLED"]

export function CreateProjectDialog({ onCreated }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [status, setStatus] = useState<ProjectStatus>("PENDING")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [projectDiagram, setProjectDiagram] = useState("")
  const { toast } = useToast()

  const mapItems = useMemo(() => {
    const lat = latitude.trim() === "" ? null : Number(latitude)
    const lng = longitude.trim() === "" ? null : Number(longitude)

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return []
    }

    return [
      {
        id: "selected-location",
        title: name.trim() || "New project location",
        lat: lat as number,
        lng: lng as number,
        description: "Selected location",
        tooltip: "Selected project location",
      },
    ]
  }, [latitude, longitude, name])

  const mapCenter = useMemo(() => {
    const lat = latitude.trim() === "" ? null : Number(latitude)
    const lng = longitude.trim() === "" ? null : Number(longitude)

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return [lat as number, lng as number] as [number, number]
    }

    return [7.0, 80.3] as [number, number]
  }, [latitude, longitude])

  const canSubmit = useMemo(() => name.trim().length > 0 && !submitting, [name, submitting])

  const resetForm = () => {
    setName("")
    setStatus("PENDING")
    setLatitude("")
    setLongitude("")
    setProjectDiagram("")
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ title: "Project name is required", variant: "destructive" })
      return
    }

    const parsedLatitude = latitude.trim() === "" ? null : Number(latitude)
    const parsedLongitude = longitude.trim() === "" ? null : Number(longitude)

    if (parsedLatitude !== null && !Number.isFinite(parsedLatitude)) {
      toast({ title: "Latitude must be a valid number", variant: "destructive" })
      return
    }

    if (parsedLongitude !== null && !Number.isFinite(parsedLongitude)) {
      toast({ title: "Longitude must be a valid number", variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          status,
          locationLatitude: parsedLatitude,
          locationLongitude: parsedLongitude,
          projectDiagram: projectDiagram.trim() ? projectDiagram.trim() : null,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to create project")
      }

      toast({ title: "Project created successfully" })
      resetForm()
      setOpen(false)
      await onCreated()
    } catch (error) {
      toast({
        title: "Could not create project",
        description: error instanceof Error ? error.message : "Unexpected error",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-180">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Add a new project with optional coordinates so it appears on the map.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="e.g. Colombo Metro Tower"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as ProjectStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-latitude">Latitude</Label>
            <Input
              id="project-latitude"
              type="number"
              step="any"
              placeholder="6.9271"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-longitude">Longitude</Label>
            <Input
              id="project-longitude"
              type="number"
              step="any"
              placeholder="79.8612"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Pick Location on Map</Label>
              <span className="text-xs text-muted-foreground">
                Click the map to set latitude and longitude
              </span>
            </div>
            <LeafletMap
              items={mapItems}
              className="h-60 w-full"
              mapClassName="h-60 w-full"
              mapOptions={{
                center: mapCenter,
                zoom: 8,
                maxZoom: 19,
                scrollWheelZoom: true,
                zoomControl: true,
                autoFitToMarkers: false,
              }}
              markerOptions={{
                tooltipPermanent: false,
                tooltipDirection: "top",
                tooltipOffset: [0, -12],
              }}
              onMapClick={({ event }) => {
                setLatitude(event.latlng.lat.toFixed(6))
                setLongitude(event.latlng.lng.toFixed(6))
              }}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="project-diagram">Project Diagram / Notes</Label>
            <Textarea
              id="project-diagram"
              placeholder="Optional diagram URL or short description"
              value={projectDiagram}
              onChange={(e) => setProjectDiagram(e.target.value)}
              className="min-h-24"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}