"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import { AlertTriangle, Wrench, Search, MapPin, Construction, Calendar, Plus, Download, ChevronDown, List, Grid, ShieldAlert, ShieldCheck, CheckCircle2, Clock, Activity, MoreHorizontal, Maximize2 } from "lucide-react"
import { type EquipmentResponse } from "@/lib/equipment-data"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const EquipmentLeafletMap = dynamic(
  () => import("@/components/equipment/leaflet-map").then(mod => ({ default: mod.EquipmentLeafletMap })),
  {
    ssr: false,
    loading: () => <div className="bg-zinc-950/80 border-border rounded-lg p-4 h-full flex items-center justify-center text-muted-foreground animate-pulse text-xs font-bold uppercase tracking-widest">Initializing live OpenStreetMap layers...</div>
  }
)

export default function UnifiedEquipmentDashboard() {
  const params = useParams()
  const projectId = params?.id
  
  const [data, setData] = useState<EquipmentResponse | null>(null)
  const [zones, setZones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("catalog")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedProject, setSelectedProject] = useState("all")
  const [selectedZone, setSelectedZone] = useState("all")
  const [selectedMaint, setSelectedMaint] = useState("all")
  const [selectedMapAssetId, setSelectedMapAssetId] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) return

    async function loadData() {
      try {
        setLoading(true)
        
        let url = `/api/project/${projectId}/equipment?filter=company`
        if (activeTab === "catalog") {
          url += `&page=${currentPage}&limit=10`
            + `&search=${encodeURIComponent(searchQuery)}`
            + `&class=${encodeURIComponent(selectedClass)}`
            + `&status=${encodeURIComponent(selectedStatus)}`
            + `&project=${encodeURIComponent(selectedProject)}`
            + `&zone=${encodeURIComponent(selectedZone)}`
            + `&maint=${encodeURIComponent(selectedMaint)}`
        }
        url += `&t=${Date.now()}`

        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error("Failed to fetch equipment data")
        const json = await res.json()
        setData(json)

        // Fetch actual site map zones
        const zonesRes = await fetch(`/api/project/${projectId}/zones?t=${Date.now()}`, { cache: 'no-store' })
        if (zonesRes.ok) {
          const zonesJson = await zonesRes.json()
          setZones(zonesJson.zones || [])
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [projectId, activeTab, currentPage, searchQuery, selectedClass, selectedStatus, selectedProject, selectedZone, selectedMaint])

  useEffect(() => {
    const eqList = data?.equipment
    if (eqList && eqList.length > 0 && !selectedMapAssetId) {
      const activeOrIdle = eqList.find(e => e.status === "active" || e.status === "idle")
      if (activeOrIdle) {
        setSelectedMapAssetId(activeOrIdle.id)
      } else {
        setSelectedMapAssetId(eqList[0].id)
      }
    }
  }, [data, selectedMapAssetId])

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <Activity className="h-10 w-10 animate-pulse text-primary" />
        <span className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Initializing Asset Catalog...</span>
      </div>
    )
  }

  const eq = data.equipment
  const uniqueClasses = data.uniqueClasses || []
  const uniqueProjects = data.uniqueProjects || []
  const uniqueZones = data.uniqueZones || []

  // Server-side filtered and paginated equipment list
  const filteredEq = eq

  const totalAssets = data.summary.total
  const activeCount = data.summary.active
  const idleCount = data.summary.idle
  const maintCount = data.summary.maintenanceDueCount
  const downCount = data.summary.underRepair
  const unassignedCount = data.summary.unassigned ?? 0

  const avgUtil = 72 // Mock average for display
  const serviceDueCount = data.summary.serviceDueCount ?? 0
  const filteredCount = data.filteredCount ?? totalAssets

  return (
    <div className="flex flex-col gap-6 min-h-screen bg-background text-foreground pb-12 font-sans selection:bg-blue-500/30">
      
      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4 px-6 pt-6">
        {/* Total Assets */}
        <div className="flex flex-col gap-3 p-4 bg-card border border-border dark:bg-[#11141D] dark:border-zinc-800/60 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <Grid className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Assets</span>
                <span className="text-2xl font-semibold text-foreground dark:text-white mt-0.5">{totalAssets}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
             <span className="text-[10px] text-zinc-500">All Machinery</span>
             <span className="text-[10px] text-emerald-500 font-medium">↑ 6 vs last 7 days</span>
          </div>
        </div>

        {/* Active */}
        <div className="flex flex-col gap-3 p-4 bg-card border border-border dark:bg-[#11141D] dark:border-zinc-800/60 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Active</span>
                <span className="text-2xl font-semibold text-foreground dark:text-white mt-0.5">{activeCount}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
             <span className="text-[10px] text-zinc-500">{Math.round((activeCount/totalAssets)*100)}% of total</span>
             <span className="text-[10px] text-emerald-500 font-medium">↑ 5 vs last 7 days</span>
          </div>
        </div>

        {/* Idle */}
        <div className="flex flex-col gap-3 p-4 bg-card border border-border dark:bg-[#11141D] dark:border-zinc-800/60 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 text-amber-500 rounded-full">
                <Clock className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Idle</span>
                <span className="text-2xl font-semibold text-foreground dark:text-white mt-0.5">{idleCount}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
             <span className="text-[10px] text-zinc-500">{Math.round((idleCount/totalAssets)*100)}% of total</span>
             <span className="text-[10px] text-red-500 font-medium">↓ 2 vs last 7 days</span>
          </div>
        </div>

        {/* Maintenance */}
        <div className="flex flex-col gap-3 p-4 bg-card border border-border dark:bg-[#11141D] dark:border-zinc-800/60 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">In Maintenance</span>
                <span className="text-2xl font-semibold text-foreground dark:text-white mt-0.5">{maintCount}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
             <span className="text-[10px] text-zinc-500">{Math.round((maintCount/totalAssets)*100)}% of total</span>
             <span className="text-[10px] text-emerald-500 font-medium">↑ 1 vs last 7 days</span>
          </div>
        </div>

        {/* Down / At Risk */}
        <div className="flex flex-col gap-3 p-4 bg-card border border-border dark:bg-[#11141D] dark:border-zinc-800/60 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Down / At Risk</span>
                <span className="text-2xl font-semibold text-foreground dark:text-white mt-0.5">{downCount}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
             <span className="text-[10px] text-zinc-500">{Math.round((downCount/totalAssets)*100)}% of total</span>
             <span className="text-[10px] text-emerald-500 font-medium">↑ 2 vs last 7 days</span>
          </div>
        </div>

        {/* Unassigned */}
        <div className="flex flex-col gap-3 p-4 bg-card border border-border dark:bg-[#11141D] dark:border-zinc-800/60 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-800/50 text-zinc-400 rounded-lg">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Unassigned</span>
                <span className="text-2xl font-semibold text-foreground dark:text-white mt-0.5">{unassignedCount}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
             <span className="text-[10px] text-zinc-500">{totalAssets > 0 ? Math.round((unassignedCount/totalAssets)*100) : 0}% of total</span>
             <span className="text-[10px] text-zinc-500 font-medium">Yard / Storage</span>
          </div>
        </div>

        {/* Service Due */}
        <div className="flex flex-col gap-3 p-4 bg-card border border-border dark:bg-[#11141D] dark:border-zinc-800/60 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Service Due Soon</span>
                <span className="text-2xl font-semibold text-foreground dark:text-white mt-0.5">{serviceDueCount}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
             <span className="text-[10px] text-zinc-500">Next 7 days</span>
             <span className="text-[10px] text-cyan-500 font-medium hover:underline cursor-pointer">View schedule →</span>
          </div>
        </div>
      </div>

      {/* TABS SWITCHER */}
      <div className="px-6 border-b border-border">
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab("catalog")} 
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === "catalog" ? "text-cyan-500 border-cyan-500" : "text-muted-foreground border-transparent hover:text-foreground"}`}
          >
            Asset Catalog
          </button>
          <button 
            onClick={() => setActiveTab("map")} 
            className={`hidden pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === "map" ? "text-cyan-500 border-cyan-500" : "text-muted-foreground border-transparent hover:text-foreground"}`}
          >
            Geospatial Map
          </button>
          <button 
            onClick={() => setActiveTab("service")} 
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === "service" ? "text-cyan-500 border-cyan-500" : "text-muted-foreground border-transparent hover:text-foreground"}`}
          >
            Service Schedule
          </button>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      {activeTab === "catalog" && (
        <>
        <div className="px-6 flex flex-col gap-3">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search assets by ID, name, model..." 
                className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            {/* Asset Class Select */}
            <div className="relative min-w-[130px]">
              <select 
                value={selectedClass} 
                onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
                className="w-full pl-3 pr-8 py-2 bg-card border border-border hover:bg-muted/60 rounded-md text-xs text-muted-foreground appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/50 transition-colors"
              >
                <option value="all" className="bg-[#11141D]">Asset Class: All</option>
                {uniqueClasses.map(c => <option key={c} value={c} className="bg-[#11141D]">{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
            </div>

            {/* Status Select */}
            <div className="relative min-w-[130px]">
              <select 
                value={selectedStatus} 
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="w-full pl-3 pr-8 py-2 bg-card border border-border hover:bg-muted/60 rounded-md text-xs text-muted-foreground appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/50 transition-colors"
              >
                <option value="all" className="bg-[#11141D]">Status: All</option>
                <option value="active" className="bg-[#11141D]">Active</option>
                <option value="idle" className="bg-[#11141D]">Idle</option>
                <option value="maintenance" className="bg-[#11141D]">Maintenance</option>
                <option value="down" className="bg-[#11141D]">Down</option>
                <option value="unassigned" className="bg-[#11141D]">Unassigned</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
            </div>

            {/* Project Select */}
            <div className="relative min-w-[130px]">
              <select 
                value={selectedProject} 
                onChange={(e) => { setSelectedProject(e.target.value); setCurrentPage(1); }}
                className="w-full pl-3 pr-8 py-2 bg-card border border-border hover:bg-muted/60 rounded-md text-xs text-muted-foreground appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/50 transition-colors"
              >
                <option value="all" className="bg-[#11141D]">Project: All</option>
                {uniqueProjects.map(p => <option key={p} value={String(p)} className="bg-[#11141D]">Project {p}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
            </div>

            {/* Zone Select */}
            <div className="relative min-w-[130px]">
              <select 
                value={selectedZone} 
                onChange={(e) => { setSelectedZone(e.target.value); setCurrentPage(1); }}
                className="w-full pl-3 pr-8 py-2 bg-card border border-border hover:bg-muted/60 rounded-md text-xs text-muted-foreground appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/50 transition-colors"
              >
                <option value="all" className="bg-[#11141D]">Zone: All</option>
                {uniqueZones.map(z => <option key={z} value={String(z)} className="bg-[#11141D]">Zone {z}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
            </div>

            {/* Maintenance Select */}
            <div className="relative min-w-[130px]">
              <select 
                value={selectedMaint} 
                onChange={(e) => { setSelectedMaint(e.target.value); setCurrentPage(1); }}
                className="w-full pl-3 pr-8 py-2 bg-card border border-border hover:bg-muted/60 rounded-md text-xs text-muted-foreground appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/50 transition-colors"
              >
                <option value="all" className="bg-[#11141D]">Maintenance: All</option>
                <option value="service_due" className="bg-[#11141D]">Service Due Soon</option>
                <option value="overdue" className="bg-[#11141D]">Overdue Service</option>
                <option value="up_to_date" className="bg-[#11141D]">Up to Date</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-600 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border hover:bg-muted/60 rounded-md text-xs text-muted-foreground transition-colors">
              <span className="flex flex-col gap-0.5 items-center">
                <div className="h-[1px] w-3 bg-current" />
                <div className="h-[1px] w-2 bg-current" />
                <div className="h-[1px] w-1 bg-current" />
              </span>
              Sort
            </button>
            <div className="flex items-center bg-card border border-border rounded-md p-0.5">
              <button className="p-1.5 bg-zinc-800 rounded text-white"><List className="h-4 w-4" /></button>
              <button className="p-1.5 text-zinc-500 hover:text-white transition-colors"><Grid className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
        
        {/* Active Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-zinc-500 mr-1">Filters:</span>
          {selectedProject !== "all" && (
            <Badge variant="outline" className="text-[10px] font-normal bg-zinc-800/50 border-zinc-700 text-zinc-300 py-0.5 gap-1 hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => { setSelectedProject("all"); setCurrentPage(1); }}>
              Project: {selectedProject} <span className="opacity-50 hover:opacity-100 px-0.5">✕</span>
            </Badge>
          )}
          {selectedStatus !== "all" && (
            <Badge variant="outline" className="text-[10px] font-normal bg-zinc-800/50 border-zinc-700 text-zinc-300 py-0.5 gap-1 hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => { setSelectedStatus("all"); setCurrentPage(1); }}>
              Status: {selectedStatus} <span className="opacity-50 hover:opacity-100 px-0.5">✕</span>
            </Badge>
          )}
          {selectedClass !== "all" && (
            <Badge variant="outline" className="text-[10px] font-normal bg-zinc-800/50 border-zinc-700 text-zinc-300 py-0.5 gap-1 hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => { setSelectedClass("all"); setCurrentPage(1); }}>
              Class: {selectedClass} <span className="opacity-50 hover:opacity-100 px-0.5">✕</span>
            </Badge>
          )}
          {selectedZone !== "all" && (
            <Badge variant="outline" className="text-[10px] font-normal bg-zinc-800/50 border-zinc-700 text-zinc-300 py-0.5 gap-1 hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => { setSelectedZone("all"); setCurrentPage(1); }}>
              Zone: {selectedZone} <span className="opacity-50 hover:opacity-100 px-0.5">✕</span>
            </Badge>
          )}
          {selectedMaint !== "all" && (
            <Badge variant="outline" className="text-[10px] font-normal bg-zinc-800/50 border-zinc-700 text-zinc-300 py-0.5 gap-1 hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => { setSelectedMaint("all"); setCurrentPage(1); }}>
              Maintenance: {selectedMaint} <span className="opacity-50 hover:opacity-100 px-0.5">✕</span>
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="outline" className="text-[10px] font-normal bg-zinc-800/50 border-zinc-700 text-zinc-300 py-0.5 gap-1 hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => { setSearchQuery(""); setCurrentPage(1); }}>
              Search: {searchQuery} <span className="opacity-50 hover:opacity-100 px-0.5">✕</span>
            </Badge>
          )}
          
          {(selectedProject !== "all" || selectedStatus !== "all" || selectedClass !== "all" || selectedZone !== "all" || selectedMaint !== "all" || searchQuery) && (
            <button onClick={() => {
              setSelectedProject("all");
              setSelectedStatus("all");
              setSelectedClass("all");
              setSelectedZone("all");
              setSelectedMaint("all");
              setSearchQuery("");
              setCurrentPage(1);
            }} className="text-[11px] text-cyan-500 hover:text-cyan-400 font-medium ml-2 transition-colors">Clear all</button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 px-6">
        
        {/* ASSET CATALOG (Left 3 Columns) */}
        <div className="xl:col-span-3 bg-card border border-border dark:bg-[#11141D] dark:border-zinc-800/60 rounded-xl overflow-hidden flex flex-col h-full relative">
          {loading && (
            <div className="absolute inset-0 bg-[#0A0D14]/40 backdrop-blur-[1.5px] z-20 flex items-center justify-center">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#11141D]/95 border border-zinc-800 rounded-lg shadow-2xl">
                <Activity className="h-4 w-4 animate-spin text-cyan-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">Loading catalog...</span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between p-4 border-b border-border dark:border-zinc-800/60 shrink-0">
            <h2 className="text-sm font-semibold text-foreground dark:text-white">Asset Catalog <span className="text-xs font-normal text-muted-foreground ml-2">{filteredCount} assets</span></h2>
          </div>
          
          <div className="overflow-auto flex-1 min-h-0">
            <table className="w-full text-left text-sm whitespace-nowrap relative">
              <thead className="bg-muted/40 dark:bg-[#0A0D14]/95 backdrop-blur border-b border-border dark:border-zinc-800/60 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider w-48">Asset ID <ChevronDown className="inline h-3 w-3 ml-1" /></th>
                  <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Asset Type</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Model</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Project / Zone</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Current Activity</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">Reliability</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Next Service</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredEq.map((item) => {
                  const cleanedName = item.name.replace(/#P\d+-/, "#");
                  const s = (item.status || "").toLowerCase().trim();
                  
                  let statusColor = "text-zinc-400 bg-zinc-900 border-zinc-800";
                  if (s === 'active') statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                  if (s === 'idle') statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                  if (s === 'down' || s === 'under_repair') statusColor = "text-red-400 bg-red-500/10 border-red-500/20";
                  if (s === 'maintenance') statusColor = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";

                  const rScore = item.reliabilityScore || 90;

                  return (
                    <tr key={item.id} className="hover:bg-muted/40 dark:hover:bg-zinc-800/20 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-zinc-800/80 flex items-center justify-center border border-zinc-700">
                             <Construction className="h-4 w-4 text-zinc-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] font-bold text-cyan-400">{cleanedName}</span>
                            <span className="text-[9px] font-mono text-zinc-500">S/N: {item.serialNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="text-zinc-400"><Wrench className="h-3 w-3" /></div>
                          <span className="text-[11px] text-zinc-300">{item.className}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-zinc-400 uppercase">{(item.technicalSpecs as any)?.model || "Standard"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-zinc-300">Project {item.projectId} Expansion</span>
                          <span className="text-[10px] text-zinc-500">Zone {item.activeZoneId || "Pending"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-zinc-300">{item.activeActivityId ? `Activity ${item.activeActivityId}` : "None"}</span>
                          <span className="text-[10px] text-zinc-500">-</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${statusColor}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {rScore >= 80 ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> : <ShieldAlert className="h-3.5 w-3.5 text-red-500" />}
                          <span className={`text-[11px] font-semibold ${rScore >= 80 ? 'text-emerald-500' : 'text-red-500'}`}>{rScore}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-[11px] ${!item.nextServiceDate || new Date(item.nextServiceDate).getTime() < Date.now() ? 'text-red-400' : 'text-zinc-300'}`}>
                            {item.nextServiceDate || "Overdue"}
                          </span>
                          {item.nextServiceDate && new Date(item.nextServiceDate).getTime() > Date.now() && (
                            <span className="text-[10px] text-amber-500/80 font-medium">in {Math.ceil((new Date(item.nextServiceDate).getTime() - Date.now())/86400000)} days</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="text-zinc-500 hover:text-white transition-colors p-1">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border dark:border-zinc-800/60 bg-muted/20 dark:bg-[#0A0D14]/30 mt-auto shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-500">Rows per page:</span>
              <button className="flex items-center justify-between gap-2 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-300 min-w-[50px]">
                10 <ChevronDown className="h-3 w-3 text-zinc-600" />
              </button>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-zinc-400">
              <span>{filteredCount === 0 ? 0 : (currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, filteredCount)} of {filteredCount}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1 text-zinc-600 hover:text-white disabled:opacity-50">|&lt;</button>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 text-zinc-600 hover:text-white disabled:opacity-50">&lt;</button>
                
                {Array.from({ length: Math.min(5, Math.ceil(filteredCount/10)) }).map((_, i) => {
                   let pageNum = currentPage;
                   const totalPgs = Math.ceil(filteredCount/10);
                   if (currentPage <= 3) pageNum = i + 1;
                   else if (currentPage >= totalPgs - 2) pageNum = totalPgs - 4 + i;
                   else pageNum = currentPage - 2 + i;
                   
                   if (pageNum <= 0 || pageNum > totalPgs) return null;
 
                   return (
                     <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${currentPage === pageNum ? 'bg-cyan-500/20 text-cyan-400 font-medium border border-cyan-500/30' : 'hover:bg-zinc-800'}`}>{pageNum}</button>
                   )
                })}
                
                {Math.ceil(filteredCount/10) > 5 && currentPage < Math.ceil(filteredCount/10) - 2 && <span className="px-1 text-zinc-600">...</span>}
                {Math.ceil(filteredCount/10) > 5 && currentPage < Math.ceil(filteredCount/10) - 2 && (
                  <button onClick={() => setCurrentPage(Math.ceil(filteredCount/10))} className="w-6 h-6 rounded hover:bg-zinc-800 flex items-center justify-center transition-colors">{Math.ceil(filteredCount/10)}</button>
                )}
                
                <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredCount/10), p + 1))} disabled={currentPage === Math.ceil(filteredCount/10)} className="p-1 text-zinc-400 hover:text-white disabled:opacity-50">&gt;</button>
                <button onClick={() => setCurrentPage(Math.ceil(filteredCount/10))} disabled={currentPage === Math.ceil(filteredCount/10)} className="p-1 text-zinc-400 hover:text-white disabled:opacity-50">&gt;|</button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (Col 4) */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          
          {/* Immediate Risks */}
          <div className="bg-card border border-border dark:bg-[#11141D] dark:border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-zinc-800/60">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground dark:text-white flex items-center gap-2">
                Immediate Risks <Badge className="bg-red-500 text-white hover:bg-red-500 border-none px-1.5 py-0 min-w-[20px] flex justify-center text-[10px] rounded-full">{downCount}</Badge>
              </h3>
            </div>
            <div className="flex flex-col divide-y divide-border dark:divide-zinc-800/60">
              {(data.immediateRisks || []).slice(0, 3).map(item => (
                <div key={item.id} className="p-4 hover:bg-muted/40 dark:hover:bg-zinc-800/20 transition-colors flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[11px] font-bold text-foreground dark:text-zinc-200">{item.name.replace(/#P\d+-/, "#")}</span>
                    <span className="text-[10px] text-zinc-500">Critical Breakdown</span>
                  </div>
                  <span className="text-[9px] text-zinc-600 uppercase">Zone {item.activeZoneId || "?"}</span>
                </div>
              ))}
              <div className="p-3 text-center">
                 <button className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 hover:underline">View all risks →</button>
              </div>
            </div>
          </div>

          {/* Assets By Status */}
          <div className="bg-card border border-border dark:bg-[#11141D] dark:border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground dark:text-white">Assets By Status</h3>
            </div>
            <div className="flex items-center gap-6">
              {/* Donut Chart Mockup */}
              <div className="relative h-24 w-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Base track */}
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1f2937" strokeWidth="4"></circle>
                  {/* Active - 50% */}
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="50 50" strokeDashoffset="0"></circle>
                  {/* Idle - 15% */}
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="-50"></circle>
                  {/* Maint - 15% */}
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#6366f1" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="-65"></circle>
                  {/* Down - 5% */}
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="4" strokeDasharray="5 95" strokeDashoffset="-80"></circle>
                  {/* Unassigned - 15% */}
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#52525b" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="-85"></circle>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-foreground dark:text-white leading-none">{totalAssets}</span>
                  <span className="text-[8px] text-zinc-500 uppercase mt-0.5">Total</span>
                </div>
              </div>
              {/* Legend */}
              <div className="flex flex-col gap-1.5 flex-1">
                {[
                  { label: 'Active', count: activeCount, color: 'bg-emerald-500' },
                  { label: 'Idle', count: idleCount, color: 'bg-amber-500' },
                  { label: 'Maintenance', count: maintCount, color: 'bg-indigo-500' },
                  { label: 'Down', count: downCount, color: 'bg-red-500' },
                  { label: 'Unassigned', count: unassignedCount, color: 'bg-zinc-500' }
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${stat.color}`}></div>
                      <span className="text-zinc-400">{stat.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground dark:text-white font-medium">{stat.count}</span>
                      <span className="text-zinc-600 w-8 text-right">({totalAssets > 0 ? Math.round((stat.count / totalAssets) * 100) : 0}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border dark:border-zinc-800/60 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">View by: <span className="text-foreground dark:text-white">Status <ChevronDown className="inline h-3 w-3 ml-1" /></span></span>
            </div>
          </div>

        </div>
      </div>
        </>
      )}

      {/* GEOSPATIAL MAP TAB */}
      {activeTab === "map" && (
        <div className="px-6 flex flex-col gap-6 relative">
          {loading && (
            <div className="absolute inset-0 bg-[#0A0D14]/40 backdrop-blur-[1.5px] z-20 flex items-center justify-center">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#11141D]/95 border border-zinc-800 rounded-lg shadow-2xl">
                <Activity className="h-4 w-4 animate-spin text-cyan-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">Loading geospatial map...</span>
              </div>
            </div>
          )}
          {/* Dashboard filters row */}
          <div className="bg-[#11141D] border border-zinc-800/60 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search map assets..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-white rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-cyan-500 w-52 placeholder-zinc-600 transition-colors"
                />
              </div>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Classes</option>
                {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select 
                value={selectedZone} 
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Zones</option>
                <option value="1">Zone A</option>
                <option value="2">Zone B</option>
                <option value="3">Zone C</option>
                <option value="4">Zone D</option>
                <option value="5">Staging Area</option>
              </select>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="maintenance">Maintenance</option>
                <option value="down">Down</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500">Filtered: <span className="text-white font-bold">{filteredEq.length}</span> / {totalAssets}</span>
            </div>
          </div>

          <div className="bg-[#11141D] border border-zinc-800/60 rounded-xl overflow-hidden flex flex-col xl:flex-row h-[680px]">
            {/* Left Column: Active Deployments grouped by Zones */}
            <div className="w-full xl:w-80 border-r border-zinc-800/60 flex flex-col h-full bg-[#11141D]">
              <div className="p-4 border-b border-zinc-800/60 shrink-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Active Deployments</h3>
                <span className="text-[10px] text-zinc-500 mt-1 block">Grouped by active work zones</span>
              </div>
              <div className="flex-1 overflow-auto divide-y divide-zinc-800/60 p-2 flex flex-col gap-3">
                {[
                  { id: "8", label: "Zone A: Earth Excavation", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", dot: "bg-emerald-500" },
                  { id: "9", label: "Zone B: Material Handling", color: "text-blue-400 border-blue-500/20 bg-blue-500/5", dot: "bg-blue-500" },
                  { id: "10", label: "Zone C: Concrete Pour", color: "text-purple-400 border-purple-500/20 bg-purple-500/5", dot: "bg-purple-500" },
                  { id: "11", label: "Zone D: Steel Erection", color: "text-amber-400 border-amber-500/20 bg-amber-500/5", dot: "bg-amber-500" },
                  { id: "18", label: "Zone E: Structural Framing", color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5", dot: "bg-cyan-500" },
                  { id: "25", label: "Staging Area / Storage", color: "text-zinc-400 border-zinc-500/20 bg-zinc-500/5", dot: "bg-zinc-400" }
                ].map(zoneGroup => {
                  const zoneAssets = filteredEq.filter(item => {
                    const targetId = item.activeActivityId ? String(item.activeActivityId) : item.activeZoneId ? String(item.activeZoneId) : null;
                    return targetId === zoneGroup.id;
                  });
                  if (zoneAssets.length === 0) return null;
                  
                  return (
                    <div key={zoneGroup.id} className="flex flex-col gap-1">
                      <div className={`px-2.5 py-1.5 rounded border text-[10px] font-bold ${zoneGroup.color} flex items-center justify-between`}>
                        <span>{zoneGroup.label}</span>
                        <span className="px-1 py-0.5 rounded bg-muted/60 dark:bg-black/30 text-[8px]">{zoneAssets.length}</span>
                      </div>
                      <div className="flex flex-col gap-1 pl-1 mt-1">
                        {zoneAssets.map(item => {
                          const isSelected = selectedMapAssetId === item.id;
                          return (
                            <div 
                              key={item.id}
                              onClick={() => setSelectedMapAssetId(item.id)}
                              className={`p-2 rounded-lg cursor-pointer transition-all border flex items-center justify-between ${
                                isSelected 
                                  ? 'bg-zinc-800 border-cyan-500 shadow-md shadow-cyan-500/10' 
                                  : 'bg-zinc-950/40 border-zinc-900 hover:bg-zinc-950/80 hover:border-zinc-800'
                              }`}
                            >
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-400' : 'text-zinc-200'}`}>
                                  {item.name.replace(/#P\d+-/, "#")}
                                </span>
                                <span className="text-[9px] text-zinc-500 truncate">
                                  {item.className}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  item.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' :
                                  item.status === 'idle' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' :
                                  item.status === 'down' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' :
                                  'bg-indigo-500 shadow-[0_0_8px_#6366f1]'
                                } animate-pulse`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center Column: Live OpenStreetMap GIS Canvas */}
            <div className="flex-1 relative bg-zinc-950 flex flex-col min-h-[450px] pointer-events-auto select-none rounded-xl overflow-hidden border border-zinc-800/60">
              <EquipmentLeafletMap
                equipment={filteredEq}
                zones={zones}
                selectedAssetId={selectedMapAssetId}
                onAssetSelect={setSelectedMapAssetId}
              />

              {/* Floating Widgets overlays */}
              {/* 1. Weather Telemetry (Top Left - Spaced after Leaflet Controls) */}
              <div className="absolute top-4 left-14 bg-zinc-950/85 border border-zinc-800 rounded-lg p-2.5 flex flex-col gap-1 pointer-events-none select-none min-w-[120px] backdrop-blur-md z-[1000]">
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Weather Telemetry</span>
                <span className="text-xs font-bold text-white">28 deg C / Sunny</span>
                <span className="text-[9px] text-zinc-400">Wind: 14 km/h ENE</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[8px] text-emerald-400 font-mono">Sensors Online</span>
                </div>
              </div>

              {/* 2. Compass and Map controls (Bottom Left) */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-zinc-950/85 border border-zinc-800 rounded-lg p-2 backdrop-blur-md z-[1000]">
                <div className="flex flex-col text-[8px] text-zinc-500 font-mono border-r border-zinc-800 pr-2">
                  <span>LAT: 6.9262 deg N</span>
                  <span>LNG: 79.8601 deg E</span>
                </div>
                <div className="flex items-center gap-1 text-white font-mono text-[9px] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-zinc-300">Live OSMap Sync</span>
                </div>
              </div>
            </div>

            {/* Right Column: Selected Asset Telemetry Details & Zone Distribution */}
            {(() => {
              const selectedAsset = eq.find(e => e.id === selectedMapAssetId) || eq.find(e => e.status === "active") || eq[0];
              if (!selectedAsset) return null;

              const specs = (selectedAsset.technicalSpecs as any) || {};
              const util = Number(specs.utilization) || (selectedAsset.status === "active" ? 82 : selectedAsset.status === "idle" ? 45 : 0);
              const reliability = Number(selectedAsset.reliabilityScore) || 90;
              const fuel = Number(specs.fuel_level) || (selectedAsset.status === "down" ? 0 : 65);
              const isElectric = specs.power_type === "Electric" || selectedAsset.name.toLowerCase().includes("crane");

              // Compute Dynamic Deployed Assets by Zone count using correct database target IDs!
              const getZoneAssetCount = (idStr: string) => {
                return eq.filter(e => {
                  const targetId = e.activeActivityId ? String(e.activeActivityId) : e.activeZoneId ? String(e.activeZoneId) : null;
                  return targetId === idStr;
                }).length;
              };

              const zoneCounts = {
                zoneA: getZoneAssetCount("8"),
                zoneB: getZoneAssetCount("9"),
                zoneC: getZoneAssetCount("10"),
                zoneD: getZoneAssetCount("11"),
                zoneE: getZoneAssetCount("18"),
                staging: getZoneAssetCount("25")
              };

              // Total number of actually deployed items in active zones
              const activeDeployedTotal = zoneCounts.zoneA + zoneCounts.zoneB + zoneCounts.zoneC + zoneCounts.zoneD + zoneCounts.zoneE + zoneCounts.staging;

              return (
                <div className="w-full xl:w-80 border-l border-zinc-800/60 flex flex-col h-full bg-[#11141D] divide-y divide-zinc-800/60 overflow-auto">
                  {/* Selected Asset Details panel */}
                  <div className="p-4 flex flex-col gap-3">
                    <div>
                      <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest block">Selected Asset Details</span>
                      <h3 className="text-sm font-black text-white mt-1 truncate">{selectedAsset.name.replace(/#P\d+-/, "#")}</h3>
                      <span className="text-[10px] text-zinc-500 block truncate">{selectedAsset.className}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-2.5 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-[9px] text-zinc-500 font-mono">S/N: {selectedAsset.serialNumber}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        selectedAsset.status === 'active' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' :
                        selectedAsset.status === 'idle' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' :
                        selectedAsset.status === 'down' ? 'text-red-400 bg-red-500/10 border border-red-500/20' :
                        'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
                      }`}>
                        {selectedAsset.status}
                      </span>
                    </div>

                    {/* Specifications breakdown */}
                    <div className="flex flex-col gap-1.5 text-[10px] text-zinc-400">
                      <div className="flex justify-between py-0.5 border-b border-zinc-800/40">
                        <span>Model Type</span>
                        <span className="text-white font-medium">{specs.model || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-zinc-800/40">
                        <span>Power Resource</span>
                        <span className="text-white font-medium">{specs.power_type || "Diesel Engine"}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-zinc-800/40">
                        <span>Assigned Crew</span>
                        <span className="text-white font-medium">{specs.assigned_crew || "General Operations"}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-zinc-800/40">
                        <span>Lead Engineer</span>
                        <span className="text-white font-medium">{specs.assigned_engineer || "Unassigned"}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-zinc-800/40">
                        <span>Assigned Date</span>
                        <span className="text-white font-medium font-mono">
                          {selectedAsset.assignedDate ? new Date(selectedAsset.assignedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Pending"}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-zinc-800/40">
                        <span>Assignment Age</span>
                        <span className="text-white font-medium font-mono">
                          {(() => {
                            if (!selectedAsset.assignedDate) return "N/A";
                            const assignedDate = new Date(selectedAsset.assignedDate);
                            const today = new Date();
                            const diffTime = today.getTime() - assignedDate.getTime();
                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays <= 0) return "Assigned today";
                            if (diffDays === 1) return "1 day ago";
                            return `${diffDays} days ago`;
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-zinc-800/40">
                        <span>Estimated End Date</span>
                        <span className="text-white font-medium font-mono">
                          {selectedAsset.estimatedEndDate ? new Date(selectedAsset.estimatedEndDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "TBD"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Assets by Zone breakdown progress chart */}
                  <div className="p-4 flex flex-col gap-3">
                    <div>
                      <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Asset distribution by zone</h4>
                      <span className="text-[8px] text-zinc-500 block">Relative density across active work areas</span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {[
                        { label: "Zone A: Earth Excavation", count: zoneCounts.zoneA, colorClass: "[&>div]:bg-emerald-500" },
                        { label: "Zone B: Material Handling", count: zoneCounts.zoneB, colorClass: "[&>div]:bg-blue-500" },
                        { label: "Zone C: Concrete Pour", count: zoneCounts.zoneC, colorClass: "[&>div]:bg-purple-500" },
                        { label: "Zone D: Steel Erection", count: zoneCounts.zoneD, colorClass: "[&>div]:bg-amber-500" },
                        { label: "Zone E: Structural Framing", count: zoneCounts.zoneE, colorClass: "[&>div]:bg-cyan-500" },
                        { label: "Staging Area / Storage", count: zoneCounts.staging, colorClass: "[&>div]:bg-zinc-500" }
                      ].map(zItem => {
                        const densityPct = activeDeployedTotal > 0 ? (zItem.count / activeDeployedTotal) * 100 : 0;
                        return (
                          <div key={zItem.label} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-[9px]">
                              <span className="text-zinc-400">{zItem.label}</span>
                              <span className="text-white font-mono font-bold">{zItem.count} ({Math.round(densityPct)}%)</span>
                            </div>
                            <Progress value={densityPct} className={`h-1 bg-zinc-950 ${zItem.colorClass}`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* SERVICE SCHEDULE TAB */}
      {activeTab === "service" && (
        <div className="px-6 flex flex-col gap-6 relative">
          {loading && (
            <div className="absolute inset-0 bg-[#0A0D14]/40 backdrop-blur-[1.5px] z-20 flex items-center justify-center">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#11141D]/95 border border-zinc-800 rounded-lg shadow-2xl">
                <Activity className="h-4 w-4 animate-spin text-cyan-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">Loading schedule...</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Quick Metrics */}
            <div className="xl:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border dark:bg-[#11141D] dark:border-zinc-800/60 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-lg"><AlertTriangle className="h-6 w-6" /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Overdue Service</span>
                  <span className="text-xl font-bold text-foreground dark:text-white mt-0.5">{filteredEq.filter(e => e.nextServiceDate && new Date(e.nextServiceDate).getTime() < Date.now()).length} assets</span>
                </div>
              </div>
              <div className="bg-card border border-border dark:bg-[#11141D] dark:border-zinc-800/60 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg"><Clock className="h-6 w-6" /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Due in 7 Days</span>
                  <span className="text-xl font-bold text-foreground dark:text-white mt-0.5">{filteredEq.filter(e => e.nextServiceDate && new Date(e.nextServiceDate).getTime() >= Date.now() && new Date(e.nextServiceDate).getTime() < Date.now() + 7 * 86400000).length} assets</span>
                </div>
              </div>
              <div className="bg-card border border-border dark:bg-[#11141D] dark:border-zinc-800/60 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg"><CheckCircle2 className="h-6 w-6" /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Up to Date</span>
                  <span className="text-xl font-bold text-foreground dark:text-white mt-0.5">{filteredEq.filter(e => !e.nextServiceDate || new Date(e.nextServiceDate).getTime() >= Date.now() + 7 * 86400000).length} assets</span>
                </div>
              </div>
            </div>

            {/* Service Log Table */}
            <div className="xl:col-span-4 bg-card border border-border dark:bg-[#11141D] dark:border-zinc-800/60 rounded-xl overflow-hidden flex flex-col h-[550px]">
              <div className="flex items-center justify-between p-4 border-b border-border dark:border-zinc-800/60 shrink-0">
                <h3 className="text-sm font-semibold text-foreground dark:text-white">Asset Service Schedule</h3>
              </div>
              <div className="overflow-auto flex-1 min-h-0">
                <table className="w-full text-left text-sm whitespace-nowrap relative">
                  <thead className="bg-muted/40 dark:bg-[#0A0D14]/95 border-b border-border dark:border-zinc-800/60 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase">Asset Name</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase">Service Type</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase">Next Date</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase">Assigned Tech</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase text-right">Est Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredEq.filter(e => e.nextServiceDate).map(item => {
                      const nextDate = new Date(item.nextServiceDate!);
                      const isOverdue = nextDate.getTime() < Date.now();
                      const daysLeft = Math.ceil((nextDate.getTime() - Date.now()) / 86400000);
                      
                      return (
                        <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-xs font-bold text-cyan-400">{item.name.replace(/#P\d+-/, "#")}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-zinc-300">Routine Maintenance</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-xs text-white">{item.nextServiceDate}</span>
                              <span className={`text-[9px] ${isOverdue ? 'text-red-400' : 'text-amber-500'}`}>
                                {isOverdue ? "Overdue" : `in ${daysLeft} days`}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${isOverdue ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'}`}>
                              {isOverdue ? "Overdue" : "Scheduled"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-zinc-400">Site Maintenance Team</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs font-bold text-zinc-300">$450.00</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
