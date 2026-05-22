"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
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
  ChevronDown,
  ChevronRight,
  Loader2,
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
  const [categories, setCategories] = useState<{category: string, count: number}[]>([])
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch Category Summary first (very fast)
  useEffect(() => {
    setIsLoadingSummary(true)
    fetch(`http://localhost:8000/predict/shortage/categories/1?search=${searchQuery}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data)
        } else {
          console.error("API returned non-array data:", data)
          setCategories([])
        }
        setIsLoadingSummary(false)
      })
      .catch(err => {
        console.error("Failed to fetch categories", err)
        setCategories([])
        setIsLoadingSummary(false)
      })
  }, [searchQuery])

  if (isLoadingSummary && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 text-muted-foreground animate-pulse">
        <Package className="h-12 w-12 opacity-20" />
        <p className="font-bold uppercase tracking-widest text-xs text-center">
          Calibrating Inventory Matrix...<br/>
          <span className="opacity-50 text-[10px]">Optimizing throughput for 71+ manifests</span>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Dynamic Search Bar */}
      <div className="px-6 py-4 bg-muted/30 border-b flex items-center gap-4 sticky top-0 z-20 backdrop-blur-md">
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
          Syncing ML Forecasts
        </Badge>
      </div>

      <div className="px-6 pb-10 space-y-12">
        {categories?.map((cat) => (
          <CategoryPagingSection 
            key={cat.category}
            category={cat.category}
            totalItems={cat.count}
            searchQuery={searchQuery}
            onSelectMaterial={onSelectMaterial}
            selectedMaterialId={selectedMaterialId}
          />
        ))}
        
        {categories.length === 0 && !isLoadingSummary && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl">
            <Search className="h-10 w-10 opacity-20 mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs italic text-center">
              No materials matching "{searchQuery}"<br/>
              <span className="text-[10px] opacity-50 mt-2 block">Refine search criteria or clear filters</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * High-Performance Categorized Pagination Section
 */
function CategoryPagingSection({ 
  category, 
  totalItems, 
  searchQuery, 
  onSelectMaterial, 
  selectedMaterialId 
}: { 
  category: string, 
  totalItems: number, 
  searchQuery: string,
  onSelectMaterial: (m: Material) => void,
  selectedMaterialId: string | null
}) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const itemsPerPage = 4
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  useEffect(() => {
    setIsPageLoading(true)
    fetch(`http://localhost:8000/predict/shortage/all/1?category=${encodeURIComponent(category)}&page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`)
      .then(res => res.json())
      .then(data => {
        setMaterials(data.data || [])
        setIsPageLoading(false)
      })
      .catch(err => {
        console.error(`Page load failed for ${category}`, err)
        setIsPageLoading(false)
      })
  }, [category, currentPage, searchQuery])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <Package className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">
          {category}
        </h3>
        <Badge variant="outline" className="text-[9px] font-bold border-muted/50 text-muted-foreground ml-1">
          {totalItems} TOTAL
        </Badge>
        {isPageLoading && (
          <div className="ml-2 flex items-center gap-2">
            <div className="h-1.5 w-1.5 bg-primary rounded-full animate-ping" />
            <span className="text-[8px] font-black text-primary/60 uppercase tracking-tighter">Syncing Page...</span>
          </div>
        )}
        <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent ml-2" />
      </div>

      <div className="overflow-hidden rounded-2xl border-2 bg-card/40 backdrop-blur-sm shadow-sm">
        <div className={`flex flex-col min-h-[400px] transition-opacity duration-300 ${isPageLoading ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
          {isPageLoading && materials.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Analyzing Stock Ledger...
              </span>
            </div>
          ) : (
            materials.map((material, idx) => {
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
                } ${idx !== materials.length - 1 ? "border-b-2" : ""}`}
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

                {/* Stock Usage Bar */}
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

                {/* Metrics */}
                <div className="flex items-center gap-10 md:gap-16 px-4">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Rate / Day</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <TrendIconComponent trend={material.consumptionTrend} />
                      <span className="text-base font-black tracking-tighter">{material.dailyAvgConsumption}</span>
                    </div>
                  </div>

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

                <div className={`hidden md:block w-1.5 h-10 rounded-full transition-all duration-300 ${isSelected ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-transparent group-hover:bg-primary/20"}`} />
              </div>
            )
          }))}
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 bg-muted/10 border-t-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1 || isPageLoading}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3 h-8 rounded border-2 bg-background/50 hover:bg-background disabled:opacity-30 disabled:hover:bg-background/50 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              &lt; Previous
            </button>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1
              if (
                pageNum === 1 || 
                pageNum === totalPages || 
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    disabled={isPageLoading}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded border-2 text-[10px] font-black transition-all ${
                      currentPage === pageNum 
                        ? "bg-primary text-primary-foreground border-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" 
                        : "bg-background/50 hover:bg-background border-border"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              }
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} className="px-1 text-muted-foreground font-bold">...</span>
              }
              return null
            })}

            <button
              disabled={currentPage === totalPages || isPageLoading}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-3 h-8 rounded border-2 bg-background/50 hover:bg-background disabled:opacity-30 disabled:hover:bg-background/50 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Next &gt;
            </button>
          </div>

          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Page <span className="text-foreground">{currentPage}</span> of {totalPages}
          </div>
        </div>
      </div>
    </div>
  )
}
