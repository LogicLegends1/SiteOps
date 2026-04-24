"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ActivityComparisonTable } from "@/components/delay-engine/activity-comparison-table"
import { DelayAlertsPanel } from "@/components/delay-engine/delay-alerts-panel"
import { WeatherImpactPanel } from "@/components/delay-engine/weather-impact-panel"
import { RiskMap } from "@/components/delay-engine/risk-map"
import { ActivityDetailsPanel } from "@/components/delay-engine/activity-details-panel"
import {
  activityProgress,
  delayAlerts as initialAlerts,
  weatherForecast,
  calculateOverallRisk,
  getRiskLevelColor,
  ActivityProgress,
  DelayAlert,
} from "@/lib/delay-engine-data"
import {
  AlertTriangle,
  TrendingDown,
  Clock,
  Activity,
  BarChart3,
} from "lucide-react"

export default function PredictiveDelayEnginePage() {
  const [selectedActivity, setSelectedActivity] = useState<ActivityProgress | null>(null)
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<DelayAlert[]>(initialAlerts)
  const [zoneFilter, setZoneFilter] = useState<string>("all")

  const overallRisk = calculateOverallRisk()

  const filteredActivities =
    zoneFilter === "all"
      ? activityProgress
      : activityProgress.filter((a) => a.zoneId === zoneFilter)

  const handleSelectActivity = (activity: ActivityProgress) => {
    setSelectedActivity(activity)
    setSelectedZoneId(activity.zoneId)
  }

  const handleSelectZone = (zoneId: string) => {
    setSelectedZoneId(zoneId)
    const firstActivity = activityProgress.find((a) => a.zoneId === zoneId)
    if (firstActivity) {
      setSelectedActivity(firstActivity)
    }
    setZoneFilter(zoneId)
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    )
  }

  // Calculate stats
  const totalActivities = activityProgress.length
  const delayedActivities = activityProgress.filter((a) => a.variance < -10).length
  const criticalActivities = activityProgress.filter((a) => a.riskLevel === "critical").length
  const avgVariance = Math.round(
    activityProgress.reduce((a, b) => a + b.variance, 0) / totalActivities
  )
  const activeAlerts = alerts.filter((a) => !a.acknowledged).length

  const zones = [...new Map(activityProgress.map((a) => [a.zoneId, { id: a.zoneId, name: a.name }])).values()]

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Overall Risk Score</p>
                <p className="text-2xl font-bold text-foreground">{overallRisk.score}%</p>
              </div>
              <div className={`p-3 rounded-lg ${getRiskLevelColor(overallRisk.level)}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <Badge className={`mt-2 capitalize ${getRiskLevelColor(overallRisk.level)}`}>
              {overallRisk.level} Risk
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Activities</p>
                <p className="text-2xl font-bold text-foreground">{totalActivities}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/20">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across {zones.length} zones
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Behind Schedule</p>
                <p className="text-2xl font-bold text-destructive">{delayedActivities}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/20">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {criticalActivities} critical
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg. Variance</p>
                <p className={`text-2xl font-bold ${avgVariance < 0 ? "text-destructive" : "text-success"}`}>
                  {avgVariance > 0 ? "+" : ""}{avgVariance}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Planned vs Actual
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Active Alerts</p>
                <p className="text-2xl font-bold text-warning">{activeAlerts}</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/20">
                <Clock className="h-5 w-5 text-warning" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activities Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filter & Table */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Planned vs Actual Progress
                </CardTitle>
                <Select value={zoneFilter} onValueChange={setZoneFilter}>
                  <SelectTrigger className="w-40 border-border bg-background">
                    <SelectValue placeholder="Filter by zone" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All Zones</SelectItem>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ActivityComparisonTable
                activities={filteredActivities}
                onSelectActivity={handleSelectActivity}
                selectedActivityId={selectedActivity?.id || null}
              />
            </CardContent>
          </Card>

          {/* Alerts Panel */}
          <DelayAlertsPanel alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />
        </div>

        {/* Right Column - Map, Weather, Details */}
        <div className="space-y-6">
          <RiskMap
            activities={activityProgress}
            onSelectZone={handleSelectZone}
            selectedZoneId={selectedZoneId}
          />
          <WeatherImpactPanel forecast={weatherForecast} activities={activityProgress} />
          <ActivityDetailsPanel activity={selectedActivity} />
        </div>
      </div>
    </div>
  )
}
