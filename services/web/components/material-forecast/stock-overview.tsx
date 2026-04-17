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
import {
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
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

export function StockOverview({ onSelectMaterial, selectedMaterialId }: StockOverviewProps) {
  const [liveMaterials, setLiveMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  // Group materials by category (using live server data!)
  const groupedMaterials: Record<string, Material[]> = liveMaterials.reduce((acc: Record<string, Material[]>, material: Material) => {
    if (!acc[material.category]) {
      acc[material.category] = []
    }
    acc[material.category].push(material)
    return acc
  }, {} as Record<string, Material[]>)

  if (isLoading) {
    return <div className="text-muted-foreground p-4">Loading real-time material parameters...</div>
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedMaterials).map(([category, categoryMaterials]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <Package className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {category}
            </h3>
            <div className="h-px flex-1 bg-border/50 ml-2" />
          </div>

          <div className="overflow-hidden rounded-xl border bg-card/30">
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
                    className={`group flex flex-col md:flex-row items-start md:items-center gap-4 p-4 transition-all hover:bg-secondary/40 cursor-pointer ${
                      isSelected ? "bg-secondary/60 ring-1 ring-inset ring-primary" : ""
                    } ${idx !== categoryMaterials.length - 1 ? "border-b" : ""}`}
                    onClick={() => onSelectMaterial(material)}
                  >
                    {/* Material Identity */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base">{material.name}</span>
                        <Badge
                          variant="secondary"
                          className={`${getStockLevelColor(material.stockLevel)} text-[10px] py-0 px-1.5 h-4 uppercase tracking-tighter`}
                        >
                          {material.stockLevel}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        ID: {material.id} • {material.unit}
                      </div>
                    </div>

                    {/* Stock Usage Bar - High Visibility */}
                    <div className="w-full md:w-64 space-y-1.5">
                      <div className="flex justify-between items-end text-[10px] font-medium uppercase text-muted-foreground">
                        <span>Stock Bar</span>
                        <span className="text-foreground">
                          {material.available.toLocaleString()} {material.unit} left
                        </span>
                      </div>
                      <div className="relative h-3 w-full bg-secondary/80 rounded-full overflow-hidden border border-border/50 shadow-inner">
                        <div
                          className="absolute left-0 top-0 h-full bg-success transition-all duration-500 ease-out shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                          style={{ width: `${availablePercentage}%` }}
                        />
                        <div
                          className="absolute top-0 h-full bg-destructive/60 transition-all duration-500 ease-out"
                          style={{ left: `${availablePercentage}%`, width: `${usedPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics Section */}
                    <div className="flex items-center gap-8 md:gap-12 px-2">
                      {/* Daily Avg */}
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Daily Avg</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <TrendIconComponent trend={material.consumptionTrend} />
                          <span className="text-sm font-bold">{material.dailyAvgConsumption}</span>
                        </div>
                      </div>

                      {/* Forecast */}
                      <div className="flex flex-col items-center min-w-[80px]">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Forecast</span>
                        <div className={`text-sm font-black mt-0.5 ${
                          material.daysUntilShortage !== null && material.daysUntilShortage <= 5 
                            ? "text-destructive" 
                            : material.daysUntilShortage !== null && material.daysUntilShortage <= 15 
                            ? "text-warning" 
                            : "text-success"
                        }`}>
                          {material.daysUntilShortage !== null && material.daysUntilShortage !== 999 
                            ? `${material.daysUntilShortage} DAYS` 
                            : "STABLE"}
                        </div>
                      </div>
                    </div>

                    {/* Desktop Selection Indicator */}
                    <div className={`hidden md:block w-1 h-8 rounded-full transition-all ${isSelected ? "bg-primary" : "bg-transparent group-hover:bg-primary/20"}`} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
