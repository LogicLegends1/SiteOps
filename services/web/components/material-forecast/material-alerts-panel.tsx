"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  type Material,
  type MaterialAlert,
} from "@/lib/material-data"
import {
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  Bell,
  Activity,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

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
      return "Low"
    case "critical_stock":
      return "Critical"
    case "consumption_spike":
      return "Spike"
    case "shortage_predicted":
      return "Risk"
    default:
      return "Alert"
  }
}

export function MaterialAlertsPanel({ materialsList = [] }: { materialsList?: Material[] }) {
  const [alerts, setAlerts] = useState<MaterialAlert[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch("http://localhost:8000/predict/alerts/1")
      .then((res) => res.json())
      .then((data) => {
        // Force a client-side shuffle to ensure true randomization
        const shuffled = [...data];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setAlerts(shuffled);
      })
      .catch((err) => {
        console.error("Failed to fetch alerts", err)
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
    window.alert(`PROCUREMENT REQUESTED: Emergency restock for ${alert.materialName} initiated.`)
  }

  const AlertRow = ({ alert, showAcknowledge = true }: { alert: MaterialAlert; showAcknowledge?: boolean }) => {
    const isExpanded = expandedId === alert.id
    
    // Find material details for high-density metrics
    const material = materialsList.find(m => m.id === alert.materialId || String(m.id) === String(alert.materialId));

    return (
      <div
        className={cn(
          "group relative cursor-pointer overflow-hidden border-b border-border/40 transition-all hover:bg-muted/40",
          isExpanded && "bg-muted/30 pb-4"
        )}
        onClick={() => setExpandedId(isExpanded ? null : alert.id)}
      >
        <div className="flex items-center gap-6 pl-5 pr-8 py-7">
          {/* Icon & Name (Fixed Width for Alignment) */}
          <div className="flex items-center gap-4 w-[280px] shrink-0">
            <div className={cn(
              "p-3 rounded-2xl border flex items-center justify-center shrink-0",
              alert.severity === "critical" ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-warning/30 bg-warning/10 text-warning"
            )}>
              <AlertTypeIcon type={alert.type} />
            </div>
            <div className="flex flex-col gap-1 overflow-hidden">
               <span className={cn(
              "text-sm font-bold tracking-tight truncate",
              alert.severity === "critical" ? "text-foreground" : "text-muted-foreground"
            )} title={alert.materialName}>{alert.materialName}</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              ID: {alert.materialId}
            </span>
            </div>
          </div>

          {/* HIGH DENSITY METRICS GRID */}
          <div className="hidden lg:flex flex-1 items-center gap-8">
            {/* Balance */}
            <div className="flex flex-col gap-1 min-w-[100px]">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Balance</span>
              <span className="font-mono text-xs font-bold text-foreground">
                {Math.max(0, material?.available || 0).toFixed(2)} <span className="opacity-40">{material?.unit}</span>
              </span>
            </div>
            
            {/* Burn Rate */}
            <div className="flex flex-col gap-1 min-w-[100px]">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Daily Burn</span>
              <span className="font-mono text-xs font-bold text-foreground">
                {material?.dailyAvgConsumption?.toFixed(2) || 0} <span className="opacity-40">/ DAY</span>
              </span>
            </div>

            {/* Runway */}
            <div className="flex flex-col gap-1 min-w-[120px]">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Runway</span>
              {material?.daysUntilShortage !== null && material?.daysUntilShortage !== undefined ? (
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-black font-mono",
                    Math.max(0, material.daysUntilShortage) <= 3 ? "text-destructive" : "text-warning"
                  )}>
                    {Math.max(0, material.daysUntilShortage)} DAYS
                  </span>
                  <div className="h-1 w-8 overflow-hidden rounded-full bg-muted">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        Math.max(0, material.daysUntilShortage) <= 3 ? "bg-destructive" : "bg-warning"
                      )} 
                      style={{ width: `${Math.min(100, (Math.max(0, material.daysUntilShortage) / 14) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs font-bold text-muted-foreground">STABLE</span>
              )}
            </div>

            {/* Status Label (Integrated) */}
            <div className="flex flex-col gap-1 min-w-[100px]">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Stock Status</span>
               <div className="flex items-center gap-2">
                 <span className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    alert.severity === "critical" ? "bg-destructive animate-pulse" : "bg-warning"
                  )} />
                 <span className={cn(
                  "text-xs font-bold font-mono tracking-tight",
                  alert.severity === "critical" ? "text-destructive" : "text-warning"
                )}>
                  {getAlertTypeLabel(alert.type)}
                </span>
               </div>
            </div>
          </div>



          {/* Time & Expand */}
          <div className="flex items-center gap-6 ml-auto">
             <span className="whitespace-nowrap font-mono text-xs font-medium tracking-tight text-muted-foreground">
              {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
            {isExpanded ? <ChevronUp className="h-6 w-6 text-muted-foreground" /> : <ChevronDown className="h-6 w-6 text-muted-foreground" />}
          </div>
        </div>

        {/* Expanded Content (Sleek Redesign) */}
        {isExpanded && (
          <div className="pl-24 pr-12 pb-8 space-y-6 animate-in slide-in-from-top-2 duration-300">
            {/* Minimal Detail Card */}
            <div className="flex items-start gap-4 rounded-xl border bg-muted/30 px-6 py-4">
               <div className={cn(
                 "mt-1.5 h-1.5 w-1.5 rounded-full shrink-0",
                 alert.severity === "critical" ? "bg-destructive animate-pulse" : "bg-warning"
               )} />
               <p className="font-mono text-[11px] font-medium uppercase leading-relaxed tracking-wide text-muted-foreground">
                  {alert.message}
               </p>
            </div>
            
            {/* Inline Actions & Tasks */}
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                 {(alert.severity === "critical" || alert.severity === "high") && !alert.acknowledged && (
                  <Button 
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleRestockRequest(alert); }}
                    className="h-8 rounded-lg bg-primary px-6 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-sm hover:bg-primary/90"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-2" />
                    PROCURE
                  </Button>
                 )}
                {showAcknowledge && !alert.acknowledged && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleAcknowledge(alert.id); }}
                    className="h-8 rounded-lg px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    DISMISS
                  </Button>
                )}
              </div>

               <div className="flex items-center gap-3 rounded-full border bg-muted/30 py-1 pl-4 pr-1">
                  <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">Critical Impact:</span>
                  <div className="flex -space-x-2">
                    {alert.affectedActivities.slice(0, 3).map((_, i) => (
                      <div key={i} className="flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm">
                        <Activity className="h-3 w-3 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="overflow-hidden border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Bell className="h-6 w-6" />
          </div>
          <CardTitle className="text-base font-black tracking-widest uppercase">System Alerts</CardTitle>
        </div>
        {activeAlerts.length > 0 && (
          <Badge className="border-none bg-destructive px-4 py-1.5 text-xs font-black uppercase tracking-widest text-destructive-foreground shadow-sm hover:bg-destructive">
            {activeAlerts.length} Attention Required
          </Badge>
        )}
      </CardHeader>
      
      <Tabs defaultValue="active" className="w-full">
        <div className="border-b bg-muted/30 px-6 py-3">
          <TabsList className="flex h-10 w-fit gap-1 rounded-xl border bg-background p-1">
            <TabsTrigger 
              value="active" 
              className="h-8 rounded-lg px-8 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              PENDING
            </TabsTrigger>
            <TabsTrigger 
              value="acknowledged" 
              className="h-8 rounded-lg px-8 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              RESOLVED
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="mt-0">
          <ScrollArea className="h-[430px]">
            {activeAlerts.length > 0 ? (
              <div className="divide-y divide-border">
                {activeAlerts.map((alert) => (
                  <AlertRow key={alert.id} alert={alert} />
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-4 opacity-40">
                <Check className="h-12 w-12" />
                <p className="font-black text-xs uppercase tracking-widest">Workspace Clear</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="acknowledged" className="mt-0">
          <ScrollArea className="h-[430px]">
            {acknowledgedAlerts.length > 0 ? (
              <div className="divide-y divide-border">
                {acknowledgedAlerts.map((alert) => (
                  <AlertRow key={alert.id} alert={alert} showAcknowledge={false} />
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2 opacity-30">
                 <p className="font-black text-xs uppercase tracking-widest">No Archived Alerts</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
