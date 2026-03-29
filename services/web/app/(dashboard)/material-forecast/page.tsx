"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  materials,
  getMaterialStats,
  type Material,
} from "@/lib/material-data"
import { StockOverview } from "@/components/material-forecast/stock-overview"
import { ConsumptionTrendChart } from "@/components/material-forecast/consumption-trend-chart"
import { MaterialAlertsPanel } from "@/components/material-forecast/material-alerts-panel"
import { AffectedActivitiesPanel } from "@/components/material-forecast/affected-activities-panel"
import { DailyConsumptionForm } from "@/components/material-forecast/daily-consumption-form"
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Bell,
  Clock,
  Boxes,
} from "lucide-react"

export default function MaterialForecastPage() {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const stats = getMaterialStats()

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          Material Forecasting System
        </h1>
        <p className="text-muted-foreground mt-1">
          Track material usage, predict shortages, and ensure uninterrupted operations
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card hover:bg-secondary/50 transition-colors">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Materials</p>
                <p className="text-2xl font-bold">{stats.totalMaterials}</p>
              </div>
              <Boxes className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card hover:bg-secondary/50 transition-colors border-destructive/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Critical Stock</p>
                <p className="text-2xl font-bold text-destructive">{stats.criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card hover:bg-secondary/50 transition-colors border-warning/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-warning">{stats.lowStockCount}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card hover:bg-secondary/50 transition-colors">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Consumption Spikes</p>
                <p className="text-2xl font-bold">{stats.materialsWithSpike}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card hover:bg-secondary/50 transition-colors">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{stats.activeAlerts}</p>
              </div>
              <Bell className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shortage Predictions Banner */}
      {stats.criticalCount > 0 && (
        <Card className="bg-destructive/10 border-destructive/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">
                  {stats.criticalCount} material{stats.criticalCount > 1 ? "s" : ""} at critical level
                </p>
                <p className="text-sm text-muted-foreground">
                  {materials
                    .filter((m) => m.stockLevel === "critical")
                    .map((m) => `${m.name} (${m.daysUntilShortage} days)`)
                    .join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Overview Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Material Stock Overview
            </CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="secondary" className="bg-success/20 text-success">
                Adequate
              </Badge>
              <Badge variant="secondary" className="bg-warning/20 text-warning">
                Low
              </Badge>
              <Badge variant="secondary" className="bg-destructive/20 text-destructive">
                Critical
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StockOverview
            onSelectMaterial={setSelectedMaterial}
            selectedMaterialId={selectedMaterial?.id || null}
          />
        </CardContent>
      </Card>

      {/* Consumption Trend & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsumptionTrendChart material={selectedMaterial} />
        <MaterialAlertsPanel />
      </div>

      {/* Affected Activities & Daily Consumption Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AffectedActivitiesPanel selectedMaterial={selectedMaterial} />
        <DailyConsumptionForm />
      </div>
    </div>
  )
}
