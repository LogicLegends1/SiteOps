"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts"
import {
  getTrendColor,
  type Material,
} from "@/lib/material-data"
import { TrendingUp, TrendingDown, AlertTriangle, Minus } from "lucide-react"

interface ConsumptionTrendChartProps {
  material: Material | null
}

function TrendIcon({ trend }: { trend: Material["consumptionTrend"] }) {
  switch (trend) {
    case "increasing":
      return <TrendingUp className="h-4 w-4" />
    case "decreasing":
      return <TrendingDown className="h-4 w-4" />
    case "spike":
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <Minus className="h-4 w-4" />
  }
}

export function ConsumptionTrendChart({ material }: ConsumptionTrendChartProps) {
  const [data, setData] = useState<{date: string, actual: number, planned: number}[]>([])

  useEffect(() => {
    if (material && material.id) {
      // Use clean IDs for fetching
      const rawId = material.id.replace("MAT-", "")
      fetch(`http://localhost:8000/predict/trend/1/${rawId}`)
        .then((res) => res.json())
        .then((respData) => setData(respData))
        .catch((err) => console.error("Failed to load trend", err))
    }
  }, [material])

  if (!material) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consumption Trend</CardTitle>
          <CardDescription>Select a material to view consumption trends</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          Click on a material card to view its consumption history
        </CardContent>
      </Card>
    )
  }

  const hasData = data.length > 0

  // Calculate variance percentage
  const totalPlanned = data.reduce((sum, d) => sum + d.planned, 0)
  const totalActual = data.reduce((sum, d) => sum + d.actual, 0)
  const variancePercent = totalPlanned > 0 ? ((totalActual - totalPlanned) / totalPlanned) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{material.name}</CardTitle>
            <CardDescription>
              7-day consumption trend (Planned vs Actual)
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant="outline"
              className={`${getTrendColor(material.consumptionTrend)} flex items-center gap-1`}
            >
              <TrendIcon trend={material.consumptionTrend} />
              {material.consumptionTrend}
            </Badge>
            {variancePercent !== 0 && (
              <span
                className={`text-xs ${
                  variancePercent > 0 ? "text-warning" : "text-success"
                }`}
              >
                {variancePercent > 0 ? "+" : ""}
                {variancePercent.toFixed(1)}% variance
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} ${material.unit}`,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                />
                <Area
                  type="monotone"
                  dataKey="planned"
                  stroke="var(--color-primary)"
                  fill="url(#plannedGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="var(--color-warning)"
                  fill="url(#actualGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No consumption data available for this material
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Daily Average</p>
            <p className="text-lg font-semibold">
              {material.dailyAvgConsumption} <span className="text-xs text-muted-foreground">{material.unit}</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Reorder Level</p>
            <p className="text-lg font-semibold">
              {(material.reorderLevel || 0).toLocaleString()} <span className="text-xs text-muted-foreground">{material.unit}</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Days to Shortage</p>
            <p
              className={`text-lg font-semibold ${
                material.daysUntilShortage && material.daysUntilShortage <= 5
                  ? "text-destructive"
                  : material.daysUntilShortage && material.daysUntilShortage <= 10
                  ? "text-warning"
                  : ""
              }`}
            >
              {material.daysUntilShortage ?? "N/A"} <span className="text-xs text-muted-foreground">days</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
