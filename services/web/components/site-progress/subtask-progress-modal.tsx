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
import { type Subtask } from "@/lib/subtasks-data"
import { Plus } from "lucide-react"

interface SubtaskProgressModalProps {
  subtask: Subtask
  onSubmit: (description: string) => void
}

export function SubtaskProgressModal({ subtask, onSubmit }: SubtaskProgressModalProps) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")

  const handleSubmit = () => {
    if (!description.trim()) return
    onSubmit(description.trim())
    setDescription("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <div className="space-y-2">
            <Label htmlFor="subtask-update">Update description</Label>
            <Input
              id="subtask-update"
              placeholder="Describe progress on this subtask..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={255}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!description.trim()}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
