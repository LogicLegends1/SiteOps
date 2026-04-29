"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { type Activity, type ActivityStatus, getStatusLabel } from "@/lib/site-data"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Upload, X, CheckCircle2, AlertCircle } from "lucide-react"

interface ProgressUpdateModalProps {
  activity: Activity | null
  onUpdateSubmitted?: () => void
}

const STATUS_OPTIONS: ActivityStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
]

export function ProgressUpdateModal({ activity, onUpdateSubmitted }: ProgressUpdateModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [description, setDescription] = useState("")
  const [newStatus, setNewStatus] = useState<ActivityStatus>(activity?.status ?? "IN_PROGRESS")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const resetForm = () => {
    setDescription("")
    setNewStatus(activity?.status ?? "IN_PROGRESS")
    setImageFile(null)
    setImagePreview(null)
    setError(null)
    setShowSuccess(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async () => {
    if (!activity || !description.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Upload evidence photo if present
      let evidencePhotoUrl: string | null = null
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        const uploadRes = await fetch(`/api/activity/${activity.zoneID}/logs/evidence`, {
          method: "POST",
          body: formData,
        })
        if (!uploadRes.ok) {
          const err = await uploadRes.json()
          throw new Error(err.error || "Image upload failed")
        }
        const { url } = await uploadRes.json()
        evidencePhotoUrl = url
      }

      // 2. Update status if changed
      if (newStatus !== activity.status) {
        const statusRes = await fetch(`/api/activity/${activity.zoneID}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
        if (!statusRes.ok) {
          const err = await statusRes.json()
          throw new Error(err.error || "Status update failed")
        }
      }

      // 3. Create log entry
      const logRes = await fetch(`/api/activity/${activity.zoneID}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          evidencePhoto: evidencePhotoUrl,
        }),
      })
      if (!logRes.ok) {
        const err = await logRes.json()
        throw new Error(err.error || "Failed to save progress update")
      }

      setShowSuccess(true)
      setTimeout(() => {
        resetForm()
        setIsOpen(false)
        onUpdateSubmitted?.()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (value: boolean) => {
    setIsOpen(value)
    if (!value) resetForm()
  }

  if (!activity) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={false}>
      <DialogTrigger asChild>
        <Button className="gap-2 w-full">
          <Plus className="h-4 w-4" />
          Add Progress Update
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Progress Update</DialogTitle>
          <DialogDescription>
            {activity.name} — {activity.activity}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Progress update saved!</span>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold">
              Description *
            </Label>
            <Input
              id="description"
              placeholder="e.g. Concrete poured for footing section A"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              maxLength={255}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="font-semibold">Status</Label>
            <Select
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as ActivityStatus)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {getStatusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Evidence Photo */}
          <div className="space-y-2">
            <Label className="font-semibold">Evidence Photo</Label>
            {imagePreview ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-destructive/80 hover:bg-destructive rounded-full text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="evidence-upload"
                className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-border rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">Click to upload photo</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
                <input
                  id="evidence-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2 border-t border-border">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting || !description.trim()}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                "Save Update"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
