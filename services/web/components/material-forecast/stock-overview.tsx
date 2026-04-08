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
    <div className="space-y-6">
      {Object.entries(groupedMaterials).map(([category, categoryMaterials]) => (
        <div key={category}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" />
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryMaterials.map((material) => {
              // Ensure we don't divide by 0
              const total = material.totalStock || 1
              const usedPercentage = (material.consumed / total) * 100
              const availablePercentage = Math.min(100 - usedPercentage, (material.available / total) * 100)
              const isSelected = selectedMaterialId === material.id

              return (
                <Card
                  key={material.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? "ring-2 ring-primary" : ""
                  } ${getStockLevelBorder(material.stockLevel)}`}
                  onClick={() => onSelectMaterial(material)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium leading-tight">
                        {material.name}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className={getStockLevelColor(material.stockLevel)}
                      >
                        {material.stockLevel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Stock Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Stock Usage</span>
                        <span>
                          {material.available.toLocaleString()} / {material.totalStock.toLocaleString()} {material.unit}
                        </span>
                      </div>
                      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                        {/* GREEN/AVAILABLE ON THE LEFT */}
                        <div
                          className="absolute left-0 top-0 h-full bg-success rounded-full transition-all"
                          style={{ width: `${availablePercentage}%` }}
                        />
                        {/* RED/CONSUMED ON THE RIGHT */}
                        <div
                          className="absolute top-0 h-full bg-destructive/60 rounded-full transition-all"
                          style={{ left: `${availablePercentage}%`, width: `${usedPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-success font-medium">Available: {material.available.toLocaleString()}</span>
                        <span className="text-destructive font-medium">Consumed: {material.consumed.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Allocated */}
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Original Cap:</span>
                      <span>{material.allocated.toLocaleString()} {material.unit}</span>
                    </div>

                    {/* Consumption Trend */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Daily Avg:</span>
                      <div className="flex items-center gap-1">
                        <TrendIconComponent trend={material.consumptionTrend} />
                        <span>{material.dailyAvgConsumption} {material.unit}/day</span>
                      </div>
                    </div>

                    {/* Days Until Shortage */}
                    {material.daysUntilShortage !== undefined && material.daysUntilShortage !== 999 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Days until shortage:</span>
                        <span
                          className={
                            material.daysUntilShortage <= 5
                              ? "text-destructive font-bold"
                              : material.daysUntilShortage <= 15
                              ? "text-warning font-semibold"
                              : "text-success font-medium"
                          }
                        >
                          {material.daysUntilShortage} days
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
