"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ActivityProgress,
  getRiskLevelColor,
} from "@/lib/delay-engine-data"
import { TrendingDown, TrendingUp, Minus, AlertTriangle, CloudRain } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ActivityComparisonTableProps {
  activities: ActivityProgress[]
  onSelectActivity: (activity: ActivityProgress) => void
  selectedActivityId: string | null
}

export function ActivityComparisonTable({
  activities,
  onSelectActivity,
  selectedActivityId,
}: ActivityComparisonTableProps) {
  return (
    <TooltipProvider>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-muted-foreground">Zone / Activity</TableHead>
              <TableHead className="text-muted-foreground text-center">Planned</TableHead>
              <TableHead className="text-muted-foreground text-center">Actual</TableHead>
              <TableHead className="text-muted-foreground text-center">Variance</TableHead>
              <TableHead className="text-muted-foreground text-center">Days Delayed</TableHead>
              <TableHead className="text-muted-foreground text-center">Risk Level</TableHead>
              <TableHead className="text-muted-foreground">Risk Factors</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow
                key={activity.id}
                className={`cursor-pointer border-border transition-colors ${
                  selectedActivityId === activity.id
                    ? "bg-primary/10"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => onSelectActivity(activity)}
              >
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">{activity.zoneName}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{activity.activityName}</span>
                      {activity.weatherSensitive && (
                        <Tooltip>
                          <TooltipTrigger>
                            <CloudRain className="h-3.5 w-3.5 text-primary" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Weather sensitive activity</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.assignedTeam}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground">{activity.plannedProgress}%</span>
                    <Progress value={activity.plannedProgress} className="h-1.5 w-16 bg-muted" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground">{activity.actualProgress}%</span>
                    <Progress
                      value={activity.actualProgress}
                      className={`h-1.5 w-16 ${
                        activity.variance < -10
                          ? "[&>div]:bg-destructive"
                          : activity.variance < 0
                          ? "[&>div]:bg-warning"
                          : "[&>div]:bg-success"
                      }`}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    {activity.variance < 0 ? (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    ) : activity.variance > 0 ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span
                      className={`font-medium ${
                        activity.variance < 0
                          ? "text-destructive"
                          : activity.variance > 0
                          ? "text-success"
                          : "text-muted-foreground"
                      }`}
                    >
                      {activity.variance > 0 ? "+" : ""}
                      {activity.variance}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {activity.daysDelayed > 0 ? (
                    <span className="font-medium text-destructive">{activity.daysDelayed} days</span>
                  ) : (
                    <span className="text-muted-foreground">On track</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`${getRiskLevelColor(activity.riskLevel)} capitalize`}>
                    {activity.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {activity.riskFactors.length > 0 ? (
                      activity.riskFactors.slice(0, 2).map((factor, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-border text-muted-foreground">
                          {factor}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                    {activity.riskFactors.length > 2 && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                            +{activity.riskFactors.length - 2}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{activity.riskFactors.slice(2).join(", ")}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
