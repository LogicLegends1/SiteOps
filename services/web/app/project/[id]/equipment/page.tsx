"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { AlertCircle, Wrench, Search, LayoutDashboard, History, Activity, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { EquipmentStats } from "@/components/equipment/equipment-stats"
import { UtilizationDashboard } from "@/components/equipment/utilization-dashboard"
import { EquipmentRegistryPanel } from "@/components/equipment/equipment-registry-panel"
import { AllocationManagerPanel } from "@/components/equipment/allocation-manager-panel"
import { MaintenanceReliabilityPanel } from "@/components/equipment/maintenance-reliability-panel"
import { type EquipmentResponse } from "@/lib/equipment-data"

export default function EquipmentManagementPage() {
  const params = useParams()
  const projectId = params?.id
  
  const [data, setData] = useState<EquipmentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'project' | 'company'>('project')

  useEffect(() => {
    if (!projectId) return

    async function loadData() {
      try {
        setLoading(true)
        const res = await fetch(`/api/project/${projectId}/equipment?filter=${filter}&t=${Date.now()}`, { cache: 'no-store' })
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
  }, [projectId, filter])

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 opacity-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-xs font-black uppercase tracking-[0.3em]">Synchronizing Asset Registry...</span>
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
      <div className="group relative flex flex-col items-start justify-between gap-8 overflow-hidden rounded-2xl border bg-card/95 p-10 shadow-sm xl:flex-row xl:items-center">
        <div className="pointer-events-none absolute right-0 top-0 p-12 opacity-5">
          <Wrench className="h-40 w-40 rotate-12" />
        </div>
        
        <div className="flex items-center gap-10 relative z-10">
          <div className="rounded-2xl bg-primary p-7 shadow-md">
            <Wrench className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-foreground">
              EQUIPMENT & <span className="text-primary">ASSET CONTROL</span>
            </h1>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">
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
            <TabsList className="flex h-14 w-full rounded-2xl border bg-muted/60 p-1.5">
              <TabsTrigger value="utilization" className="flex-1 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Operational Status
              </TabsTrigger>
              <TabsTrigger value="registry" className="flex-1 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Asset Catalog
              </TabsTrigger>
              <TabsTrigger value="deployments" className="flex-1 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Deployment Map
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex-1 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Reliability & Service
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="utilization" className="animate-in fade-in zoom-in-95 duration-500 outline-none">
                <UtilizationDashboard 
                  equipments={data.equipment} 
                  stats={data.summary} 
                  filter={filter} 
                  setFilter={setFilter} 
                />
              </TabsContent>

              <TabsContent value="registry" className="animate-in fade-in zoom-in-95 duration-500 outline-none">
                <EquipmentRegistryPanel equipment={data.equipment} />
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
           <div className="space-y-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">Immediate Risks</span>
              </div>
              <div className="space-y-4">
                {data.equipment.filter(e => e.status === 'down').slice(0, 3).map(eq => (
                  <div key={eq.id} className="cursor-pointer rounded-2xl border bg-card p-4 transition-all hover:border-destructive/40">
                    <span className="mb-1 block text-xs font-black uppercase text-foreground">{eq.name}</span>
                    <span className="text-[10px] font-bold uppercase text-destructive">Breakdown Impacting Foundation Zone</span>
                  </div>
                ))}
              </div>
           </div>

           <div className="space-y-6 rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-center gap-3 text-primary">
                <Wrench className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">Scheduled Ops</span>
              </div>
              <div className="space-y-4">
                {data.equipment.filter(e => e.nextServiceDate).slice(0, 2).map(eq => (
                  <div key={eq.id} className="rounded-2xl border bg-card p-4">
                    <span className="mb-1 block text-xs font-black uppercase text-foreground">{eq.name}</span>
                    <span className="text-[10px] font-bold uppercase italic text-primary">Service Due: {eq.nextServiceDate}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
