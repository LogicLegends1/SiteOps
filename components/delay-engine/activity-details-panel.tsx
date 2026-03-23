"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ActivityProgress, getRiskLevelColor } from "@/lib/delay-engine-data"
import {
  Calendar,
  Users,
  TrendingDown,
  TrendingUp,
  Clock,
  AlertTriangle,
  CloudRain,
  Target,
} from "lucide-react"
import { format, parseISO, differenceInDays } from "date-fns"

interface ActivityDetailsPanelProps {
  activity: ActivityProgress | null
}

export function ActivityDetailsPanel({ activity }: ActivityDetailsPanelProps) {
  if (!activity) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <Target className="h-10 w-10 mx-auto mb-2" />
            <p>Select an activity to view details</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const plannedDuration =
    activity.plannedEndDate && activity.plannedStartDate
      ? differenceInDays(parseISO(activity.plannedEndDate), parseISO(activity.plannedStartDate))
      : 0

  const estimatedDuration =
    activity.estimatedEndDate && activity.actualStartDate && activity.actualStartDate !== "-"
      ? differenceInDays(parseISO(activity.estimatedEndDate), parseISO(activity.actualStartDate))
      : plannedDuration

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{activity.zoneName}</p>
            <CardTitle className="text-foreground">{activity.activityName}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {activity.weatherSensitive && (
              <Badge variant="outline" className="border-primary text-primary">
                <CloudRain className="h-3 w-3 mr-1" />
                Weather Sensitive
              </Badge>
            )}
            <Badge className={`capitalize ${getRiskLevelColor(activity.riskLevel)}`}>
              {activity.riskLevel} risk
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Progress Comparison */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Progress Comparison</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Planned Progress</span>
                <span className="text-sm font-medium text-foreground">{activity.plannedProgress}%</span>
              </div>
              <Progress value={activity.plannedProgress} className="h-2 bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Actual Progress</span>
                <span className="text-sm font-medium text-foreground">{activity.actualProgress}%</span>
              </div>
              <Progress
                value={activity.actualProgress}
                className={`h-2 ${
                  activity.variance < -10
                    ? "[&>div]:bg-destructive"
                    : activity.variance < 0
                    ? "[&>div]:bg-warning"
                    : "[&>div]:bg-success"
                }`}
              />
            </div>
          </div>
          <div className="flex items-center justify-center p-3 rounded-lg bg-muted/30 border border-border">
            {activity.variance < 0 ? (
              <TrendingDown className="h-5 w-5 text-destructive mr-2" />
            ) : activity.variance > 0 ? (
              <TrendingUp className="h-5 w-5 text-success mr-2" />
            ) : null}
            <span
              className={`text-lg font-semibold ${
                activity.variance < 0
                  ? "text-destructive"
                  : activity.variance > 0
                  ? "text-success"
                  : "text-muted-foreground"
              }`}
            >
              {activity.variance > 0 ? "+" : ""}
              {activity.variance}% variance
            </span>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Timeline</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Planned Start</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {format(parseISO(activity.plannedStartDate), "MMM d, yyyy")}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Actual Start</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {activity.actualStartDate === "-"
                  ? "Not started"
                  : format(parseISO(activity.actualStartDate), "MMM d, yyyy")}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Planned End</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {format(parseISO(activity.plannedEndDate), "MMM d, yyyy")}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Estimated End</span>
              </div>
              <p
                className={`text-sm font-medium ${
                  activity.daysDelayed > 0 ? "text-destructive" : "text-foreground"
                }`}
              >
                {format(parseISO(activity.estimatedEndDate), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          {activity.daysDelayed > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive font-medium">
                {activity.daysDelayed} days behind schedule
              </span>
            </div>
          )}
        </div>

        <Separator className="bg-border" />

        {/* Team & Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Assigned Team</span>
            </div>
            <p className="text-sm font-medium text-foreground">{activity.assignedTeam}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Duration</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {plannedDuration} days planned / {estimatedDuration} days estimated
            </p>
          </div>
        </div>

        {/* Risk Factors */}
        {activity.riskFactors.length > 0 && (
          <>
            <Separator className="bg-border" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Risk Factors</h4>
              <div className="flex flex-wrap gap-2">
                {activity.riskFactors.map((factor, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-warning/50 text-warning bg-warning/10"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
