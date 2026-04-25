"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type Activity } from "@/lib/site-data"
import {
  issues,
  getIssuesByActivityId,
  getPriorityColor,
  getIssueStatusColor,
} from "@/lib/issues-data"
import { AlertTriangle, Package, Wrench, Users, Shield, HelpCircle, Clock } from "lucide-react"

interface IssuesListProps {
  selectedActivity: Activity | null
}

function getIssueTypeIcon(type: string) {
  switch (type) {
    case "material-delay":
      return Package
    case "equipment-failure":
      return Wrench
    case "labour-shortage":
      return Users
    case "safety-issue":
      return Shield
    default:
      return HelpCircle
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function IssuesList({ selectedActivity }: IssuesListProps) {
  const displayedIssues = selectedActivity
    ? getIssuesByActivityId(selectedActivity.zoneID)
    : issues

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Issues & Blockers
            </CardTitle>
            <CardDescription>
              {selectedActivity
                ? `Issues for ${selectedActivity.name}`
                : "All active issues across activities"}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-muted-foreground">
            {displayedIssues.length} {displayedIssues.length === 1 ? "issue" : "issues"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {displayedIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active issues</p>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedZone
                ? "This zone has no reported issues"
                : "All zones are clear of issues"}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="flex flex-col gap-3">
              {displayedIssues.map((issue) => {
                const TypeIcon = getIssueTypeIcon(issue.type)

                return (
                  <div
                    key={issue.id}
                    className="flex flex-col gap-2 p-4 rounded-lg bg-secondary/50 border border-border/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-xs font-mono text-muted-foreground">{issue.id}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(issue.priority)} variant="secondary">
                          {issue.priority}
                        </Badge>
                        <Badge className={getIssueStatusColor(issue.status)} variant="secondary">
                          {issue.status.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>

                    <h4 className="text-sm font-medium text-foreground">{issue.title}</h4>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{issue.owner}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(issue.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}