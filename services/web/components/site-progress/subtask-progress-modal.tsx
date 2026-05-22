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
import { type Subtask } from "@/lib/subtasks-data"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Upload, X } from "lucide-react"

interface SubtaskProgressModalProps {
  subtask: Subtask
  onSubmit: (description: string, evidencePhotoUrl?: string) => Promise<void> | void
}

export function SubtaskProgressModal({ subtask, onSubmit }: SubtaskProgressModalProps) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setDescription("")
    setImageFile(null)
    setImagePreview(null)
    setError(null)
    setIsSubmitting(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!description.trim()) return
    setIsSubmitting(true)
    setError(null)

    try {
      let evidencePhotoUrl: string | undefined
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        const uploadRes = await fetch(`/api/subtask/${subtask.id}/logs/evidence`, {
          method: "POST",
          body: formData,
        })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Image upload failed")
        }
        evidencePhotoUrl = uploadData.url
      }

      await onSubmit(description.trim(), evidencePhotoUrl)
      reset()
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save update")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
          <Plus className="h-3 w-3" />
          Update
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Subtask Progress</DialogTitle>
          <DialogDescription>{subtask.title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="subtask-update">Update description *</Label>
            <Textarea
              id="subtask-update"
              placeholder="Describe progress on this subtask..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={255}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Proof image (optional)</Label>
            {imagePreview ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                  className="absolute top-2 right-2 p-1 bg-destructive/80 hover:bg-destructive rounded-full text-white"
                  disabled={isSubmitting}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label
                htmlFor={`evidence-${subtask.id}`}
                className="flex flex-col items-center justify-center w-full p-5 border-2 border-dashed border-border rounded-lg cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-colors"
              >
                <Upload className="h-5 w-5 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">Upload proof photo</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP — max 10MB</p>
                <input
                  id={`evidence-${subtask.id}`}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !description.trim()}>
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
