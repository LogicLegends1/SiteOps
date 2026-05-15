"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { AlertCircle, Wrench, Search, LayoutDashboard, History, Activity, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { EquipmentStats } from "@/components/equipment/equipment-stats"
import { UtilizationDashboard } from "@/components/equipment/utilization-dashboard"
import { FleetRegistryPanel } from "@/components/equipment/fleet-registry-panel"
import { AllocationManagerPanel } from "@/components/equipment/allocation-manager-panel"
import { MaintenanceReliabilityPanel } from "@/components/equipment/maintenance-reliability-panel"
import { type EquipmentResponse } from "@/lib/equipment-data"

export default function EquipmentManagementPage() {
  const params = useParams()
  const projectId = params?.id
  
  const [data, setData] = useState<EquipmentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) return

    async function loadData() {
      try {
        setLoading(true)
        const res = await fetch(`/api/project/${projectId}/equipment`)
        if (!res.ok) throw new Error("Failed to fetch equipment data")
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [projectId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 opacity-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-xs font-black uppercase tracking-[0.3em]">Syncing Fleet Intelligence...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-2xl">
        <h2 className="text-xl font-bold text-destructive">System Offline</h2>
        <p className="text-sm text-muted-foreground mt-2">{error || "Could not synchronize with the equipment registry."}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* PROFESSIONAL OPERATIONS HEADER */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 p-10 rounded-[2.5rem] bg-zinc-950 border border-zinc-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Wrench className="h-40 w-40 rotate-12" />
        </div>
        
        <div className="flex items-center gap-10 relative z-10">
          <div className="p-7 bg-blue-600 rounded-[2rem] shadow-2xl shadow-blue-500/20 ring-1 ring-white/20">
            <Wrench className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-white">
              FLEET <span className="text-blue-500">CONTROL</span>
            </h1>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">
              Operational Intelligence & Asset Reliability
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <EquipmentStats summary={data.summary} />
        </div>
      </div>

      {/* MISSION CONTROL INTERFACE */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-8 items-start">
        {/* MAIN OPERATIONS HUB (TABS) */}
        <div className="2xl:col-span-9 space-y-8">
          <Tabs defaultValue="utilization" className="w-full">
            <TabsList className="flex w-full h-14 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 backdrop-blur-xl">
              <TabsTrigger value="utilization" className="flex-1 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[11px] tracking-widest transition-all">
                Operational Status
              </TabsTrigger>
              <TabsTrigger value="registry" className="flex-1 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[11px] tracking-widest transition-all">
                Asset Specifications
              </TabsTrigger>
              <TabsTrigger value="deployments" className="flex-1 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[11px] tracking-widest transition-all">
                Deployment Map
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex-1 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[11px] tracking-widest transition-all">
                Reliability & Service
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="utilization" className="animate-in fade-in zoom-in-95 duration-500 outline-none">
                <UtilizationDashboard equipments={data.equipment} allocations={[]} />
              </TabsContent>

              <TabsContent value="registry" className="animate-in fade-in zoom-in-95 duration-500 outline-none">
                <FleetRegistryPanel equipment={data.equipment} />
              </TabsContent>

              <TabsContent value="deployments" className="animate-in fade-in zoom-in-95 duration-500 outline-none">
                <AllocationManagerPanel equipment={data.equipment} />
              </TabsContent>

              <TabsContent value="maintenance" className="animate-in fade-in zoom-in-95 duration-500 outline-none">
                <MaintenanceReliabilityPanel equipment={data.equipment} logs={data.maintenanceLogs} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* CRITICAL INTEL SIDEBAR */}
        <div className="2xl:col-span-3 space-y-8">
           <div className="p-6 rounded-[2rem] bg-red-950/10 border border-red-900/20 space-y-6">
              <div className="flex items-center gap-3 text-red-500">
                <AlertCircle className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">Immediate Risks</span>
              </div>
              <div className="space-y-4">
                {data.equipment.filter(e => e.status === 'under_repair').slice(0, 3).map(eq => (
                  <div key={eq.id} className="p-4 rounded-2xl bg-zinc-950/50 border border-red-900/10 hover:border-red-500/30 transition-all cursor-pointer">
                    <span className="text-xs font-black text-white uppercase block mb-1">{eq.name}</span>
                    <span className="text-[10px] text-red-400 font-bold uppercase">Breakdown Impacting Foundation Zone</span>
                  </div>
                ))}
              </div>
           </div>

           <div className="p-6 rounded-[2rem] bg-blue-950/10 border border-blue-900/20 space-y-6">
              <div className="flex items-center gap-3 text-blue-500">
                <Wrench className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">Scheduled Ops</span>
              </div>
              <div className="space-y-4">
                {data.equipment.filter(e => e.nextServiceDate).slice(0, 2).map(eq => (
                  <div key={eq.id} className="p-4 rounded-2xl bg-zinc-950/50 border border-blue-900/10">
                    <span className="text-xs font-black text-white uppercase block mb-1">{eq.name}</span>
                    <span className="text-[10px] text-blue-400 font-bold uppercase italic">Service Due: {eq.nextServiceDate}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}