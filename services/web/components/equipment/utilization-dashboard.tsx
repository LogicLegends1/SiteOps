"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, AlertCircle, AlertTriangle, Clock, Construction } from "lucide-react"

interface UtilizationDashboardProps {
  equipments: any[]
  stats: any
  filter: 'project' | 'company'
  setFilter: (filter: 'project' | 'company') => void
}

export function UtilizationDashboard({ equipments, stats: propStats, filter, setFilter }: UtilizationDashboardProps) {
  // Extract active IDs directly from the equipment objects
  const activeEqIds = useMemo(() => {
    return new Set(
      equipments
        .filter(e => e.activeActivityId)
        .map(e => String(e.id))
    )
  }, [equipments])
  
  const stats = useMemo(() => {
    const total = equipments.length
    const active = activeEqIds.size
    const idle = equipments.filter(e => e.status === "operational" && !activeEqIds.has(e.id))
    const broken = equipments.filter(e => e.status === "under_repair").length
    
    const activePercentage = total > 0 ? (active / total) * 100 : 0
    const idlePercentage = total > 0 ? (idle.length / total) * 100 : 0

    // Identify stalled activities due to breakdowns
    const stalledActivities = equipments
      .filter(e => e.status === "under_repair")
      .map(e => ({
        id: e.id,
        name: e.name,
        // In a real app, we'd link to the activity that *was* assigned to this unit
        lastActivity: "Foundation Piling - Zone A" 
      }))

    return { 
      total, 
      active, 
      idleCount: idle.length, 
      broken,
      activePercentage,
      idlePercentage,
      stalledActivities
    }
  }, [equipments, activeEqIds])

  return (
    <div className="space-y-10">
      {/* ANALYTICAL FLEET MATRIX */}
      <div className="rounded-[2.5rem] bg-zinc-950 border border-zinc-800 shadow-2xl">
        <div className="p-8 border-b border-zinc-800 bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight text-white">Asset Operational Status</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Current deployment and equipment availability breakdown</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'project' | 'company')}
                className="appearance-none bg-zinc-900/80 border border-zinc-700 hover:border-zinc-500 focus:border-blue-500 transition-colors text-white text-[10px] font-black uppercase tracking-widest py-2 pl-4 pr-10 rounded-xl outline-none cursor-pointer shadow-lg"
              >
                <option value="project">Current Project Scope</option>
                <option value="company">All Company Assets</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-800 hidden md:block" />

            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-tighter">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-tighter">Idle</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-tighter">Down</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-tighter">Maint</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-zinc-600 shadow-[0_0_8px_rgba(82,82,91,0.4)]" />
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-tighter">Yard</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-zinc-800">
          {Object.entries(
            equipments.reduce((acc, eq) => {
              const cName = eq.className || "Uncategorized";
              if (!acc[cName]) acc[cName] = [];
              acc[cName].push(eq);
              return acc;
            }, {} as Record<string, any[]>)
          )
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([className, items]) => {
            const total = items.length;
            
            // Mutually Exclusive Prioritized Status Resolution
            let active = 0, idle = 0, down = 0, maint = 0, yard = 0;

            items.forEach(i => {
              const s = (i.status || "").toLowerCase().trim();
              
              // 1. Maintenance & Down take absolute priority
              if (s === "maintenance" || s === "under_repair") maint++;
              else if (s === "down" || s === "broken") down++;
              // 2. Active status or live deployment
              else if (s === "active" || i.activeActivityId) active++;
              // 3. Explicitly Idle or unassigned operational
              else if (s === "idle" || s === "standby") idle++;
              // 4. Default to Yard
              else yard++;
            });

            const getP = (val: number) => total > 0 ? (val / total) * 100 : 0;
            
            return (
              <div key={className} className="grid grid-cols-12 items-center p-4 hover:bg-zinc-900/40 transition-all group border-b border-zinc-900 last:border-none">
                <div className="col-span-3 flex flex-col justify-center">
                  <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">{className}</span>
                </div>
                
                <div className="col-span-4 px-2">
                  <div className="h-2 w-full bg-zinc-900/50 rounded-full flex ring-1 ring-white/5 shadow-inner relative">
                    {[
                      { label: "Active", val: active, color: "bg-emerald-500", shadow: "shadow-[0_0_10px_rgba(16,185,129,0.3)]", rounded: "rounded-l-full" },
                      { label: "Idle", val: idle, color: "bg-amber-500", shadow: "shadow-[0_0_10px_rgba(245,158,11,0.3)]", rounded: "" },
                      { label: "Down", val: down, color: "bg-red-600", shadow: "shadow-[0_0_10px_rgba(220,38,38,0.3)]", rounded: "" },
                      { label: "Maint", val: maint, color: "bg-indigo-500", shadow: "shadow-[0_0_10px_rgba(99,102,241,0.3)]", rounded: "" },
                      { label: "Yard", val: yard, color: "bg-zinc-700", shadow: "", rounded: "rounded-r-full" }
                    ].map((seg, idx) => (
                      seg.val > 0 && (
                        <div 
                          key={idx}
                          style={{ width: `${getP(seg.val)}%` }} 
                          className={`h-full ${seg.color} ${seg.shadow} ${seg.rounded} transition-all hover:scale-y-150 hover:brightness-125 cursor-crosshair relative group/seg z-10 hover:z-50`}
                        >
                          {/* INSTANT PREMIUM TOOLTIP */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl opacity-0 group-hover/seg:opacity-100 pointer-events-none transition-all duration-75 translate-y-1 group-hover/seg:translate-y-0 min-w-[130px] border-t-blue-500 border-t-2">
                             <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">{seg.label} Status</span>
                                <div className="flex items-baseline justify-between gap-3">
                                   <span className="text-sm font-black text-white">{seg.val} <span className="text-[9px] text-zinc-500">Units</span></span>
                                   <span className="text-[11px] font-black text-blue-500">{Math.round(getP(seg.val))}%</span>
                                </div>
                             </div>
                             <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-900" />
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                <div className="col-span-1 flex flex-col items-center border-l border-zinc-800/50">
                   <span className="text-base font-black text-white">{total}</span>
                   <span className="text-[7px] font-black uppercase text-zinc-600">Total</span>
                </div>

                <div className="col-span-4 grid grid-cols-5 gap-2 text-center border-l border-zinc-800/50 pl-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-emerald-500">{active}</span>
                    <span className="text-[7px] font-black uppercase text-zinc-700">Active</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-amber-500">{idle}</span>
                    <span className="text-[7px] font-black uppercase text-zinc-700">Idle</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-red-500">{down}</span>
                    <span className="text-[7px] font-black uppercase text-zinc-700">Down</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-indigo-400">{maint}</span>
                    <span className="text-[7px] font-black uppercase text-zinc-700">Maint</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-zinc-500">{yard}</span>
                    <span className="text-[7px] font-black uppercase text-zinc-700">Yard</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECONDARY ANALYTICS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="bg-zinc-950 border-zinc-800 rounded-[2.5rem] shadow-2xl p-8 space-y-8">
            <div className="flex justify-between items-center">
               <h4 className="text-sm font-black uppercase tracking-widest text-white">Breakdown Attribution</h4>
               <Badge className="bg-red-500/10 text-red-500 border-red-900/30 text-[9px]">Critical</Badge>
            </div>
            <div className="space-y-4">
               {stats.stalledActivities.length > 0 ? (
                 stats.stalledActivities.map((stalled, i) => (
                   <div key={i} className="flex items-center gap-6 p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                      <div className="p-3 bg-red-500/10 rounded-xl">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                         <span className="text-xs font-black text-white uppercase">{stalled.lastActivity}</span>
                         <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">Down Machine: {stalled.name}</span>
                      </div>
                   </div>
                 ))
               ) : (
                 <p className="text-center py-10 text-[10px] font-black uppercase text-zinc-600">No operational blocks detected</p>
               )}
            </div>
         </Card>

         <Card className="bg-zinc-950 border-zinc-800 rounded-[2.5rem] shadow-2xl p-8 space-y-8">
            <div className="flex justify-between items-center">
               <h4 className="text-sm font-black uppercase tracking-widest text-white">Resource Pulse</h4>
               <Badge className="bg-blue-500/10 text-blue-500 border-blue-900/30 text-[9px]">Stable</Badge>
            </div>
            <div className="space-y-4">
               {equipments.filter(e => e.status === 'operational').slice(0, 3).map((eq, i) => (
                 <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                    <div className="flex flex-col gap-1">
                       <span className="text-xs font-black text-white uppercase">{eq.name}</span>
                       <span className="text-[10px] text-zinc-500 font-bold uppercase italic">Last Active: {new Date().toLocaleDateString()}</span>
                    </div>
                    <Badge className="bg-zinc-800 text-zinc-400 border-none text-[8px] font-black">STABLE</Badge>
                 </div>
               ))}
            </div>
         </Card>
      </div>
    </div>
  )
}
