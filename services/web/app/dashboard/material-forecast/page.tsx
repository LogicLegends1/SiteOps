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
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Bell,
  Clock,
  Boxes,
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
      {/* Page Header - Premium Glassmorphic Feel */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-background to-background p-8 border border-primary/10 shadow-sm">
        <div className="relative z-10">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary font-bold uppercase tracking-widest text-[10px]">
            Operations Intel Module
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tighter flex items-center gap-3">
            <Package className="h-10 w-10 text-primary" />
            Material Forecasting <span className="text-primary/50">Engine</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl font-medium leading-relaxed">
            High-precision tracking and pulse-monitoring for site resources. 
            Leveraging real-time burn rates to predict shortages before they impact the critical path.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Stats Overview - Refined Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Inventory Size", value: stats.totalMaterials, icon: Boxes, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Critical Stock", value: stats.criticalCount, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", border: stats.criticalCount > 0 ? "border-destructive/50 shadow-lg shadow-destructive/5" : "" },
          { label: "Low Level", value: stats.lowStockCount, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
          { label: "Consumption Spikes", value: stats.materialsWithSpike, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Active Breaches", value: stats.activeAlerts, icon: Bell, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat, i) => (
          <Card key={i} className={cn("group transition-all hover:scale-[1.02] hover:shadow-md cursor-default", stat.border)}>
            <CardContent className="p-5">
              <div className="flex flex-col gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors group-hover:bg-opacity-20", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{stat.label}</p>
                  <p className={cn("text-3xl font-black tracking-tighter mt-0.5", stat.color)}>{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical Shortage Alert - High Visibility */}
      {stats.criticalCount > 0 && (
        <div className="relative overflow-hidden rounded-xl border-2 border-destructive bg-destructive/5 p-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-3 bg-destructive text-destructive-foreground rounded-lg shadow-lg">
              <AlertTriangle className="h-6 w-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-destructive uppercase tracking-tighter text-lg">Immediate Procurement Required</h3>
              <p className="text-sm font-semibold text-destructive/80 leading-relaxed uppercase tracking-tight">
                {liveMaterials
                  .filter((m) => m.stockLevel === "critical")
                  .map((m) => `${m.name} (${m.daysUntilShortage}D remaining)`)
                  .join(", ")}
              </p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 to-transparent" />
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column - Stock Overview (High Density) */}
        <div className="xl:col-span-12">
          <Card className="border-2 shadow-sm">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Inventory Pulse</CardTitle>
                </div>
                <div className="flex items-center gap-4 bg-background/50 p-2 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 px-2 border-r">
                    <div className="w-2.5 h-2.5 rounded-full bg-success" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Normal</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 border-r">
                    <div className="w-2.5 h-2.5 rounded-full bg-warning" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Low</span>
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Critical</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <StockOverview
                onSelectMaterial={setSelectedMaterial}
                selectedMaterialId={selectedMaterial?.id || null}
              />
            </CardContent>
          </Card>
        </div>

        {/* Analytics Row */}
        <div className="xl:col-span-7">
          <ConsumptionTrendChart 
            material={selectedMaterial} 
            materialsList={liveMaterials}
            onMaterialChange={setSelectedMaterial}
          />
        </div>

        <div className="xl:col-span-5">
          <MaterialAlertsPanel />
        </div>

        {/* Action Row */}
        <div className="xl:col-span-4 lg:col-span-6">
          <DailyConsumptionForm />
        </div>

        <div className="xl:col-span-8 lg:col-span-6">
          <AffectedActivitiesPanel selectedMaterial={selectedMaterial} />
        </div>
      </div>
    </div>
  )
}
