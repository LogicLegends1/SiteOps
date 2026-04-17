"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { type Zone, getStatusColor } from "@/lib/site-data"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Users,
  User,
  Clock,
  MapPin,
  Activity,
  CalendarClock,
} from "lucide-react"

interface ZoneDetailsProps {
  zone: Zone | null
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "completed":
      return "bg-success text-success-foreground"
    case "in-progress":
      return "bg-primary text-primary-foreground"
    case "delayed":
      return "bg-destructive text-destructive-foreground"
    case "not-started":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function ZoneDetails({ zone }: ZoneDetailsProps) {
  if (!zone) {
    return (
      <Card className="bg-card border-border h-full">
        <CardHeader>
          <CardTitle className="text-foreground">Zone Details</CardTitle>
          <CardDescription>Select a zone on the map to view details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No zone selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click on any zone in the map to see its details
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              {zone.name}
              <div className={cn("h-2.5 w-2.5 rounded-full", getStatusColor(zone.status))} />
            </CardTitle>
            <CardDescription className="mt-1">{zone.activity}</CardDescription>
          </div>
          <Badge className={getStatusBadgeVariant(zone.status)}>
            {zone.status.replace("-", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Progress Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{zone.progress}%</span>
          </div>
          <Progress value={zone.progress} className="h-2" />
        </div>

        <Separator />

        {/* Activity Details */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Activity Details
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {zone.description}
          </p>
        </div>

        <Separator />

        {/* Team Assignment */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-foreground">Assignment</h4>
          <div className="grid gap-3">
            {zone.assignedTeam && (
              <div className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                <Users className="h-4 w-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Assigned Team</span>
                  <span className="text-sm font-medium text-foreground">{zone.assignedTeam}</span>
                </div>
              </div>
            )}
            {zone.assignedSupervisor && (
              <div className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                <User className="h-4 w-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Supervisor</span>
                  <span className="text-sm font-medium text-foreground">{zone.assignedSupervisor}</span>
                </div>
              </div>
            )}
            {!zone.assignedTeam && !zone.assignedSupervisor && (
              <p className="text-xs text-muted-foreground">No assignments yet</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Timeline */}
        {(zone.startDate || zone.expectedCompletion) && (
          <>
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                Project Timeline
              </h4>
              <div className="grid gap-3">
                {zone.startDate && (
                  <div className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Start Date</span>
                      <span className="text-sm font-medium text-foreground">
                        {formatDate(zone.startDate)}
                      </span>
                    </div>
                  </div>
                )}
                {zone.expectedCompletion && (
                  <div className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                    <Clock className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Expected Completion</span>
                      <span className="text-sm font-medium text-foreground">
                        {formatDate(zone.expectedCompletion)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
