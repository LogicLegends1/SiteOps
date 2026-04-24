"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, AlertTriangle, CheckCircle, TrendingUp, Users } from "lucide-react"
import {
  activityWorkforceRequirements,
  getDisciplineLabel,
  getRoleLabel,
  getStaffingStatusColor,
  getTeamById,
  type ActivityWorkforceRequirement,
} from "@/lib/workforce-data"

export function ActivityWorkforceTable() {
  const [expandedActivities, setExpandedActivities] = useState<string[]>([])

  const toggleExpanded = (activityId: string) => {
    setExpandedActivities((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    )
  }

  const getStaffingIcon = (status: ActivityWorkforceRequirement["overallStatus"]) => {
    switch (status) {
      case "optimal":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "understaffed":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case "overstaffed":
        return <TrendingUp className="h-4 w-4 text-warning" />
    }
  }

  const calculatePercentage = (assigned: number, required: number) => {
    if (required === 0) return 100
    return Math.min((assigned / required) * 100, 100)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Activity Workforce Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {activityWorkforceRequirements.map((activity) => {
              const isExpanded = expandedActivities.includes(activity.activityId)
              const team = activity.assignedTeamId ? getTeamById(activity.assignedTeamId) : null
              const percentage = calculatePercentage(activity.totalAssigned, activity.totalRequired)
              const gap = activity.totalRequired - activity.totalAssigned

              return (
                <Collapsible
                  key={activity.activityId}
                  open={isExpanded}
                  onOpenChange={() => toggleExpanded(activity.activityId)}
                >
                  <div className="rounded-lg border border-border overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {getStaffingIcon(activity.overallStatus)}
                          <div className="text-left">
                            <p className="font-medium text-foreground">{activity.activityName}</p>
                            <p className="text-xs text-muted-foreground">{activity.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {team && (
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              {team.name}
                            </Badge>
                          )}

                          <div className="flex items-center gap-2 min-w-[140px]">
                            <Progress value={percentage} className="h-2 w-20" />
                            <span className="text-sm font-medium text-foreground">
                              {activity.totalAssigned}/{activity.totalRequired}
                            </span>
                          </div>

                          <Badge className={getStaffingStatusColor(activity.overallStatus)}>
                            {activity.overallStatus === "understaffed" && gap > 0 && `-${gap} `}
                            {activity.overallStatus}
                          </Badge>

                          <ChevronDown
                            className={`h-5 w-5 text-muted-foreground transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="border-t border-border bg-muted/30 p-4">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                              <TableHead className="text-muted-foreground">Discipline</TableHead>
                              <TableHead className="text-muted-foreground">Role</TableHead>
                              <TableHead className="text-muted-foreground text-center">Required</TableHead>
                              <TableHead className="text-muted-foreground text-center">Assigned</TableHead>
                              <TableHead className="text-muted-foreground text-center">Gap</TableHead>
                              <TableHead className="text-muted-foreground text-right">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activity.requirements.map((req, index) => {
                              const reqGap = req.requiredCount - req.assignedCount
                              return (
                                <TableRow key={index} className="border-border">
                                  <TableCell className="text-foreground">
                                    {getDisciplineLabel(req.discipline)}
                                  </TableCell>
                                  <TableCell className="text-foreground">
                                    {getRoleLabel(req.role)}
                                  </TableCell>
                                  <TableCell className="text-center text-foreground">
                                    {req.requiredCount}
                                  </TableCell>
                                  <TableCell className="text-center text-foreground">
                                    {req.assignedCount}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {reqGap > 0 ? (
                                      <span className="text-destructive font-medium">-{reqGap}</span>
                                    ) : reqGap < 0 ? (
                                      <span className="text-warning font-medium">+{Math.abs(reqGap)}</span>
                                    ) : (
                                      <span className="text-success">0</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Badge className={getStaffingStatusColor(req.status)}>
                                      {req.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
