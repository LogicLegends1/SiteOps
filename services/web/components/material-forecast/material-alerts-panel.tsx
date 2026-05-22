"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  type Material,
  type MaterialAlert,
} from "@/lib/material-data"
import {
  Search,
  FilterX,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Package,
  TrendingUp,
  Clock,
  List,
  AlertCircle,
  Calendar,
  FileWarning,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function MaterialAlertsPanel({ 
  materialsList = [], 
  liveAlerts = [], 
  isLoading = false 
}: { 
  materialsList?: Material[], 
  liveAlerts?: any[], 
  isLoading?: boolean 
}) {
  const [activeTab, setActiveTab] = useState("pending")
  const [currentPage, setCurrentPage] = useState(1)

  const pendingAlerts = liveAlerts.filter((a) => !a.acknowledged)
  const resolvedAlerts = liveAlerts.filter((a) => a.acknowledged)

  const alertsToRender = activeTab === "pending" ? pendingAlerts : resolvedAlerts

  const getIconForType = (type: string) => {
    switch(type) {
      case 'critical_stock': return AlertTriangle;
      case 'low_stock': return TrendingUp;
      case 'usage_spike': return TrendingUp;
      case 'delivery_delay': return Package;
      default: return AlertCircle;
    }
  }

  const mappedAlerts = alertsToRender.map(alert => {
    const d = new Date(alert.createdAt);
    return {
      id: alert.id,
      title: alert.type === 'critical_stock' ? "Stock Out Imminent" : "Low Buffer Level",
      sub: alert.message,
      type: alert.type === 'critical_stock' ? "STOCK OUT" : "LOW STOCK",
      mat: alert.materialName,
      matSub: `ID: ${alert.materialId}`,
      proj: "Colombo Metro",
      zone: "Zone A",
      sev: alert.severity.toUpperCase(),
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: alert.acknowledged ? "RESOLVED" : "PENDING",
      icon: getIconForType(alert.type),
      iconColor: alert.severity === 'critical' ? "text-red-500" : "text-orange-500"
    }
  })

  // Pagination logic
  const itemsPerPage = 10;
  const totalItems = mappedAlerts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedAlerts = mappedAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSevColor = (sev: string) => {
    switch(sev) {
      case "CRITICAL": return "text-red-500 border-red-500/20 bg-red-500/10"
      case "HIGH": return "text-orange-500 border-orange-500/20 bg-orange-500/10"
      case "MEDIUM": return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10"
      case "LOW": return "text-blue-500 border-blue-500/20 bg-blue-500/10"
      default: return "text-zinc-500 border-zinc-500/20 bg-zinc-500/10"
    }
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case "STOCK OUT": return "text-indigo-400 border-indigo-400/20"
      case "LOW STOCK": return "text-orange-400 border-orange-400/20"
      case "USAGE SPIKE": return "text-purple-400 border-purple-400/20"
      case "DELIVERY": return "text-red-400 border-red-400/20"
      case "FORECAST": return "text-cyan-400 border-cyan-400/20"
      case "MAINTENANCE": return "text-purple-400 border-purple-400/20"
      case "INVENTORY": return "text-blue-400 border-blue-400/20"
      default: return "text-zinc-400 border-zinc-400/20"
    }
  }

  return (
    <div className="flex flex-col bg-[#11141D] border border-zinc-800/60 rounded-xl overflow-hidden shadow-lg h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800/60">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Alerts & Incidents</h2>
      </div>

      {/* Tabs and Sort */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => { setActiveTab("pending"); setCurrentPage(1); }}
            className={cn(
              "flex items-center gap-2 pb-1 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2",
              activeTab === "pending" ? "text-white border-red-500" : "text-zinc-500 border-transparent hover:text-zinc-300"
            )}
          >
            Pending <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full ml-1">{pendingAlerts.length}</span>
          </button>
          <button 
            onClick={() => { setActiveTab("resolved"); setCurrentPage(1); }}
            className={cn(
              "flex items-center gap-2 pb-1 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2",
              activeTab === "resolved" ? "text-white border-zinc-500" : "text-zinc-500 border-transparent hover:text-zinc-300"
            )}
          >
            Resolved <span className="bg-zinc-700 text-zinc-300 text-[9px] px-1.5 py-0.5 rounded-full ml-1">{resolvedAlerts.length}</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-[#0A0D14] border border-zinc-800 text-zinc-300 text-[11px] rounded-md px-3 py-1.5 focus:outline-none">
            <option>Sort by: Newest</option>
          </select>
          <button className="p-1.5 bg-[#0A0D14] border border-zinc-800 rounded-md text-zinc-400 hover:text-white">
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800/60 overflow-x-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search alerts..." 
            className="bg-[#0A0D14] border border-zinc-800 text-white rounded-lg pl-9 pr-4 py-1.5 text-[11px] focus:outline-none focus:border-cyan-500 w-48 placeholder-zinc-600"
          />
        </div>
        <select className="bg-[#0A0D14] border border-zinc-800 text-zinc-300 rounded-lg px-3 py-1.5 text-[11px] focus:outline-none">
          <option>Severity: All</option>
        </select>
        <select className="bg-[#0A0D14] border border-zinc-800 text-zinc-300 rounded-lg px-3 py-1.5 text-[11px] focus:outline-none">
          <option>Type: All</option>
        </select>
        <select className="bg-[#0A0D14] border border-zinc-800 text-zinc-300 rounded-lg px-3 py-1.5 text-[11px] focus:outline-none">
          <option>Material: All</option>
        </select>
        <select className="bg-[#0A0D14] border border-zinc-800 text-zinc-300 rounded-lg px-3 py-1.5 text-[11px] focus:outline-none">
          <option>Project Zone: All</option>
        </select>
        <button className="flex items-center gap-1.5 text-cyan-500 hover:text-cyan-400 text-[11px] font-medium ml-2 whitespace-nowrap">
          <FilterX className="h-3.5 w-3.5" /> Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-[#0A0D14]/50 border-b border-zinc-800/60">
            <tr>
              <th className="px-6 py-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Alert / Incident</th>
              <th className="px-4 py-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Type</th>
              <th className="px-4 py-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Material</th>
              <th className="px-4 py-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Project / Zone</th>
              <th className="px-4 py-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Severity</th>
              <th className="px-4 py-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Detected On</th>
              <th className="px-4 py-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      Synchronizing Alert Matrix...
                    </span>
                  </div>
                </td>
              </tr>
            ) : paginatedAlerts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FileWarning className="h-8 w-8 text-zinc-600" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      No Alerts Found
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <alert.icon className={cn("h-4 w-4 mt-0.5", alert.iconColor)} />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-zinc-200">{alert.title}</span>
                        <span className="text-[10px] text-zinc-500 mt-0.5">{alert.sub}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn("text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider", getTypeColor(alert.type))}>
                      {alert.type}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-300">{alert.mat}</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">{alert.matSub}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-300">{alert.proj}</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">{alert.zone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn("text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider", getSevColor(alert.sev))}>
                      {alert.sev}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-300">{alert.date}</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">{alert.time}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[9px] font-bold px-2 py-1 rounded border border-red-500/20 bg-red-500/10 text-red-500 uppercase tracking-wider">
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-zinc-500">
                    <button className="hover:text-white transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/60 mt-auto">
        <span className="text-[11px] text-zinc-500">
          Showing {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} alerts
        </span>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          
          {Array.from({ length: totalPages }).map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={cn(
                "w-6 h-6 rounded text-[11px] font-bold flex items-center justify-center transition-colors",
                currentPage === i + 1 ? "bg-cyan-500 text-black" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              )}
            >
              {i + 1}
            </button>
          ))}

          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
