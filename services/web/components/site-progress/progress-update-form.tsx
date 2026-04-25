"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type Activity } from "@/lib/site-data"
import { ActivityStatusBadge } from "@/components/site-progress/activity-status-badge"
import { ActivityTimeline } from "@/components/site-progress/activity-timeline"
import { ProgressUpdateModal } from "@/components/site-progress/progress-update-modal"
import { TrendingUp } from "lucide-react"

interface ProgressUpdateFormProps {
  selectedActivity: Activity | null
}

export function ProgressUpdateForm({ selectedActivity }: ProgressUpdateFormProps) {
  if (!selectedActivity) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Activity Progress Update
          </CardTitle>
          <CardDescription>Select an activity to update progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-center">
            <p className="text-muted-foreground">
              Select an activity from the map to submit a progress update
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progress Updates
            </CardTitle>
            <CardDescription className="mt-1">
              {selectedActivity.name} - {selectedActivity.activity}
            </CardDescription>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-3">
          <ActivityStatusBadge status={selectedActivity.status} size="md" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Recent Updates Timeline */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="text-xs font-semibold text-muted-foreground mb-3">Recent Updates</div>
          <ActivityTimeline updates={selectedActivity.progressUpdates ? selectedActivity.progressUpdates.slice(0, 3) : []} />
        </div>

        {/* Add Progress Update Button */}
        <div className="border-t border-border pt-4">
          <ProgressUpdateModal activity={selectedActivity} />
        </div>
      </CardContent>
    </Card>
  )
}
