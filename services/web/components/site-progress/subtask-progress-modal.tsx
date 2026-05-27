"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { type Subtask } from "@/lib/subtasks-data"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Upload, X, ImagePlus } from "lucide-react"

interface SubtaskProgressModalProps {
  subtask: Subtask
  onSubmit: (description: string, photoUrls: string[]) => Promise<void> | void
}

interface ImageEntry {
  file: File
  preview: string
}

export function SubtaskProgressModal({ subtask, onSubmit }: SubtaskProgressModalProps) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<ImageEntry[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setDescription("")
    setImages([])
    setError(null)
    setIsSubmitting(false)
  }

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = 6 - images.length
    const toAdd = files.slice(0, remaining)
    toAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, { file, preview: reader.result as string }])
      }
      reader.readAsDataURL(file)
    })
    if (inputRef.current) inputRef.current.value = ""
  }

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch(`/api/subtask/${subtask.id}/logs/evidence`, {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Image upload failed")
    return data.url as string
  }

  const handleSubmit = async () => {
    if (!description.trim()) return
    setIsSubmitting(true)
    setError(null)

    try {
      const photoUrls: string[] = []
      for (const img of images) {
        const url = await uploadFile(img.file)
        photoUrls.push(url)
      }
      await onSubmit(description.trim(), photoUrls)
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
      <DialogContent className="max-w-lg">
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
            <div className="flex items-center justify-between">
              <Label>Proof photos (optional, up to 6)</Label>
              {images.length > 0 && images.length < 6 && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={isSubmitting}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  Add more
                </button>
              )}
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-border">
                    <img src={img.preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      disabled={isSubmitting}
                      className="absolute top-1 right-1 p-0.5 bg-destructive/80 hover:bg-destructive rounded-full text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <label
                htmlFor={`evidence-${subtask.id}`}
                className="flex flex-col items-center justify-center w-full p-5 border-2 border-dashed border-border rounded-lg cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-colors"
              >
                <Upload className="h-5 w-5 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">Upload proof photos</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP — max 10MB each, up to 6</p>
              </label>
            )}

            <input
              ref={inputRef}
              id={`evidence-${subtask.id}`}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              onChange={handleFilesChange}
              className="hidden"
              disabled={isSubmitting}
            />
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
