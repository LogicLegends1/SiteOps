"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Activity } from "@/lib/site-data"
import { ActivityStatusBadge } from "@/components/site-progress/activity-status-badge"
import { ActivityTimeline } from "@/components/site-progress/activity-timeline"
import { ProgressUpdateModal } from "@/components/site-progress/progress-update-modal"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Users,
  User,
  Clock,
  MapPin,
  Activity as ActivityIcon,
  CalendarClock,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
} from "lucide-react"
import { issues, getIssuesByActivityId, getPriorityColor, getIssueStatusColor } from "@/lib/issues-data"

interface ActivityDetailsPanelProps {
  activity: Activity | null
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getIssueTypeIcon(type: string) {
  switch (type) {
    case "material-delay":
      return "📦"
    case "equipment-failure":
      return "🔧"
    case "labour-shortage":
      return "👥"
    case "safety-issue":
      return "⚠️"
    default:
      return "❓"
  }
}

export function ActivityDetailsPanel({ activity }: ActivityDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const activityIssues = activity ? getIssuesByActivityId(activity.zoneID) : []

  if (!activity) {
    return (
      <Card className="bg-card border-border h-full">
        <CardHeader>
          <CardTitle className="text-foreground">Activity Details</CardTitle>
          <CardDescription>Select an activity on the map to view details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No activity selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click on any activity in the map to see its details
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-foreground text-lg">{activity.name}</CardTitle>
            <CardDescription className="mt-1">{activity.activity}</CardDescription>
          </div>
        </div>

        {/* Status Badge - Primary */}
        <div className="mt-3">
          <ActivityStatusBadge status={activity.status} size="lg" />
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        <div className="border-b border-border px-6">
          <TabsList className="grid w-full grid-cols-4 bg-transparent">
            <TabsTrigger value="overview" className="border-b-2 border-transparent data-[state=active]:border-primary text-xs">
              <ActivityIcon className="h-3 w-3 mr-1.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="timeline" className="border-b-2 border-transparent data-[state=active]:border-primary text-xs">
              <TrendingUp className="h-3 w-3 mr-1.5" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="blockers" className="border-b-2 border-transparent data-[state=active]:border-primary text-xs">
              <AlertTriangle className="h-3 w-3 mr-1.5" />
              Blockers
            </TabsTrigger>
            <TabsTrigger value="details" className="border-b-2 border-transparent data-[state=active]:border-primary text-xs">
              <MessageSquare className="h-3 w-3 mr-1.5" />
              Details
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-4 px-6 flex-1 overflow-y-auto space-y-4">
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-0">
            {/* Quick Status Info */}
            <div className="p-3 rounded-lg bg-secondary/30 border border-border space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Current Status</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activity.description || "No description provided"}
              </p>
            </div>

            <Separator className="my-2" />

            {/* Team Assignment */}
            {(activity.assignedTeam || activity.assignedSupervisor) && (
              <>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Assignment
                  </h4>
                  <div className="grid gap-2">
                    {activity.assignedTeam && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-xs font-medium">Team:</span>
                        <span>{activity.assignedTeam}</span>
                      </div>
                    )}
                    {activity.assignedSupervisor && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-xs font-medium">Supervisor:</span>
                        <span>{activity.assignedSupervisor}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Separator className="my-2" />
              </>
            )}

            {/* Schedule Info */}
            {(activity.startDate || activity.expectedCompletion) && (
              <>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Schedule
                  </h4>
                  <div className="grid gap-2">
                    {activity.startDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs font-medium">Start:</span>
                        <span>{formatDate(activity.startDate)}</span>
                      </div>
                    )}
                    {activity.expectedCompletion && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs font-medium">Target:</span>
                        <span>{formatDate(activity.expectedCompletion)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4 mt-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Progress Updates
              </h4>
              <ProgressUpdateModal activity={activity} />
            </div>
            <ActivityTimeline updates={activity.progressUpdates || []} />
          </TabsContent>

          {/* Blockers Tab */}
          <TabsContent value="blockers" className="space-y-4 mt-0">
            {activityIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <AlertTriangle className="h-8 w-8 text-success mb-2" />
                <p className="text-sm text-muted-foreground">No blockers reported</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityIssues.map((issue) => (
                  <div key={issue.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{getIssueTypeIcon(issue.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-foreground">{issue.title}</span>
                          <Badge variant="outline" className={cn("text-xs", getPriorityColor(issue.priority))}>
                            {issue.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{issue.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("text-xs", getIssueStatusColor(issue.status))}>
                            {issue.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{issue.owner}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-3 mt-0 text-xs">
            <div className="p-2 rounded bg-secondary/30 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Zone ID:</span>
                <span className="font-semibold text-foreground">{activity.zoneID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Project ID:</span>
                <span className="font-semibold text-foreground">{activity.projectID}</span>
              </div>
              {activity.createdAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Created:</span>
                  <span className="font-semibold text-foreground">{formatDate(activity.createdAt)}</span>
                </div>
              )}
              {activity.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Updated:</span>
                  <span className="font-semibold text-foreground">{formatDate(activity.updatedAt)}</span>
                </div>
              )}
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
