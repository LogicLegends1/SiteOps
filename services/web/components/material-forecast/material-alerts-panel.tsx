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
  ShoppingCart,
  ArrowUpRight,
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

  const handleRestockRequest = (alert: MaterialAlert) => {
    // Mock procurement trigger
    window.alert(`PROCUREMENT REQUESTED: Emergency restock for ${alert.materialName} initiated. Requisition #OPS-${Math.floor(Math.random() * 10000)}`)
  }

  const AlertCard = ({ alert, showAcknowledge = true }: { alert: MaterialAlert; showAcknowledge?: boolean }) => (
    <div
      className={`relative overflow-hidden p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
        alert.severity === "critical"
          ? "border-destructive bg-destructive/5 shadow-[0_0_20px_rgba(239,68,68,0.05)]"
          : alert.severity === "high"
          ? "border-warning bg-warning/5"
          : "border-border bg-card"
      }`}
    >
      {/* Decorative Severity Stripe */}
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
        alert.severity === "critical" ? "bg-destructive shadow-[2px_0_10px_rgba(239,68,68,0.5)]" : 
        alert.severity === "high" ? "bg-warning" : "bg-muted-foreground/30"
      }`} />

      <div className="flex items-start justify-between gap-4 pl-2">
        <div className="flex-1 space-y-4">
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

          <div className="space-y-3">
            <p className="text-sm font-bold leading-relaxed opacity-90">{alert.message}</p>
            
            <div className="flex flex-col gap-1 rounded-lg bg-background/50 p-3 border-2 border-primary/10 shadow-inner">
              <span className="text-[10px] font-black uppercase text-primary flex items-center gap-1.5">
                <Check className="h-3 w-3" /> Recommended Action
              </span>
              <p className="text-sm font-black text-foreground italic leading-snug">
                "{alert.recommendation}"
              </p>
            </div>

            {(alert.severity === "critical" || alert.severity === "high") && !alert.acknowledged && (
              <Button 
                onClick={() => handleRestockRequest(alert)}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-xs tracking-widest gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                <ShoppingCart className="h-4 w-4" />
                Initiate Emergency Restock
                <ArrowUpRight className="h-3 w-3 opacity-50" />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t-2 border-border/20">
            <div className="flex items-center gap-3">
              {alert.affectedActivities.length > 0 && (
                <div className="flex -space-x-1">
                  {alert.affectedActivities.slice(0, 3).map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-secondary flex items-center justify-center">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                    </div>
                  ))}
                  {alert.affectedActivities.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-black">
                      +{alert.affectedActivities.length - 3}
                    </div>
                  )}
                </div>
              )}
              <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-tight">
                {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(alert.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {showAcknowledge && !alert.acknowledged && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAcknowledge(alert.id)}
                className="h-8 text-[10px] font-black uppercase hover:bg-success hover:text-success-foreground px-3"
              >
                Dismiss Feed
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Card className="border-2 shadow-2xl bg-card/60 backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-4 border-b-2 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary rounded-xl shadow-lg shadow-primary/20">
              <Bell className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tighter uppercase leading-none">Intelligence Feed</CardTitle>
              <CardDescription className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Real-time Anomaly Detection</CardDescription>
            </div>
          </div>
          {activeAlerts.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="font-black text-[10px] px-3 py-1 border-2 border-destructive shadow-lg shadow-destructive/20 animate-pulse uppercase tracking-widest">
                {activeAlerts.length} High Risks
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/60 p-1.5 rounded-xl border-2">
            <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-black uppercase text-[10px] tracking-widest transition-all">
              Live Priority
            </TabsTrigger>
            <TabsTrigger value="acknowledged" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-black uppercase text-[10px] tracking-widest transition-all">
              History Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-8">
            <ScrollArea className="h-[550px] pr-4">
              {activeAlerts.length > 0 ? (
                <div className="space-y-6 pb-6">
                  {activeAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-muted-foreground gap-4">
                  <div className="p-6 bg-success/10 rounded-full">
                    <Check className="h-12 w-12 text-success opacity-40" />
                  </div>
                  <p className="font-black text-xs uppercase tracking-[0.2em] opacity-40">Operational Status Nominal</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="acknowledged" className="mt-8">
            <ScrollArea className="h-[550px] pr-4">
              {acknowledgedAlerts.length > 0 ? (
                <div className="space-y-6 pb-6">
                  {acknowledgedAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} showAcknowledge={false} />
                  ))}
                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-muted-foreground gap-4">
                   <p className="font-black text-xs uppercase tracking-[0.2em] opacity-40">Log archive empty</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
