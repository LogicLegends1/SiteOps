"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Plus, AlertCircle, CheckCircle2 } from "lucide-react"
import { type Activity } from "@/lib/site-data"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddActivityModalProps {
  projectId: number
  onActivityAdded?: (activity: Activity) => void
}

type ActivityStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED"

export function AddActivityModal({
  projectId,
  onActivityAdded,
}: AddActivityModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ActivityStatus>("PENDING")
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")

  const resetForm = () => {
    setName("")
    setDescription("")
    setStatus("PENDING")
    setLat("")
    setLng("")
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError(null)
    setSuccess(false)

    if (!name.trim()) {
      setError("Activity name is required")
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        projectid: projectId,
        name: name.trim(),
        description: description.trim() || null,
        status,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
      }

      const response = await fetch("/api/project/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create activity")
      }

      setSuccess(true)

      if (onActivityAdded) {
        onActivityAdded(data.activity)
      }

      setTimeout(() => {
        resetForm()
        setOpen(false)
      }, 1200)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value)

    if (!value) {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Activity
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Activity</DialogTitle>
          <DialogDescription>
            Add a new activity to this project.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500/30 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Activity created successfully
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Activity Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Activity Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Foundation Work"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this activity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>

            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as ActivityStatus)
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">
                  In Progress
                </SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="COMPLETED">
                  Completed
                </SelectItem>
                <SelectItem value="CANCELLED">
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Coordinates */}
          <div className="space-y-4 rounded-lg border p-4">
            <p className="text-sm font-medium">
              Coordinates (Optional)
            </p>

            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="0.000001"
                placeholder="e.g. 6.9271"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="0.000001"
                placeholder="e.g. 79.8612"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Creating...
                </span>
              ) : (
                "Create Activity"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}