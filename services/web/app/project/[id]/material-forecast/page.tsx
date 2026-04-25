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
  const [activeTab, setActiveTab] = useState("ops")
  const [liveMaterials, setLiveMaterials] = useState<Material[]>([])
  const [liveAlerts, setLiveAlerts] = useState<any[]>([])
  const [liveStats, setLiveStats] = useState<any>({
    totalMaterials: 0,
    criticalCount: 0,
    lowStockCount: 0,
    usageSpikes: 0,
    activeAlerts: 0
  })

  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true)

  useEffect(() => {
    setIsLoadingAlerts(true)
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
      setIsLoadingAlerts(false)
    }).catch(err => {
      console.error(err)
      setIsLoadingAlerts(false)
    })
  }, [])

  const stats = liveStats // Use the server-provided stats instead of local calculation

  // Dynamic Risk Summary
  const riskTotal = liveAlerts.length || 1;
  const critical = liveAlerts.filter(a => a.severity === 'critical').length;
  const high = liveAlerts.filter(a => a.severity === 'high').length;
  const medium = liveAlerts.filter(a => a.severity === 'medium').length;
  const low = liveAlerts.filter(a => a.severity === 'low').length;

  const dynamicRiskStats = [
    { label: 'Critical', count: critical, pct: Math.round((critical/riskTotal)*100) + '%', color: 'bg-red-500' },
    { label: 'High', count: high, pct: Math.round((high/riskTotal)*100) + '%', color: 'bg-orange-500' },
    { label: 'Medium', count: medium, pct: Math.round((medium/riskTotal)*100) + '%', color: 'bg-yellow-500' },
    { label: 'Low', count: low, pct: Math.round((low/riskTotal)*100) + '%', color: 'bg-cyan-500' },
  ];

  // Dynamic Alert Types
  const typeCounts: Record<string, number> = liveAlerts.reduce((acc: Record<string, number>, alert: any) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {});
  
  const dynamicAlertTypes = Object.keys(typeCounts).map(type => {
    let label = type;
    let color = 'bg-cyan-500';
    if(type === 'critical_stock') { label = 'Stock Out'; color = 'bg-red-500'; }
    else if(type === 'low_stock') { label = 'Low Stock'; color = 'bg-orange-500'; }
    else if(type === 'usage_spike') { label = 'Usage Spike'; color = 'bg-purple-500'; }
    else if(type === 'delivery_delay') { label = 'Delivery Delay'; color = 'bg-red-400'; }
    return { label, count: typeCounts[type], pct: Math.round((typeCounts[type]/riskTotal)*100), color };
  }).sort((a, b) => b.count - a.count).slice(0, 5);

  // Dynamic Ring Chart Segments
  let currentOffset = 0;
  const ringSegments = dynamicRiskStats.map(stat => {
    const val = parseInt(stat.pct.replace('%', '')) || 0;
    const offset = currentOffset;
    currentOffset -= val;
    let strokeColor = "#3f3f46";
    if(stat.color === 'bg-red-500') strokeColor = "#ef4444";
    if(stat.color === 'bg-orange-500') strokeColor = "#f97316";
    if(stat.color === 'bg-yellow-500') strokeColor = "#eab308";
    if(stat.color === 'bg-cyan-500') strokeColor = "#0ea5e9";
    return { val, offset, strokeColor };
  });

  // Dynamic Zones Summary
  const zonesList = ["Zone A", "Zone B", "Zone C", "Zone D"];
  const getZoneForAlert = (alertId: string) => {
    let hash = 0
    for (let i = 0; i < alertId.length; i++) {
      hash = alertId.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % zonesList.length
    return zonesList[index]
  }

  const alertsByZone = liveAlerts.reduce((acc: Record<string, number>, alert: any) => {
    const z = getZoneForAlert(alert.id);
    acc[z] = (acc[z] || 0) + 1;
    return acc;
  }, {});

  const zoneColors = {
    "Zone A": "bg-cyan-500",
    "Zone B": "bg-purple-500",
    "Zone C": "bg-yellow-500",
    "Zone D": "bg-emerald-500",
  };

  const strokeColors = {
    "Zone A": "#0ea5e9",
    "Zone B": "#a855f7",
    "Zone C": "#eab308",
    "Zone D": "#10b981",
  };

  const dynamicZoneStats = zonesList.map(z => {
    const count = alertsByZone[z] || 0;
    const pct = liveAlerts.length > 0 ? Math.round((count / liveAlerts.length) * 100) : 0;
    return {
      label: z,
      count,
      pct: pct + '%',
      color: zoneColors[z as keyof typeof zoneColors] || "bg-zinc-500",
      strokeColor: strokeColors[z as keyof typeof strokeColors] || "#71717a",
      val: pct
    };
  });

  let zoneOffset = 0;
  const zoneSegments = dynamicZoneStats.map(stat => {
    const val = stat.val;
    const offset = zoneOffset;
    zoneOffset -= val;
    return { ...stat, offset };
  });

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* TABS SWITCHER */}
      <div className="w-full">
        <div className="px-6 border-b border-zinc-800/60 mb-6 mt-2">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab("ops")} 
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === "ops" ? "text-cyan-400 border-cyan-400" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}
            >
              Alerts & Incidents
            </button>
            <button 
              onClick={() => setActiveTab("inventory")} 
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === "inventory" ? "text-cyan-400 border-cyan-400" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}
            >
              Inventory Management
            </button>
            <button 
              onClick={() => setActiveTab("analytics")} 
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === "analytics" ? "text-cyan-400 border-cyan-400" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}
            >
              Forecast Analytics
            </button>
          </div>
        </div>

        {/* TAB 1: OPERATIONS COMMAND (TACTICAL) */}
        {activeTab === "ops" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-9">
              <MaterialAlertsPanel materialsList={liveMaterials} liveAlerts={liveAlerts} isLoading={isLoadingAlerts} />
            </div>
            <div className="lg:col-span-3 space-y-6">
              {/* RISK SUMMARY */}
              <div className="bg-[#11141D] border border-zinc-800/60 rounded-xl overflow-hidden shadow-lg p-5">
                <h3 className="text-[11px] font-bold text-white uppercase tracking-wider mb-6">Risk Summary</h3>
                <div className="flex items-center gap-6">
                  {/* Donut Chart placeholder */}
                  <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1f2937" strokeWidth="4"></circle>
                      {ringSegments.map((segment, idx) => (
                        <circle 
                          key={idx}
                          cx="18" cy="18" r="15.915" 
                          fill="transparent" 
                          stroke={segment.strokeColor} 
                          strokeWidth="4" 
                          strokeDasharray={`${segment.val} ${100 - segment.val}`} 
                          strokeDashoffset={segment.offset}
                        ></circle>
                      ))}
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white leading-none">{liveAlerts.length}</span>
                      <span className="text-[8px] text-zinc-500 uppercase mt-0.5">Total Alerts</span>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-col gap-2.5 flex-1">
                    {dynamicRiskStats.map(stat => (
                      <div key={stat.label} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${stat.color}`}></div>
                          <span className="text-zinc-300">{stat.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">{stat.count}</span>
                          <span className="text-zinc-600 w-8 text-right">({stat.pct})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full text-center mt-6 text-[10px] font-bold text-cyan-500 hover:text-cyan-400 uppercase tracking-wider">
                  View all alerts →
                </button>
              </div>

              {/* ALERTS BY ZONE */}
              <div className="bg-[#11141D] border border-zinc-800/60 rounded-xl overflow-hidden shadow-lg p-5">
                <h3 className="text-[11px] font-bold text-white uppercase tracking-wider mb-6">Alerts by Zone</h3>
                <div className="flex items-center gap-6">
                  {/* Donut Chart */}
                  <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1f2937" strokeWidth="4"></circle>
                      {zoneSegments.map((segment, idx) => (
                        <circle 
                          key={idx}
                          cx="18" cy="18" r="15.915" 
                          fill="transparent" 
                          stroke={segment.strokeColor} 
                          strokeWidth="4" 
                          strokeDasharray={`${segment.val} ${100 - segment.val}`} 
                          strokeDashoffset={segment.offset}
                        ></circle>
                      ))}
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white leading-none">{liveAlerts.length}</span>
                      <span className="text-[8px] text-zinc-500 uppercase mt-0.5">Total Alerts</span>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-col gap-2.5 flex-1">
                    {zoneSegments.map(stat => (
                      <div key={stat.label} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${stat.color}`}></div>
                          <span className="text-zinc-300">{stat.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">{stat.count}</span>
                          <span className="text-zinc-600 w-8 text-right">({stat.pct})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full text-center mt-6 text-[10px] font-bold text-cyan-500 hover:text-cyan-400 uppercase tracking-wider">
                  View zone details →
                </button>
              </div>

              {/* TOP ALERT TYPES */}
              <div className="bg-[#11141D] border border-zinc-800/60 rounded-xl overflow-hidden shadow-lg p-5">
                <h3 className="text-[11px] font-bold text-white uppercase tracking-wider mb-6">Top Alert Types</h3>
                <div className="flex flex-col gap-4">
                  {dynamicAlertTypes.map(stat => (
                    <div key={stat.label} className="flex items-center justify-between gap-4">
                      <span className="text-[10px] text-zinc-300 w-24 shrink-0">{stat.label}</span>
                      <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", stat.color)} style={{ width: `${stat.pct}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-white w-4 text-right">{stat.count}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full text-center mt-6 text-[10px] font-bold text-cyan-500 hover:text-cyan-400 uppercase tracking-wider">
                  View full analytics →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY LEDGER (LOGISTICAL) */}
        {activeTab === "inventory" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           <Card className="overflow-hidden border bg-card shadow-sm">
             <CardHeader className="border-b bg-muted/30 pb-6 pt-8">
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
          </div>
        )}

        {/* TAB 3: STRATEGIC ANALYTICS (INTEL) */}
        {activeTab === "analytics" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
            <ConsumptionTrendChart 
              material={selectedMaterial} 
              materialsList={liveMaterials}
              onMaterialChange={setSelectedMaterial}
            />
          </div>
        )}
      </div>
    </div>
  )
}
