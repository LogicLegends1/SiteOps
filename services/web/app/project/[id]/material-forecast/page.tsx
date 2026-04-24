"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  type Material,
} from "@/lib/material-data"
import { StockOverview } from "@/components/material-forecast/stock-overview"
import { ConsumptionTrendChart } from "@/components/material-forecast/consumption-trend-chart"
import { MaterialAlertsPanel } from "@/components/material-forecast/material-alerts-panel"
import { AffectedActivitiesPanel } from "@/components/material-forecast/affected-activities-panel"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  Boxes,
  Activity,
} from "lucide-react"

export default function MaterialForecastPage() {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [liveMaterials, setLiveMaterials] = useState<Material[]>([])
  const [liveAlerts, setLiveAlerts] = useState<any[]>([])
  const [liveStats, setLiveStats] = useState<any>({
    totalMaterials: 0,
    criticalCount: 0,
    lowStockCount: 0,
    usageSpikes: 0,
    activeAlerts: 0
  })

  useEffect(() => {
    // 1. Fetch High-Level Telemetry Stats (Fast)
    fetch("http://localhost:8000/predict/shortage/stats/1")
      .then(res => res.json())
      .then(setLiveStats)
      .catch(console.error)

    // 2. Fetch Alerts and full list for reference panels
    Promise.all([
      fetch("http://localhost:8000/predict/shortage/all/1").then(res => res.json()),
      fetch("http://localhost:8000/predict/alerts/1").then(res => res.json())
    ]).then(([mats, alts]) => {
      // mats is now {data: [...], total: X}
      setLiveMaterials(mats?.data || [])
      setLiveAlerts(alts || [])
    }).catch(console.error)
  }, [])

  const stats = liveStats // Use the server-provided stats instead of local calculation

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* PROFESSIONAL DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-2xl bg-card border-2 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-md">
            <Package className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase leading-tight">
              Material <span className="text-primary font-bold">Forecasting</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
              Project Supply Chain Monitor
            </p>
          </div>
        </div>

        {/* HIGH-CONTRAST KPI TILES (DARK THEME OPTIMIZED) */}
        <div className="flex items-center flex-wrap gap-4">
          {[
            { label: "Total Assets", value: stats.totalMaterials, color: "text-blue-400", border: "border-blue-900/50", bg: "bg-blue-950/20" },
            { label: "Critical Stock", value: stats.criticalCount, color: "text-red-400", border: "border-red-900/50", bg: "bg-red-950/20" },
            { label: "Low Buffers", value: stats.lowStockCount, color: "text-orange-400", border: "border-orange-900/50", bg: "bg-orange-950/20" },
            { label: "Usage Spikes", value: stats.usageSpikes, color: "text-amber-400", border: "border-amber-900/50", bg: "bg-amber-950/20" },
            { label: "Active Alerts", value: stats.activeAlerts, color: "text-primary", border: "border-primary/20", bg: "bg-primary/10" },
          ].map((stat, i) => (
            <div key={i} className={cn(
              "flex flex-col min-w-[120px] p-4 rounded-xl border transition-all hover:bg-muted/10",
              stat.bg,
              stat.border
            )}>
              <span className="text-[10px] font-black uppercase text-slate-200 tracking-wider font-mono">{stat.label}</span>
              <span className={cn("text-2xl font-bold tracking-tighter mt-1", stat.color)}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NAVIGATION: Tabbed Interface */}
      <Tabs defaultValue="ops" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl h-12 bg-muted p-1 rounded-xl border-2">
          <TabsTrigger value="ops" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest gap-2">
            Alerts & Incidents
          </TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest gap-2">
            Inventory Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-black uppercase text-[10px] tracking-widest gap-2">
            Forecast Analytics
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OPERATIONS COMMAND (TACTICAL) */}
        <TabsContent value="ops" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <MaterialAlertsPanel materialsList={liveMaterials} />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <AffectedActivitiesPanel selectedMaterial={selectedMaterial} liveMaterials={liveMaterials} />
              
              <Card className="border-2 bg-card/40 backdrop-blur-md">
                <CardHeader className="pb-3 border-b border-dashed">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <Activity className="h-3 w-3" /> Core Telemetry
                    </CardTitle>
                    <Badge variant="outline" className="text-[8px] border-success text-success animate-pulse uppercase">Sync Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="opacity-50">Engine Latency</span>
                    <span className="font-black">1.2ms</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="opacity-50">API Throughput</span>
                    <span className="font-black text-primary">High</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic pt-2 border-t border-dashed">
                    <span>Last Integrity Check</span>
                    <span>14:48:27</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: INVENTORY LEDGER (LOGISTICAL) */}
        <TabsContent value="inventory" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           <Card className="border-2 shadow-2xl bg-card overflow-hidden">
             <CardHeader className="border-b bg-muted/20 pb-6 pt-8">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-primary rounded-xl shadow-lg shadow-primary/20">
                     <Boxes className="h-6 w-6 text-primary-foreground" />
                   </div>
                   <div>
                     <CardTitle className="text-xl font-black uppercase tracking-tighter leading-none">Material Specifications</CardTitle>
                     <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.3em] mt-2 opacity-50">Enterprise Catalog Search</p>
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
        <TabsContent value="analytics" className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
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
