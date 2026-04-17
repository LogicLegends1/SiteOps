"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  materials,
  getMaterialStats,
  type Material,
} from "@/lib/material-data"
import { StockOverview } from "@/components/material-forecast/stock-overview"
import { ConsumptionTrendChart } from "@/components/material-forecast/consumption-trend-chart"
import { MaterialAlertsPanel } from "@/components/material-forecast/material-alerts-panel"
import { AffectedActivitiesPanel } from "@/components/material-forecast/affected-activities-panel"
import { DailyConsumptionForm } from "@/components/material-forecast/daily-consumption-form"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Bell,
  Clock,
  Boxes,
  LayoutDashboard,
  ClipboardList,
  BarChart2,
  Activity,
  Zap,
} from "lucide-react"

export default function MaterialForecastPage() {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [liveMaterials, setLiveMaterials] = useState<Material[]>([])
  const [liveAlerts, setLiveAlerts] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/predict/shortage/all/1").then(res => res.json()),
      fetch("http://localhost:8000/predict/alerts/1").then(res => res.json())
    ]).then(([mats, alts]) => {
      setLiveMaterials(mats || [])
      setLiveAlerts(alts || [])
    }).catch(console.error)
  }, [])

  const stats = {
    totalMaterials: liveMaterials.length,
    criticalCount: liveMaterials.filter((m) => m.stockLevel === "critical").length,
    lowStockCount: liveMaterials.filter((m) => m.stockLevel === "low").length,
    activeAlerts: liveAlerts.filter((a) => !a.acknowledged).length,
    materialsWithSpike: liveMaterials.filter((m) => m.consumptionTrend === "spike" || m.consumptionTrend === "increasing").length,
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* PERSISTENT HEADER: Situational Awareness */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-background to-background p-8 border border-primary/10 shadow-sm">
        <div className="relative z-10">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary font-bold uppercase tracking-widest text-[10px]">
            Enterprise Material Intelligence
          </Badge>
          <div className="flex items-center gap-4">
             <div className="p-3 bg-primary/10 rounded-xl">
               <Package className="h-8 w-8 text-primary" />
             </div>
             <div>
               <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
                 Supply Chain <span className="text-primary/50 font-medium">Control</span>
               </h1>
               <p className="text-muted-foreground mt-2 font-bold uppercase text-[10px] tracking-widest opacity-60">Project Alpha: Colombo Metro Tower</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl opacity-50" />
      </div>

      {/* PERSISTENT STATS: Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Inventory Size", value: stats.totalMaterials, icon: Boxes, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Critical Shortage", value: stats.criticalCount, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", border: stats.criticalCount > 0 ? "border-destructive/50 ring-4 ring-destructive/5" : "" },
          { label: "Buffer Warnings", value: stats.lowStockCount, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
          { label: "Anomalous Usage", value: stats.materialsWithSpike, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Security Feed", value: stats.activeAlerts, icon: Bell, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat, i) => (
          <Card key={i} className={cn("group transition-all hover:-translate-y-1 hover:shadow-xl cursor-default border-2", stat.border)}>
            <CardContent className="p-5">
              <div className="flex flex-col gap-3">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-inner", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{stat.label}</p>
                  <p className={cn("text-3xl font-black tracking-tighter mt-1 leading-none", stat.color)}>{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DYNAMIC CONTENT: Tactical Tabbed Interface */}
      <Tabs defaultValue="ops" className="w-full space-y-8">
        <TabsList className="grid w-full grid-cols-3 max-w-3xl h-14 bg-muted/40 p-1.5 rounded-xl border-2">
          <TabsTrigger value="ops" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-black uppercase text-[10px] tracking-widest gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Operations Command
          </TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-black uppercase text-[10px] tracking-widest gap-2">
            <ClipboardList className="h-4 w-4" />
            Inventory Ledger
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg font-black uppercase text-[10px] tracking-widest gap-2">
            <BarChart2 className="h-4 w-4" />
            Strategic Analytics
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OPERATIONS COMMAND (TACTICAL) */}
        <TabsContent value="ops" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-8">
              <MaterialAlertsPanel />
              <AffectedActivitiesPanel selectedMaterial={selectedMaterial} />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary/20 shadow-inner">
                <div className="flex items-center gap-2 mb-6">
                  <Zap className="h-5 w-5 text-primary fill-primary" />
                  <h3 className="font-black uppercase tracking-tighter text-sm">Quick Log Signature</h3>
                </div>
                <DailyConsumptionForm />
              </div>
              
              <Card className="border-2 bg-card/60">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Activity className="h-3 w-3" /> System Diagnostics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-dashed">
                    <span className="text-xs font-bold text-muted-foreground uppercase">ML Engine Status</span>
                    <Badge variant="outline" className="text-[10px] border-success text-success bg-success/5 uppercase font-black tracking-tighter">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-dashed">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Sync Latency</span>
                    <span className="text-xs font-black tracking-tighter">14ms</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Last Oracle Update</span>
                    <span className="text-xs font-black tracking-tighter">Just Now</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: INVENTORY LEDGER (LOGISTICAL) */}
        <TabsContent value="inventory" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="border-2 shadow-2xl bg-card overflow-hidden">
             <CardHeader className="border-b bg-muted/20 pb-6 pt-8">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-primary rounded-xl shadow-lg shadow-primary/20">
                     <Boxes className="h-6 w-6 text-primary-foreground" />
                   </div>
                   <div>
                     <CardTitle className="text-2xl font-black uppercase tracking-tighter leading-none">Resource Matrix</CardTitle>
                     <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest mt-2 opacity-60">Comprehensive Project Specifications</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3 bg-background/80 backdrop-blur-md p-3 rounded-xl border-2 border-border shadow-sm">
                   <div className="flex items-center gap-2 px-3 border-r">
                     <div className="w-3 h-3 rounded-full bg-success ring-4 ring-success/10" />
                     <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Stable</span>
                   </div>
                   <div className="flex items-center gap-2 px-3 border-r">
                     <div className="w-3 h-3 rounded-full bg-warning ring-4 ring-warning/10" />
                     <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Low</span>
                   </div>
                   <div className="flex items-center gap-2 px-3">
                     <div className="w-3 h-3 rounded-full bg-destructive ring-4 ring-destructive/10 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Critical</span>
                   </div>
                 </div>
               </div>
             </CardHeader>
             <CardContent className="p-0">
               <StockOverview
                 onSelectMaterial={setSelectedMaterial}
                 selectedMaterialId={selectedMaterial?.id || null}
               />
             </CardContent>
           </Card>
        </TabsContent>

        {/* TAB 3: STRATEGIC ANALYTICS (INTEL) */}
        <TabsContent value="analytics" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          <ConsumptionTrendChart 
            material={selectedMaterial} 
            materialsList={liveMaterials}
            onMaterialChange={setSelectedMaterial}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
