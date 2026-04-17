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
          "group relative overflow-hidden transition-all border-b border-border/40 hover:bg-white/5 cursor-pointer",
          isExpanded && "bg-muted/30 pb-4"
        )}
        onClick={() => setExpandedId(isExpanded ? null : alert.id)}
      >
        <div className="flex items-center gap-6 pl-5 pr-8 py-7">
          {/* Icon & Name (Fixed Width for Alignment) */}
          <div className="flex items-center gap-4 w-[280px] shrink-0">
            <div className={cn(
              "p-3 rounded-2xl border flex items-center justify-center shrink-0",
              alert.severity === "critical" ? "bg-red-950/20 border-red-500/40 text-red-500" : "bg-slate-800/20 border-slate-700 text-slate-500"
            )}>
              <AlertTypeIcon type={alert.type} />
            </div>
            <div className="flex flex-col gap-1 overflow-hidden">
               <span className={cn(
              "text-sm font-bold tracking-tight truncate",
              alert.severity === "critical" ? "text-slate-100" : "text-slate-400"
            )} title={alert.materialName}>{alert.materialName}</span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              ID: {alert.materialId}
            </span>
            </div>
          </div>

          {/* HIGH DENSITY METRICS GRID */}
          <div className="hidden lg:flex flex-1 items-center gap-8">
            {/* Balance */}
            <div className="flex flex-col gap-1 min-w-[100px]">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Balance</span>
              <span className="text-xs font-bold font-mono text-slate-200">
                {Math.max(0, material?.available || 0).toFixed(2)} <span className="opacity-40">{material?.unit}</span>
              </span>
            </div>
            
            {/* Burn Rate */}
            <div className="flex flex-col gap-1 min-w-[100px]">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Daily Burn</span>
              <span className="text-xs font-bold font-mono text-slate-200">
                {material?.dailyAvgConsumption?.toFixed(2) || 0} <span className="opacity-40">/ DAY</span>
              </span>
            </div>

            {/* Runway */}
            <div className="flex flex-col gap-1 min-w-[120px]">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Runway</span>
              {material?.daysUntilShortage !== null && material?.daysUntilShortage !== undefined ? (
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-black font-mono",
                    Math.max(0, material.daysUntilShortage) <= 3 ? "text-red-500" : "text-orange-400"
                  )}>
                    {Math.max(0, material.daysUntilShortage)} DAYS
                  </span>
                  <div className="h-1 w-8 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        Math.max(0, material.daysUntilShortage) <= 3 ? "bg-red-500" : "bg-orange-500"
                      )} 
                      style={{ width: `${Math.min(100, (Math.max(0, material.daysUntilShortage) / 14) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-500">STABLE</span>
              )}
            </div>

            {/* Status Label (Integrated) */}
            <div className="flex flex-col gap-1 min-w-[100px]">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Stock Status</span>
               <div className="flex items-center gap-2">
                 <span className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    alert.severity === "critical" ? "bg-red-500 animate-pulse" : "bg-slate-500"
                  )} />
                 <span className={cn(
                  "text-xs font-bold font-mono tracking-tight",
                  alert.severity === "critical" ? "text-red-500" : "text-orange-400"
                )}>
                  {getAlertTypeLabel(alert.type)}
                </span>
               </div>
            </div>
          </div>



          {/* Time & Expand */}
          <div className="flex items-center gap-6 ml-auto">
             <span className="text-xs font-mono text-slate-500 font-medium tracking-tight whitespace-nowrap">
              {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
            {isExpanded ? <ChevronUp className="h-6 w-6 text-slate-500" /> : <ChevronDown className="h-6 w-6 text-slate-500" />}
          </div>
        </div>

        {/* Expanded Content (Sleek Redesign) */}
        {isExpanded && (
          <div className="pl-24 pr-12 pb-8 space-y-6 animate-in slide-in-from-top-2 duration-300">
            {/* Minimal Detail Card */}
            <div className="flex items-start gap-4 py-4 px-6 rounded-xl bg-slate-900/30 border border-slate-800/50">
               <div className={cn(
                 "mt-1.5 h-1.5 w-1.5 rounded-full shrink-0",
                 alert.severity === "critical" ? "bg-red-500 animate-pulse" : "bg-slate-500"
               )} />
               <p className="text-[11px] font-mono font-medium text-slate-400 leading-relaxed uppercase tracking-wide">
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
                    className="h-8 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase text-[10px] tracking-widest px-6 rounded-lg shadow-lg shadow-sky-900/20"
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
                    className="h-8 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 px-4 rounded-lg"
                  >
                    DISMISS
                  </Button>
                )}
              </div>

               <div className="flex items-center gap-3 bg-slate-900/40 pl-4 pr-1 py-1 rounded-full border border-slate-800/50">
                  <span className="text-[9px] font-black uppercase text-slate-600 tracking-tighter">Critical Impact:</span>
                  <div className="flex -space-x-2">
                    {alert.affectedActivities.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border border-slate-950 bg-slate-800 flex items-center justify-center shadow-md">
                        <Activity className="h-3 w-3 text-slate-500" />
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
    <Card className="border-2 shadow-sm bg-card overflow-hidden">
      <CardHeader className="py-5 px-6 border-b-2 bg-muted/30 flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-md">
            <Bell className="h-6 w-6" />
          </div>
          <CardTitle className="text-base font-black tracking-widest uppercase">System Alerts</CardTitle>
        </div>
        {activeAlerts.length > 0 && (
          <Badge className="font-black text-xs px-4 py-1.5 bg-red-600 hover:bg-red-600 text-white uppercase tracking-widest shadow-md border-none">
            {activeAlerts.length} Attention Required
          </Badge>
        )}
      </CardHeader>
      
      <Tabs defaultValue="active" className="w-full">
        <div className="px-6 py-3 bg-slate-900/40 border-b border-slate-800/60">
          <TabsList className="flex w-fit h-10 bg-black/40 p-1 rounded-xl border border-slate-800/50 gap-1">
            <TabsTrigger 
              value="active" 
              className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-500 font-black uppercase text-[10px] tracking-[0.15em] px-8 h-8 transition-all hover:text-slate-300"
            >
              PENDING
            </TabsTrigger>
            <TabsTrigger 
              value="acknowledged" 
              className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-500 font-black uppercase text-[10px] tracking-[0.15em] px-8 h-8 transition-all hover:text-slate-300"
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
