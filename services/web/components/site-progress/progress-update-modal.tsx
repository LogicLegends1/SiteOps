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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type Activity, type ActivityStatus, getStatusLabel } from "@/lib/site-data"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Upload, X, CheckCircle2 } from "lucide-react"

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

  // Form state
  const [updateTitle, setUpdateTitle] = useState("")
  const [description, setDescription] = useState("")
  const [newStatus, setNewStatus] = useState<ActivityStatus>(activity?.status || "IN_PROGRESS")
  const [notes, setNotes] = useState("")
  const [updatedBy, setUpdatedBy] = useState("Site Engineer")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [imagePreview, setImagePreview] = useState<string>("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setUploadedImages([...uploadedImages, result])
        setImagePreview("")
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!activity || !updateTitle.trim()) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)

    // Reset form
    setUpdateTitle("")
    setDescription("")
    setNewStatus(activity.status)
    setNotes("")
    setUploadedImages([])
    setImagePreview("")

    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setIsOpen(false)
      onUpdateSubmitted?.()
    }, 2000)
  }

  if (!activity) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 w-full">
          <Plus className="h-4 w-4" />
          Add Progress Update
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Progress Update Report</DialogTitle>
          <DialogDescription>
            {activity.name} - {activity.activity}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Success message */}
          {showSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success text-success">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Progress update submitted successfully!</span>
            </div>
          )}

          {/* Update Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold">
              Update Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Concrete poured for footing section A"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              className="bg-secondary/50 border-border"
            />
            <p className="text-xs text-muted-foreground">
              Brief summary of work completed or status change
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold">
              Description / Work Done
            </Label>
            <Textarea
              id="description"
              placeholder="Detailed description of activities completed, work in progress, or issues encountered today..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary/50 border-border min-h-24"
            />
          </div>

          {/* Status Change */}
          <div className="space-y-2">
            <Label htmlFor="status" className="font-semibold">
              Activity Status
            </Label>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ActivityStatus)}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes/Remarks */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-semibold">
              Notes / Remarks
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes, risks, or observations... e.g., Material delay due to rain, Electrical conduit installation started"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-secondary/50 border-border min-h-20"
            />
          </div>

          {/* Updated By */}
          <div className="space-y-2">
            <Label htmlFor="updatedBy" className="font-semibold">
              Updated By
            </Label>
            <Input
              id="updatedBy"
              placeholder="Your name/role"
              value={updatedBy}
              onChange={(e) => setUpdatedBy(e.target.value)}
              className="bg-secondary/50 border-border"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="font-semibold">Progress Images / Site Photos</Label>
            <div className="space-y-3">
              {/* Image preview list */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {uploadedImages.map((image, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden border border-border"
                    >
                      <img
                        src={image}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-destructive/80 hover:bg-destructive rounded-full text-white transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-border rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">Click to upload photos</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
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
              disabled={isSubmitting || !updateTitle.trim()}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Submitting...
                </>
              ) : (
                "Submit Update"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
