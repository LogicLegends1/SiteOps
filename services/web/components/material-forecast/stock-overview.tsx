"use client"

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
  // Group materials by category
  const groupedMaterials = materials.reduce((acc, material) => {
    if (!acc[material.category]) {
      acc[material.category] = []
    }
    acc[material.category].push(material)
    return acc
  }, {} as Record<string, Material[]>)

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
              const usedPercentage = (material.consumed / material.totalStock) * 100
              const availablePercentage = (material.available / material.totalStock) * 100
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
                        <div
                          className="absolute left-0 top-0 h-full bg-destructive/60 rounded-full"
                          style={{ width: `${usedPercentage}%` }}
                        />
                        <div
                          className="absolute top-0 h-full bg-success rounded-full"
                          style={{ left: `${usedPercentage}%`, width: `${availablePercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-destructive">Consumed: {material.consumed.toLocaleString()}</span>
                        <span className="text-success">Available: {material.available.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Allocated */}
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Allocated:</span>
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
                    {material.daysUntilShortage !== null && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Days until shortage:</span>
                        <span
                          className={
                            material.daysUntilShortage <= 5
                              ? "text-destructive font-medium"
                              : material.daysUntilShortage <= 10
                              ? "text-warning font-medium"
                              : "text-foreground"
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
