"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { AlertTriangle, Wrench, Search, MapPin, Construction, Calendar, Plus, Download, ChevronDown, List, Grid, ShieldAlert, ShieldCheck, CheckCircle2, Clock, Activity, MoreHorizontal, Maximize2 } from "lucide-react"
import { type EquipmentResponse } from "@/lib/equipment-data"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default function UnifiedEquipmentDashboard() {
  const params = useParams()
  const projectId = params?.id
  
  const [data, setData] = useState<EquipmentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedProject, setSelectedProject] = useState("all")
  const [selectedZone, setSelectedZone] = useState("all")
  const [selectedMaint, setSelectedMaint] = useState("all")

  useEffect(() => {
    if (!projectId) return

    async function loadData() {
      try {
        setLoading(true)
        const res = await fetch(`/api/project/${projectId}/equipment?filter=company&t=${Date.now()}`, { cache: 'no-store' })
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

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <Activity className="h-10 w-10 animate-pulse text-primary" />
        <span className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Initializing Asset Catalog...</span>
      </div>
    )
  }

  const eq = data.equipment
  const uniqueClasses = Array.from(new Set(eq.map(e => e.className))).filter(Boolean) as string[]
  const uniqueProjects = Array.from(new Set(eq.map(e => e.projectId))).filter(Boolean) as (string|number)[]
  const uniqueZones = Array.from(new Set(eq.map(e => e.activeZoneId))).filter(Boolean) as (string|number)[]

  const filteredEq = eq.filter(item => {
    // 1. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      const matchSerial = (item.serialNumber || "").toLowerCase().includes(q);
      const matchClass = (item.className || "").toLowerCase().includes(q);
      const matchModel = ((item.technicalSpecs as any)?.model || "").toLowerCase().includes(q);
      if (!matchName && !matchId && !matchSerial && !matchClass && !matchModel) return false;
    }
    // 2. Class Filter
    if (selectedClass !== "all" && item.className !== selectedClass) return false;
    // 3. Status Filter
    if (selectedStatus !== "all" && (item.status || "").toLowerCase().trim() !== selectedStatus) return false;
    // 4. Project Filter
    if (selectedProject !== "all" && String(item.projectId) !== selectedProject) return false;
    // 5. Zone Filter
    if (selectedZone !== "all" && String(item.activeZoneId) !== selectedZone) return false;
    // 6. Maintenance Filter
    if (selectedMaint !== "all") {
      const isDue = item.nextServiceDate && new Date(item.nextServiceDate).getTime() < Date.now() + 7 * 86400000;
      const isOverdue = item.nextServiceDate && new Date(item.nextServiceDate).getTime() < Date.now();
      if (selectedMaint === "service_due" && !isDue) return false;
      if (selectedMaint === "overdue" && !isOverdue) return false;
      if (selectedMaint === "up_to_date" && isDue) return false;
    }
    return true;
  });

  const totalAssets = filteredEq.length
  const activeCount = filteredEq.filter(e => e.status === 'active').length
  const idleCount = filteredEq.filter(e => e.status === 'idle').length
  const maintCount = filteredEq.filter(e => e.status === 'maintenance').length
  const downCount = filteredEq.filter(e => e.status === 'down' || e.status === 'under_repair' || e.status === 'broken').length
  const unassignedCount = filteredEq.filter(e => e.status === 'unassigned').length

  const avgUtil = 72 // Mock average for display
  const serviceDueCount = filteredEq.filter(e => e.nextServiceDate && new Date(e.nextServiceDate).getTime() < Date.now() + 7 * 86400000).length

  return (
    <div className="flex flex-col gap-6 min-h-screen bg-[#0A0D14] text-zinc-300 pb-12 font-sans selection:bg-blue-500/30">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 pt-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Equipment & Assets</h1>
          <p className="text-sm text-zinc-500 mt-1">Fleet visibility, utilization, and reliability</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-md transition-colors">
            <Download className="h-4 w-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-black bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <Plus className="h-4 w-4" /> Add Asset
          </button>
          <button className="p-2 text-zinc-400 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-md transition-colors">
            <Activity className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4 px-6">
        {/* Total Assets */}
        <div className="flex flex-col gap-3 p-4 bg-[#11141D] border border-zinc-800/60 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <Grid className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Assets</span>
                <span className="text-2xl font-semibold text-white mt-0.5">{totalAssets}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
             <span className="text-[10px] text-zinc-500">All Equipment</span>
             <span className="text-[10px] text-emerald-500 font-medium">↑ 6 vs last 7 days</span>
          </div>
        </div>

        {/* Active */}
        <div className="flex flex-col gap-3 p-4 bg-[#11141D] border border-zinc-800/60 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Active</span>
                <span className="text-2xl font-semibold text-white mt-0.5">{activeCount}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
             <span className="text-[10px] text-zinc-500">{Math.round((activeCount/totalAssets)*100)}% of total</span>
             <span className="text-[10px] text-emerald-500 font-medium">↑ 5 vs last 7 days</span>
          </div>
        </div>

        {/* Idle */}
        <div className="flex flex-col gap-3 p-4 bg-[#11141D] border border-zinc-800/60 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 text-amber-500 rounded-full">
                <Clock className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Idle</span>
                <span className="text-2xl font-semibold text-white mt-0.5">{idleCount}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
             <span className="text-[10px] text-zinc-500">{Math.round((idleCount/totalAssets)*100)}% of total</span>
             <span className="text-[10px] text-red-500 font-medium">↓ 2 vs last 7 days</span>
          </div>
        </div>

        {/* Maintenance */}
        <div className="flex flex-col gap-3 p-4 bg-[#11141D] border border-zinc-800/60 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">In Maintenance</span>
                <span className="text-2xl font-semibold text-white mt-0.5">{maintCount}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
             <span className="text-[10px] text-zinc-500">{Math.round((maintCount/totalAssets)*100)}% of total</span>
             <span className="text-[10px] text-emerald-500 font-medium">↑ 1 vs last 7 days</span>
          </div>
        </div>

        {/* Down / At Risk */}
        <div className="flex flex-col gap-3 p-4 bg-[#11141D] border border-zinc-800/60 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Down / At Risk</span>
                <span className="text-2xl font-semibold text-white mt-0.5">{downCount}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
             <span className="text-[10px] text-zinc-500">{Math.round((downCount/totalAssets)*100)}% of total</span>
             <span className="text-[10px] text-emerald-500 font-medium">↑ 2 vs last 7 days</span>
          </div>
        </div>

        {/* Unassigned */}
        <div className="flex flex-col gap-3 p-4 bg-[#11141D] border border-zinc-800/60 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-800/50 text-zinc-400 rounded-lg">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Unassigned</span>
                <span className="text-2xl font-semibold text-white mt-0.5">{unassignedCount}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
             <span className="text-[10px] text-zinc-500">{totalAssets > 0 ? Math.round((unassignedCount/totalAssets)*100) : 0}% of total</span>
             <span className="text-[10px] text-zinc-500 font-medium">Yard / Storage</span>
          </div>
        </div>

        {/* Service Due */}
        <div className="flex flex-col gap-3 p-4 bg-[#11141D] border border-zinc-800/60 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Service Due Soon</span>
                <span className="text-2xl font-semibold text-white mt-0.5">{serviceDueCount}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
             <span className="text-[10px] text-zinc-500">Next 7 days</span>
             <span className="text-[10px] text-cyan-500 font-medium hover:underline cursor-pointer">View schedule →</span>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
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
                className="w-full pl-9 pr-4 py-2 bg-[#11141D] border border-zinc-800 rounded-md text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            {/* Asset Class Select */}
            <div className="relative min-w-[130px]">
              <select 
                value={selectedClass} 
                onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
                className="w-full pl-3 pr-8 py-2 bg-[#11141D] border border-zinc-800 hover:bg-zinc-800/50 rounded-md text-xs text-zinc-300 appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/50 transition-colors"
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
                className="w-full pl-3 pr-8 py-2 bg-[#11141D] border border-zinc-800 hover:bg-zinc-800/50 rounded-md text-xs text-zinc-300 appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/50 transition-colors"
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
                className="w-full pl-3 pr-8 py-2 bg-[#11141D] border border-zinc-800 hover:bg-zinc-800/50 rounded-md text-xs text-zinc-300 appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/50 transition-colors"
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
                className="w-full pl-3 pr-8 py-2 bg-[#11141D] border border-zinc-800 hover:bg-zinc-800/50 rounded-md text-xs text-zinc-300 appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/50 transition-colors"
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
                className="w-full pl-3 pr-8 py-2 bg-[#11141D] border border-zinc-800 hover:bg-zinc-800/50 rounded-md text-xs text-zinc-300 appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/50 transition-colors"
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
            <button className="flex items-center gap-2 px-4 py-2 bg-[#11141D] border border-zinc-800 hover:bg-zinc-800/50 rounded-md text-xs text-zinc-300 transition-colors">
              <span className="flex flex-col gap-0.5 items-center">
                <div className="h-[1px] w-3 bg-current" />
                <div className="h-[1px] w-2 bg-current" />
                <div className="h-[1px] w-1 bg-current" />
              </span>
              Sort
            </button>
            <div className="flex items-center bg-[#11141D] border border-zinc-800 rounded-md p-0.5">
              <button className="p-1.5 bg-zinc-800 rounded text-white"><List className="h-4 w-4" /></button>
              <button className="p-1.5 text-zinc-500 hover:text-white transition-colors"><Grid className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
        
        {/* Active Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-zinc-500 mr-1">Filters:</span>
          {selectedProject !== "all" && (
            <Badge variant="outline" className="text-[10px] font-normal bg-zinc-800/50 border-zinc-700 text-zinc-300 py-0.5 gap-1 hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => setSelectedProject("all")}>
              Project: {selectedProject} <span className="opacity-50 hover:opacity-100 px-0.5">✕</span>
            </Badge>
          )}
          {selectedStatus !== "all" && (
            <Badge variant="outline" className="text-[10px] font-normal bg-zinc-800/50 border-zinc-700 text-zinc-300 py-0.5 gap-1 hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => setSelectedStatus("all")}>
              Status: {selectedStatus} <span className="opacity-50 hover:opacity-100 px-0.5">✕</span>
            </Badge>
          )}
          {selectedClass !== "all" && (
            <Badge variant="outline" className="text-[10px] font-normal bg-zinc-800/50 border-zinc-700 text-zinc-300 py-0.5 gap-1 hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => setSelectedClass("all")}>
              Class: {selectedClass} <span className="opacity-50 hover:opacity-100 px-0.5">✕</span>
            </Badge>
          )}
          {selectedZone !== "all" && (
            <Badge variant="outline" className="text-[10px] font-normal bg-zinc-800/50 border-zinc-700 text-zinc-300 py-0.5 gap-1 hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => setSelectedZone("all")}>
              Zone: {selectedZone} <span className="opacity-50 hover:opacity-100 px-0.5">✕</span>
            </Badge>
          )}
          {selectedMaint !== "all" && (
            <Badge variant="outline" className="text-[10px] font-normal bg-zinc-800/50 border-zinc-700 text-zinc-300 py-0.5 gap-1 hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => setSelectedMaint("all")}>
              Maintenance: {selectedMaint} <span className="opacity-50 hover:opacity-100 px-0.5">✕</span>
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="outline" className="text-[10px] font-normal bg-zinc-800/50 border-zinc-700 text-zinc-300 py-0.5 gap-1 hover:bg-zinc-800 transition-colors cursor-pointer" onClick={() => setSearchQuery("")}>
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
            }} className="text-[11px] text-cyan-500 hover:text-cyan-400 font-medium ml-2 transition-colors">Clear all</button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 px-6">
        
        {/* ASSET CATALOG (Left 3 Columns) */}
        <div className="xl:col-span-3 bg-[#11141D] border border-zinc-800/60 rounded-xl overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/60 shrink-0">
            <h2 className="text-sm font-semibold text-white">Asset Catalog <span className="text-xs font-normal text-zinc-500 ml-2">{totalAssets} assets</span></h2>
          </div>
          
          <div className="overflow-auto flex-1 min-h-0">
            <table className="w-full text-left text-sm whitespace-nowrap relative">
              <thead className="bg-[#0A0D14]/95 backdrop-blur border-b border-zinc-800/60 sticky top-0 z-10 shadow-sm">
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
                {filteredEq.slice((currentPage - 1) * 10, currentPage * 10).map((item) => {
                  const cleanedName = item.name.replace(/#P\d+-/, "#");
                  const s = (item.status || "").toLowerCase().trim();
                  
                  let statusColor = "text-zinc-400 bg-zinc-900 border-zinc-800";
                  if (s === 'active') statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                  if (s === 'idle') statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                  if (s === 'down' || s === 'under_repair') statusColor = "text-red-400 bg-red-500/10 border-red-500/20";
                  if (s === 'maintenance') statusColor = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";

                  const rScore = item.reliabilityScore || 90;

                  return (
                    <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors group">
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
          <div className="flex items-center justify-between p-4 border-t border-zinc-800/60 bg-[#0A0D14]/30 mt-auto shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-500">Rows per page:</span>
              <button className="flex items-center justify-between gap-2 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-300 min-w-[50px]">
                10 <ChevronDown className="h-3 w-3 text-zinc-600" />
              </button>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-zinc-400">
              <span>{(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, totalAssets)} of {totalAssets}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1 text-zinc-600 hover:text-white disabled:opacity-50">|&lt;</button>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 text-zinc-600 hover:text-white disabled:opacity-50">&lt;</button>
                
                {Array.from({ length: Math.min(5, Math.ceil(totalAssets/10)) }).map((_, i) => {
                   let pageNum = currentPage;
                   const totalPgs = Math.ceil(totalAssets/10);
                   if (currentPage <= 3) pageNum = i + 1;
                   else if (currentPage >= totalPgs - 2) pageNum = totalPgs - 4 + i;
                   else pageNum = currentPage - 2 + i;
                   
                   if (pageNum <= 0 || pageNum > totalPgs) return null;

                   return (
                     <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${currentPage === pageNum ? 'bg-cyan-500/20 text-cyan-400 font-medium border border-cyan-500/30' : 'hover:bg-zinc-800'}`}>{pageNum}</button>
                   )
                })}
                
                {Math.ceil(totalAssets/10) > 5 && currentPage < Math.ceil(totalAssets/10) - 2 && <span className="px-1 text-zinc-600">...</span>}
                {Math.ceil(totalAssets/10) > 5 && currentPage < Math.ceil(totalAssets/10) - 2 && (
                  <button onClick={() => setCurrentPage(Math.ceil(totalAssets/10))} className="w-6 h-6 rounded hover:bg-zinc-800 flex items-center justify-center transition-colors">{Math.ceil(totalAssets/10)}</button>
                )}
                
                <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalAssets/10), p + 1))} disabled={currentPage === Math.ceil(totalAssets/10)} className="p-1 text-zinc-400 hover:text-white disabled:opacity-50">&gt;</button>
                <button onClick={() => setCurrentPage(Math.ceil(totalAssets/10))} disabled={currentPage === Math.ceil(totalAssets/10)} className="p-1 text-zinc-400 hover:text-white disabled:opacity-50">&gt;|</button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (Col 4) */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          
          {/* Immediate Risks */}
          <div className="bg-[#11141D] border border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800/60">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                Immediate Risks <Badge className="bg-red-500 text-white hover:bg-red-500 border-none px-1.5 py-0 min-w-[20px] flex justify-center text-[10px] rounded-full">{downCount}</Badge>
              </h3>
            </div>
            <div className="flex flex-col divide-y divide-zinc-800/60">
              {eq.filter(e => e.status === 'down').slice(0,3).map(item => (
                <div key={item.id} className="p-4 hover:bg-zinc-800/20 transition-colors flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[11px] font-bold text-zinc-200">{item.name.replace(/#P\d+-/, "#")}</span>
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

          {/* Upcoming Service */}
          <div className="bg-[#11141D] border border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800/60">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                Upcoming Service <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0 min-w-[20px] flex justify-center text-[10px] rounded-full">{serviceDueCount}</Badge>
              </h3>
            </div>
            <div className="flex flex-col divide-y divide-zinc-800/60">
              {eq.filter(e => e.nextServiceDate).slice(0,3).map(item => (
                <div key={item.id} className="p-4 hover:bg-zinc-800/20 transition-colors flex items-start gap-3">
                  <Wrench className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[11px] font-bold text-zinc-200">{item.name.replace(/#P\d+-/, "#")}</span>
                    <span className="text-[10px] text-zinc-500">Routine Service</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[10px] font-medium text-zinc-300">{item.nextServiceDate}</span>
                    <span className="text-[9px] text-amber-500/80">in {item.nextServiceDate ? Math.ceil((new Date(item.nextServiceDate).getTime() - Date.now())/86400000) : 0} days</span>
                  </div>
                </div>
              ))}
              <div className="p-3 text-center">
                 <button className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 hover:underline">View full maintenance schedule →</button>
              </div>
            </div>
          </div>

          {/* Assets By Status */}
          <div className="bg-[#11141D] border border-zinc-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">Assets By Status</h3>
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
                  <span className="text-lg font-bold text-white leading-none">{totalAssets}</span>
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
                      <span className="text-white font-medium">{stat.count}</span>
                      <span className="text-zinc-600 w-8 text-right">({Math.round((stat.count/totalAssets)*100)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">View by: <span className="text-white">Status <ChevronDown className="inline h-3 w-3 ml-1" /></span></span>
            </div>
          </div>

          {/* Fleet Deployment Map */}
          <div className="bg-[#11141D] border border-zinc-800/60 rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800/60">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">Fleet Deployment Map</h3>
            </div>
            <div className="relative h-48 bg-zinc-900 border-b border-zinc-800/60 w-full overflow-hidden">
               {/* Faux map background pattern */}
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#3f3f46 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
               <div className="absolute inset-0 bg-gradient-to-t from-[#11141D] to-transparent z-0 pointer-events-none" />
               {/* Map Nodes */}
               <div className="absolute top-[30%] left-[20%] w-6 h-6 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center justify-center z-10"><span className="text-[9px] font-bold text-emerald-400">23</span></div>
               <div className="absolute top-[60%] left-[40%] w-5 h-5 bg-indigo-500/20 border border-indigo-500 rounded-full flex items-center justify-center z-10"><span className="text-[9px] font-bold text-indigo-400">5</span></div>
               <div className="absolute top-[40%] right-[30%] w-6 h-6 bg-amber-500/20 border border-amber-500 rounded-full flex items-center justify-center z-10"><span className="text-[9px] font-bold text-amber-400">12</span></div>
               <div className="absolute bottom-[20%] right-[20%] w-6 h-6 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center justify-center z-10"><span className="text-[9px] font-bold text-emerald-400">13</span></div>
               <div className="absolute top-[50%] right-[10%] w-4 h-4 bg-red-500/20 border border-red-500 rounded-full flex items-center justify-center z-10"><span className="text-[9px] font-bold text-red-400">2</span></div>
               
               <button className="absolute top-3 right-3 p-1.5 bg-zinc-900/80 border border-zinc-700 rounded text-zinc-400 hover:text-white z-20">
                 <Maximize2 className="h-3 w-3" />
               </button>
            </div>
            <div className="p-3">
               <button className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 hover:underline">View full map →</button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
