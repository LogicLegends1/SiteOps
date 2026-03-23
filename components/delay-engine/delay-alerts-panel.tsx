"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DelayAlert,
  getRiskLevelColor,
} from "@/lib/delay-engine-data"
import {
  AlertTriangle,
  Calendar,
  Cloud,
  Users,
  GitBranch,
  CheckCircle,
  Bell,
  ChevronRight,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface DelayAlertsPanelProps {
  alerts: DelayAlert[]
  onAcknowledge: (alertId: string) => void
}

function getAlertIcon(type: DelayAlert["type"]) {
  switch (type) {
    case "schedule":
      return Calendar
    case "weather":
      return Cloud
    case "resource":
      return Users
    case "dependency":
      return GitBranch
    default:
      return AlertTriangle
  }
}

export function DelayAlertsPanel({ alerts, onAcknowledge }: DelayAlertsPanelProps) {
  const [activeTab, setActiveTab] = useState<"active" | "acknowledged">("active")

  const activeAlerts = alerts.filter((a) => !a.acknowledged)
  const acknowledgedAlerts = alerts.filter((a) => a.acknowledged)

  const renderAlert = (alert: DelayAlert) => {
    const Icon = getAlertIcon(alert.type)

    return (
      <div
        key={alert.id}
        className={`rounded-lg border p-4 ${
          alert.acknowledged ? "border-border bg-card" : "border-warning/50 bg-warning/5"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`rounded-lg p-2 ${
                alert.acknowledged ? "bg-muted" : "bg-warning/20"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  alert.acknowledged ? "text-muted-foreground" : "text-warning"
                }`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{alert.activityName}</span>
                <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                  {alert.zoneName}
                </Badge>
                <Badge className={`text-xs capitalize ${getRiskLevelColor(alert.severity)}`}>
                  {alert.severity}
                </Badge>
              </div>
              <p className="text-sm text-foreground">{alert.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <ChevronRight className="h-3 w-3 text-primary" />
                <p className="text-xs text-primary">{alert.recommendation}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          {!alert.acknowledged && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAcknowledge(alert.id)}
              className="shrink-0 border-border text-foreground hover:bg-muted"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Acknowledge
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-warning" />
            Delay Alerts
          </CardTitle>
          {activeAlerts.length > 0 && (
            <Badge className="bg-destructive text-destructive-foreground">
              {activeAlerts.length} Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="w-full mb-4 bg-muted">
            <TabsTrigger value="active" className="flex-1 data-[state=active]:bg-background">
              Active ({activeAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="acknowledged" className="flex-1 data-[state=active]:bg-background">
              Acknowledged ({acknowledgedAlerts.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-3 mt-0">
            {activeAlerts.length > 0 ? (
              activeAlerts.map(renderAlert)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-10 w-10 mx-auto mb-2 text-success" />
                <p>No active alerts</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="acknowledged" className="space-y-3 mt-0">
            {acknowledgedAlerts.length > 0 ? (
              acknowledgedAlerts.map(renderAlert)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No acknowledged alerts</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
