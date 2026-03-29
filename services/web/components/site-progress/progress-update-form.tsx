"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type Zone, type IssuePriority } from "@/lib/site-data"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, Plus, TrendingUp } from "lucide-react"

interface ProgressUpdateFormProps {
  selectedZone: Zone | null
}

export function ProgressUpdateForm({ selectedZone }: ProgressUpdateFormProps) {
  const [progress, setProgress] = useState<number[]>([selectedZone?.progress || 0])
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // New blocker form state
  const [showBlockerForm, setShowBlockerForm] = useState(false)
  const [blockerTitle, setBlockerTitle] = useState("")
  const [blockerDescription, setBlockerDescription] = useState("")
  const [blockerType, setBlockerType] = useState<string>("")
  const [blockerPriority, setBlockerPriority] = useState<IssuePriority>("medium")

  const handleProgressUpdate = async () => {
    if (!selectedZone) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setShowSuccess(true)
    setNotes("")
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleBlockerSubmit = async () => {
    if (!selectedZone || !blockerTitle) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setShowBlockerForm(false)
    setBlockerTitle("")
    setBlockerDescription("")
    setBlockerType("")
    setBlockerPriority("medium")
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  if (!selectedZone) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Daily Progress Update
          </CardTitle>
          <CardDescription>Select a zone to update progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-center">
            <p className="text-muted-foreground">
              Select a zone from the map to update its daily progress
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Daily Progress Update
            </CardTitle>
            <CardDescription>
              Update progress for {selectedZone.name} - {selectedZone.activity}
            </CardDescription>
          </div>
          {showSuccess && (
            <div className="flex items-center gap-2 text-success text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Updated successfully</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Progress Slider */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="progress" className="text-foreground">
              Progress Percentage
            </Label>
            <span className="text-2xl font-bold text-primary">{progress[0]}%</span>
          </div>
          <Slider
            id="progress"
            value={progress}
            onValueChange={setProgress}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Previous: {selectedZone.progress}% | Change: {progress[0] - selectedZone.progress > 0 ? "+" : ""}
            {progress[0] - selectedZone.progress}%
          </p>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="notes" className="text-foreground">
            Update Notes
          </Label>
          <Textarea
            id="notes"
            placeholder="Describe what was completed today..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-secondary/50 border-border min-h-20"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleProgressUpdate}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Updating...
            </>
          ) : (
            "Update Progress"
          )}
        </Button>

        {/* Blocker Section */}
        <div className="border-t border-border pt-4">
          {!showBlockerForm ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowBlockerForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Log a Blocker / Issue
            </Button>
          ) : (
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-medium text-foreground">New Issue / Blocker</h4>

              <div className="flex flex-col gap-2">
                <Label htmlFor="blocker-title" className="text-foreground">
                  Issue Title
                </Label>
                <Input
                  id="blocker-title"
                  placeholder="Brief description of the issue"
                  value={blockerTitle}
                  onChange={(e) => setBlockerTitle(e.target.value)}
                  className="bg-secondary/50 border-border"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="blocker-type" className="text-foreground">
                    Issue Type
                  </Label>
                  <Select value={blockerType} onValueChange={setBlockerType}>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="material-delay">Material Delay</SelectItem>
                      <SelectItem value="equipment-failure">Equipment Failure</SelectItem>
                      <SelectItem value="labour-shortage">Labour Shortage</SelectItem>
                      <SelectItem value="safety-issue">Safety Issue</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="blocker-priority" className="text-foreground">
                    Priority
                  </Label>
                  <Select value={blockerPriority} onValueChange={(v) => setBlockerPriority(v as IssuePriority)}>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="blocker-description" className="text-foreground">
                  Description
                </Label>
                <Textarea
                  id="blocker-description"
                  placeholder="Detailed description of the issue..."
                  value={blockerDescription}
                  onChange={(e) => setBlockerDescription(e.target.value)}
                  className="bg-secondary/50 border-border min-h-20"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowBlockerForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleBlockerSubmit}
                  disabled={isSubmitting || !blockerTitle}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Issue"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
