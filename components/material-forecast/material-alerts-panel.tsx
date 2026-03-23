"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  materialAlerts,
  getAlertSeverityColor,
  type MaterialAlert,
} from "@/lib/material-data"
import {
  AlertTriangle,
  Package,
  TrendingUp,
  Clock,
  Check,
  Bell,
  Activity,
} from "lucide-react"

function AlertTypeIcon({ type }: { type: MaterialAlert["type"] }) {
  switch (type) {
    case "low_stock":
      return <Package className="h-4 w-4" />
    case "critical_stock":
      return <AlertTriangle className="h-4 w-4" />
    case "consumption_spike":
      return <TrendingUp className="h-4 w-4" />
    case "shortage_predicted":
      return <Clock className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

function getAlertTypeLabel(type: MaterialAlert["type"]): string {
  switch (type) {
    case "low_stock":
      return "Low Stock"
    case "critical_stock":
      return "Critical Stock"
    case "consumption_spike":
      return "Consumption Spike"
    case "shortage_predicted":
      return "Shortage Predicted"
    default:
      return "Alert"
  }
}

export function MaterialAlertsPanel() {
  const [alerts, setAlerts] = useState(materialAlerts)

  const activeAlerts = alerts.filter((a) => !a.acknowledged)
  const acknowledgedAlerts = alerts.filter((a) => a.acknowledged)

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    )
  }

  const AlertCard = ({ alert, showAcknowledge = true }: { alert: MaterialAlert; showAcknowledge?: boolean }) => (
    <div
      className={`p-4 rounded-lg border bg-card ${
        alert.severity === "critical"
          ? "border-destructive/50"
          : alert.severity === "high"
          ? "border-warning/50"
          : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-full ${
              alert.severity === "critical"
                ? "bg-destructive/20 text-destructive"
                : alert.severity === "high"
                ? "bg-warning/20 text-warning"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <AlertTypeIcon type={alert.type} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{alert.materialName}</span>
              <Badge variant="outline" className="text-xs">
                {getAlertTypeLabel(alert.type)}
              </Badge>
              <Badge className={`text-xs ${getAlertSeverityColor(alert.severity)}`}>
                {alert.severity}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{alert.message}</p>
            <p className="text-xs text-primary">{alert.recommendation}</p>

            {/* Affected Activities */}
            {alert.affectedActivities.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap mt-2">
                <Activity className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Affects:</span>
                {alert.affectedActivities.map((activity, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {activity}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              {new Date(alert.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        {showAcknowledge && !alert.acknowledged && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAcknowledge(alert.id)}
            className="shrink-0"
          >
            <Check className="h-4 w-4 mr-1" />
            Ack
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Material Alerts
          </CardTitle>
          {activeAlerts.length > 0 && (
            <Badge variant="destructive">{activeAlerts.length} Active</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active">
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">
              Active ({activeAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="acknowledged" className="flex-1">
              Acknowledged ({acknowledgedAlerts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {activeAlerts.length > 0 ? (
                <div className="space-y-3">
                  {activeAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  No active alerts
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="acknowledged" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {acknowledgedAlerts.length > 0 ? (
                <div className="space-y-3">
                  {acknowledgedAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} showAcknowledge={false} />
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  No acknowledged alerts
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
