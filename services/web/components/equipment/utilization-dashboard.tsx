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
    const idle = equipments.filter(e => e.status === "idle" && !activeEqIds.has(e.id))
    const broken = equipments.filter(e => e.status === "down").length
    
    const activePercentage = total > 0 ? (active / total) * 100 : 0
    const idlePercentage = total > 0 ? (idle.length / total) * 100 : 0

    // Identify stalled activities due to breakdowns
    const stalledActivities = equipments
      .filter(e => e.status === "down")
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
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col justify-between gap-6 border-b bg-muted/30 p-8 md:flex-row md:items-center">
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Asset Operational Status</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current deployment and equipment availability breakdown</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'project' | 'company')}
                className="cursor-pointer appearance-none rounded-xl border bg-background py-2 pl-4 pr-10 text-[10px] font-black uppercase tracking-widest text-foreground shadow-sm outline-none transition-colors hover:border-primary/50 focus:border-primary"
              >
                <option value="project">Current Project Scope</option>
                <option value="company">All Company Assets</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-border md:block" />

            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                  <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">Idle</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
                  <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">Down</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                  <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">Maint</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                  <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">Yard</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-border">
          {(Object.entries(
            equipments.reduce((acc, eq) => {
              const cName = eq.className || "Uncategorized";
              if (!acc[cName]) acc[cName] = [];
              acc[cName].push(eq);
              return acc;
            }, {} as Record<string, any[]>)
          ) as [string, any[]][])
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([className, items]) => {
            const total = items.length;
            
            // Mutually Exclusive Prioritized Status Resolution
            let active = 0, idle = 0, down = 0, maint = 0, yard = 0;

            items.forEach((i: any) => {
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
              <div key={className} className="group grid grid-cols-12 items-center border-b p-4 transition-all last:border-none hover:bg-muted/40">
                <div className="col-span-3 flex flex-col justify-center">
                  <span className="text-xs font-semibold text-muted-foreground transition-colors group-hover:text-foreground">{className}</span>
                </div>
                
                <div className="col-span-4 px-2">
                  <div className="relative flex h-2 w-full rounded-full bg-muted shadow-inner ring-1 ring-border">
                    {[
                      { label: "Active", val: active, color: "bg-emerald-500", shadow: "shadow-[0_0_10px_rgba(16,185,129,0.3)]", rounded: "rounded-l-full" },
                      { label: "Idle", val: idle, color: "bg-amber-500", shadow: "shadow-[0_0_10px_rgba(245,158,11,0.3)]", rounded: "" },
                      { label: "Down", val: down, color: "bg-red-600", shadow: "shadow-[0_0_10px_rgba(220,38,38,0.3)]", rounded: "" },
                      { label: "Maint", val: maint, color: "bg-indigo-500", shadow: "shadow-[0_0_10px_rgba(99,102,241,0.3)]", rounded: "" },
                      { label: "Yard", val: yard, color: "bg-muted-foreground/60", shadow: "", rounded: "rounded-r-full" }
                    ].map((seg, idx) => (
                      seg.val > 0 && (
                        <div 
                          key={idx}
                          style={{ width: `${getP(seg.val)}%` }} 
                          className={`h-full ${seg.color} ${seg.shadow} ${seg.rounded} transition-all hover:scale-y-150 hover:brightness-125 cursor-crosshair relative group/seg z-10 hover:z-50`}
                        >
                          {/* INSTANT PREMIUM TOOLTIP */}
                          <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-4 min-w-[130px] -translate-x-1/2 translate-y-1 rounded-lg border border-t-2 border-t-primary bg-popover px-3 py-2 text-popover-foreground opacity-0 shadow-xl transition-all duration-75 group-hover/seg:translate-y-0 group-hover/seg:opacity-100">
                             <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{seg.label} Status</span>
                                <div className="flex items-baseline justify-between gap-3">
                                   <span className="text-sm font-black text-foreground">{seg.val} <span className="text-[9px] text-muted-foreground">Units</span></span>
                                   <span className="text-[11px] font-black text-primary">{Math.round(getP(seg.val))}%</span>
                                </div>
                             </div>
                             <div className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-popover" />
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                <div className="col-span-1 flex flex-col items-center border-l">
                   <span className="text-base font-black text-foreground">{total}</span>
                   <span className="text-[7px] font-black uppercase text-muted-foreground">Total</span>
                </div>

                <div className="col-span-4 grid grid-cols-5 gap-2 border-l pl-4 text-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-emerald-500">{active}</span>
                    <span className="text-[7px] font-black uppercase text-muted-foreground">Active</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-amber-500">{idle}</span>
                    <span className="text-[7px] font-black uppercase text-muted-foreground">Idle</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-destructive">{down}</span>
                    <span className="text-[7px] font-black uppercase text-muted-foreground">Down</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{maint}</span>
                    <span className="text-[7px] font-black uppercase text-muted-foreground">Maint</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-muted-foreground">{yard}</span>
                    <span className="text-[7px] font-black uppercase text-muted-foreground">Yard</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECONDARY ANALYTICS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="space-y-8 rounded-2xl border bg-card p-8 shadow-sm">
            <div className="flex justify-between items-center">
               <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Breakdown Attribution</h4>
               <Badge className="border-destructive/30 bg-destructive/10 text-[9px] text-destructive">Critical</Badge>
            </div>
            <div className="space-y-4">
               {stats.stalledActivities.length > 0 ? (
                 stats.stalledActivities.map((stalled, i) => (
                   <div key={i} className="flex items-center gap-6 rounded-2xl border bg-muted/30 p-5">
                      <div className="rounded-xl bg-destructive/10 p-3">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="flex flex-col gap-1">
                         <span className="text-xs font-black uppercase text-foreground">{stalled.lastActivity}</span>
                         <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Down Machine: {stalled.name}</span>
                      </div>
                   </div>
                 ))
               ) : (
                 <p className="py-10 text-center text-[10px] font-black uppercase text-muted-foreground">No operational blocks detected</p>
               )}
            </div>
         </Card>

         <Card className="space-y-8 rounded-2xl border bg-card p-8 shadow-sm">
            <div className="flex justify-between items-center">
               <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Resource Pulse</h4>
               <Badge className="border-primary/30 bg-primary/10 text-[9px] text-primary">Stable</Badge>
            </div>
            <div className="space-y-4">
               {equipments.filter(e => e.status === 'active').slice(0, 3).map((eq, i) => (
                 <div key={i} className="flex items-center justify-between rounded-2xl border bg-muted/30 p-5">
                    <div className="flex flex-col gap-1">
                       <span className="text-xs font-black uppercase text-foreground">{eq.name}</span>
                       <span className="text-[10px] font-bold uppercase italic text-muted-foreground">Last Active: {new Date().toLocaleDateString()}</span>
                    </div>
                    <Badge className="border-none bg-muted text-[8px] font-black text-muted-foreground">STABLE</Badge>
                 </div>
               ))}
            </div>
         </Card>
      </div>
    </div>
  )
}
