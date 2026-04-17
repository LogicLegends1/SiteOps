"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  materials,
  getStockLevelColor,
  getStockLevelBorder,
  getTrendIcon,
  getTrendColor,
  type Material,
} from "@/lib/material-data"
import { Input } from "@/components/ui/input"
import {
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Search,
  Calendar,
  Activity,
} from "lucide-react"

interface StockOverviewProps {
  onSelectMaterial: (material: Material) => void
  selectedMaterialId: string | null
}

function TrendIconComponent({ trend }: { trend: Material["consumptionTrend"] }) {
  const colorClass = getTrendColor(trend)
  switch (trend) {
    case "increasing":
      return <TrendingUp className={`h-4 w-4 ${colorClass}`} />
    case "decreasing":
      return <TrendingDown className={`h-4 w-4 ${colorClass}`} />
    case "spike":
      return <AlertTriangle className={`h-4 w-4 ${colorClass}`} />
    default:
      return <Minus className={`h-4 w-4 ${colorClass}`} />
  }
}

/**
 * Utility to calculate predictive date based on days until shortage
 */
function getPredictiveDate(days: number | null): string {
  if (days === null || days === 999) return "STABLE"
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `BY ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}`
}

export function StockOverview({ onSelectMaterial, selectedMaterialId }: StockOverviewProps) {
  const [liveMaterials, setLiveMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Fetch live prediction data for project ID: 1
    fetch("http://localhost:8000/predict/shortage/all/1")
      .then((res) => res.json())
      .then((data) => {
        setLiveMaterials(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch live materials", err)
        // Fallback to dummy materials if Python engine is off
        setLiveMaterials(materials)
        setIsLoading(false)
      })
  }, [])

  // Filter materials based on search query
  const filteredMaterials = liveMaterials.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group materials by category
  const groupedMaterials: Record<string, Material[]> = filteredMaterials.reduce((acc: Record<string, Material[]>, material: Material) => {
    if (!acc[material.category]) {
      acc[material.category] = []
    }
    acc[material.category].push(material)
    return acc
  }, {} as Record<string, Material[]>)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 text-muted-foreground animate-pulse">
        <Package className="h-12 w-12 opacity-20" />
        <p className="font-bold uppercase tracking-widest text-xs">Synchronizing Inventory Hub...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Dynamic Search & Filter Bar */}
      <div className="px-6 py-4 bg-muted/30 border-b flex items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search material manifest (e.g., 'Steel', 'Cement')..."
            className="pl-10 h-10 border-2 bg-background/50 focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="h-10 px-4 border-2 font-black uppercase text-[10px] tracking-widest bg-background/50">
          Showing {filteredMaterials.length} Items
        </Badge>
      </div>

      <div className="px-6 pb-10 space-y-10">
        {Object.entries(groupedMaterials).map(([category, categoryMaterials]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">
                {category}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent ml-2" />
            </div>

            <div className="overflow-hidden rounded-2xl border-2 bg-card/40 backdrop-blur-sm shadow-sm">
              <div className="flex flex-col">
                {categoryMaterials.map((material, idx) => {
                  const total = material.totalStock || 1
                  const usedPercentage = (material.consumed / total) * 100
                  const availablePercentage = Math.min(
                    100 - usedPercentage,
                    (material.available / total) * 100
                  )
                  const isSelected = selectedMaterialId === material.id

                  return (
                    <div
                      key={material.id}
                      className={`group flex flex-col md:flex-row items-start md:items-center gap-6 p-5 transition-all hover:bg-secondary/40 cursor-pointer ${
                        isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary/50 shadow-inner" : ""
                      } ${idx !== categoryMaterials.length - 1 ? "border-b-2" : ""}`}
                      onClick={() => onSelectMaterial(material)}
                    >
                      {/* Material Identity */}
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-lg tracking-tight">{material.name}</span>
                          <Badge
                            variant="secondary"
                            className={`${getStockLevelColor(material.stockLevel)} text-[9px] py-0 px-1.5 h-4 uppercase font-black tracking-tighter shadow-sm`}
                          >
                            {material.stockLevel}
                          </Badge>
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest opacity-60">
                          ID: {material.id} • {material.unit}
                        </div>
                      </div>

                      {/* Stock Usage Bar - High Visibility */}
                      <div className="w-full md:w-80 space-y-2">
                        <div className="flex justify-between items-end text-[10px] font-black uppercase text-muted-foreground tracking-tighter">
                          <span className="flex items-center gap-1.5">
                            <Activity className="h-3 w-3" /> Utilization Pulse
                          </span>
                          <span className="text-foreground bg-background px-2 py-0.5 rounded border">
                            {material.available.toLocaleString()} {material.unit} REMAINING
                          </span>
                        </div>
                        <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden border-2 border-border shadow-inner">
                          <div
                            className="absolute left-0 top-0 h-full bg-success transition-all duration-700 ease-in-out shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                            style={{ width: `${availablePercentage}%` }}
                          />
                          <div
                            className="absolute top-0 h-full bg-destructive/40 transition-all duration-700 ease-in-out"
                            style={{ left: `${availablePercentage}%`, width: `${usedPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Metrics Section */}
                      <div className="flex items-center gap-10 md:gap-16 px-4">
                        {/* Daily Avg */}
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Rate / Day</span>
                          <div className="flex items-center gap-2 mt-1.5">
                            <TrendIconComponent trend={material.consumptionTrend} />
                            <span className="text-base font-black tracking-tighter">{material.dailyAvgConsumption}</span>
                          </div>
                        </div>

                        {/* Forecast */}
                        <div className="flex flex-col items-center min-w-[100px]">
                          <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Exhaustion</span>
                          <div className={`flex items-center gap-1.5 text-sm font-black mt-1.5 ${
                            material.daysUntilShortage !== null && material.daysUntilShortage <= 5 
                              ? "text-destructive" 
                              : material.daysUntilShortage !== null && material.daysUntilShortage <= 15 
                              ? "text-warning" 
                              : "text-success"
                          }`}>
                            <Calendar className="h-3.5 w-3.5" />
                            {getPredictiveDate(material.daysUntilShortage)}
                          </div>
                        </div>
                      </div>

                      {/* Desktop Selection Indicator */}
                      <div className={`hidden md:block w-1.5 h-10 rounded-full transition-all duration-300 ${isSelected ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-transparent group-hover:bg-primary/20"}`} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
        {filteredMaterials.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl">
            <Search className="h-10 w-10 opacity-20 mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs italic">No materials matching your search criteria...</p>
          </div>
        )}
      </div>
    </div>
  )
}
