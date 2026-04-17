"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getAlertSeverityColor,
  type MaterialAlert,
  materialAlerts as dummyAlerts
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
  const [alerts, setAlerts] = useState<MaterialAlert[]>([])

  useEffect(() => {
    fetch("http://localhost:8000/predict/alerts/1")
      .then((res) => res.json())
      .then((data) => setAlerts(data))
      .catch((err) => {
        console.error("Failed to fetch alerts", err)
        setAlerts(dummyAlerts)
      })
  }, [])

  const activeAlerts = alerts.filter((a) => !a.acknowledged)
  const acknowledgedAlerts = alerts.filter((a) => a.acknowledged)

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    )
  }

  const AlertCard = ({ alert, showAcknowledge = true }: { alert: MaterialAlert; showAcknowledge?: boolean }) => (
    <div
      className={`relative overflow-hidden p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
        alert.severity === "critical"
          ? "border-destructive bg-destructive/5"
          : alert.severity === "high"
          ? "border-warning bg-warning/5"
          : "border-border bg-card"
      }`}
    >
      {/* Decorative Severity Stripe */}
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
        alert.severity === "critical" ? "bg-destructive" : 
        alert.severity === "high" ? "bg-warning" : "bg-muted-foreground/30"
      }`} />

      <div className="flex items-start justify-between gap-4 pl-2">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`p-1.5 rounded-md ${
              alert.severity === "critical" ? "bg-destructive text-destructive-foreground font-black animate-pulse" : 
              alert.severity === "high" ? "bg-warning text-warning-foreground font-bold" : "bg-muted text-muted-foreground"
            }`}>
              <AlertTypeIcon type={alert.type} />
            </div>
            <h4 className="font-extrabold text-sm uppercase tracking-tight">{alert.materialName}</h4>
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-2">
              {getAlertTypeLabel(alert.type)}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium leading-relaxed">{alert.message}</p>
            
            <div className="flex flex-col gap-1 rounded-lg bg-background/50 p-3 border border-border/50">
              <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                <Check className="h-3 w-3" /> Recommended Action
              </span>
              <p className="text-sm font-bold text-primary italic leading-snug">
                "{alert.recommendation}"
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              {alert.affectedActivities.length > 0 && (
                <div className="flex -space-x-1">
                  {alert.affectedActivities.slice(0, 3).map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-background bg-secondary flex items-center justify-center">
                      <Activity className="h-2.5 w-2.5 text-muted-foreground" />
                    </div>
                  ))}
                  {alert.affectedActivities.length > 3 && (
                    <div className="w-5 h-5 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[8px] font-bold">
                      +{alert.affectedActivities.length - 3}
                    </div>
                  )}
                </div>
              )}
              <span className="text-[10px] text-muted-foreground font-medium italic">
                {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Issued {new Date(alert.createdAt).toLocaleDateString()}
              </span>
            </div>

            {showAcknowledge && !alert.acknowledged && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAcknowledge(alert.id)}
                className="h-8 text-[10px] font-black uppercase hover:bg-success hover:text-success-foreground"
              >
                Mark Handled
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Card className="border-2 shadow-xl bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tighter uppercase">Operations Control</CardTitle>
              <CardDescription className="text-xs font-semibold text-muted-foreground uppercase">Material Shortage & Trend Monitor</CardDescription>
            </div>
          </div>
          {activeAlerts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
              </span>
              <Badge variant="destructive" className="font-black text-xs px-2 py-0.5 border-2 border-destructive-foreground/20 uppercase tracking-tighter">
                {activeAlerts.length} Breach{activeAlerts.length > 1 ? "es" : ""}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-11 bg-muted/60 p-1 rounded-lg">
            <TabsTrigger value="active" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold uppercase text-[10px] tracking-widest transition-all">
              Live Feed
            </TabsTrigger>
            <TabsTrigger value="acknowledged" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold uppercase text-[10px] tracking-widest transition-all">
              Archive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <ScrollArea className="h-[520px] pr-4">
              {activeAlerts.length > 0 ? (
                <div className="space-y-4 pb-4">
                  {activeAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <Package className="h-12 w-12 opacity-10" />
                  <p className="font-black text-sm uppercase tracking-tighter opacity-30">All parameters stable</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="acknowledged" className="mt-6">
            <ScrollArea className="h-[520px] pr-4">
              {acknowledgedAlerts.length > 0 ? (
                <div className="space-y-4 pb-4">
                  {acknowledgedAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} showAcknowledge={false} />
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-3">
                   <p className="font-black text-sm uppercase tracking-tighter opacity-30">Archive empty</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
