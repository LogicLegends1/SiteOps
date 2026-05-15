"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, AlertCircle, AlertTriangle, Clock, Construction } from "lucide-react"

interface UtilizationDashboardProps {
  equipments: any[]
  allocations: any[]
}

export function UtilizationDashboard({ equipments, allocations }: UtilizationDashboardProps) {
  const activeEqIds = useMemo(() => new Set(allocations.map(a => a.eqId)), [allocations])
  
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
      <div className="rounded-[2.5rem] bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-zinc-800 bg-zinc-900/30 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white">Fleet Operational Matrix</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Real-time capacity and deployment audit</p>
          </div>
          <div className="flex gap-6">
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase text-zinc-400">Deployed</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-[10px] font-black uppercase text-zinc-400">Idle</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-[10px] font-black uppercase text-zinc-400">Offline</span>
             </div>
          </div>
        </div>
        
        <div className="divide-y divide-zinc-800">
          {Object.entries(
            equipments.reduce((acc, eq) => {
              if (!acc[eq.className]) acc[eq.className] = [];
              acc[eq.className].push(eq);
              return acc;
            }, {} as Record<string, typeof equipments>)
          ).map(([className, items]) => {
            const active = items.filter(i => activeEqIds.has(i.id)).length;
            const broken = items.filter(i => i.status === "under_repair").length;
            const idle = items.length - active - broken;
            
            return (
              <div key={className} className="grid grid-cols-12 items-center p-6 hover:bg-zinc-900/40 transition-all group">
                <div className="col-span-3 flex flex-col gap-1">
                  <span className="text-sm font-black text-white uppercase group-hover:text-blue-500 transition-colors">{className}</span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">{items.length} Total Units</span>
                </div>
                
                <div className="col-span-6 px-10">
                  <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden flex ring-1 ring-white/5">
                    <div style={{ width: `${(active/items.length)*100}%` }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                    <div style={{ width: `${(idle/items.length)*100}%` }} className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
                    <div style={{ width: `${(broken/items.length)*100}%` }} className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
                  </div>
                </div>

                <div className="col-span-3 grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-white">{active}</span>
                    <span className="text-[8px] font-black uppercase text-zinc-500">Active</span>
                  </div>
                  <div className="flex flex-col border-x border-zinc-800">
                    <span className="text-lg font-black text-white">{idle}</span>
                    <span className="text-[8px] font-black uppercase text-zinc-500">Standby</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-red-500">{broken}</span>
                    <span className="text-[8px] font-black uppercase text-zinc-500">Down</span>
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
