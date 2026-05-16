"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Activity, type ProgressUpdate } from "@/lib/site-data"
import { ActivityStatusBadge } from "@/components/site-progress/activity-status-badge"
import { ActivityTimeline } from "@/components/site-progress/activity-timeline"
import { ProgressUpdateModal } from "@/components/site-progress/progress-update-modal"
import { cn } from "@/lib/utils"
import { fetchWeatherForecast, transformWeatherData } from "@/lib/weather-api"
import { weatherForecast, type WeatherForecast } from "@/lib/delay-engine-data"
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  Activity as ActivityIcon,
  CalendarClock,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  Cloud,
  CloudRain,
  CloudLightning,
  Droplets,
  Sun,
  Wind,
} from "lucide-react"
import { getIssuesByActivityId, getPriorityColor, getIssueStatusColor } from "@/lib/issues-data"

interface ActivityDetailsPanelProps {
  activity: Activity | null
  onUpdateSubmitted?: () => void
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getIssueTypeIcon(type: string) {
  switch (type) {
    case "material-delay":
      return "📦"
    case "equipment-failure":
      return "🔧"
    case "labour-shortage":
      return "👥"
    case "safety-issue":
      return "⚠️"
    default:
      return "❓"
  }
}

function getWeatherIcon(condition: WeatherForecast["condition"]) {
  switch (condition) {
    case "sunny":
      return Sun
    case "cloudy":
      return Cloud
    case "rainy":
      return CloudRain
    case "stormy":
      return CloudLightning
    default:
      return Cloud
  }
}

function getImpactBadgeClass(impact: WeatherForecast["impactLevel"]) {
  switch (impact) {
    case "severe":
      return "bg-destructive text-destructive-foreground"
    case "moderate":
      return "bg-warning text-warning-foreground"
    case "low":
      return "bg-amber-500 text-white"
    case "none":
      return "bg-success text-success-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function ActivityDetailsPanel({ activity, onUpdateSubmitted }: ActivityDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [logs, setLogs] = useState<ProgressUpdate[]>([])
  const [activityWeather, setActivityWeather] = useState<WeatherForecast[]>([])
  const [loadingWeather, setLoadingWeather] = useState(false)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const activityIssues = activity ? getIssuesByActivityId(activity.zoneID) : []
  const hasActivityCoordinates =
    typeof activity?.lat === "number" && typeof activity?.lng === "number"
  const activityCoordinateLabel = hasActivityCoordinates
    ? `${activity.lat.toFixed(4)}, ${activity.lng.toFixed(4)}`
    : "No coordinates"

  const fetchLogs = useCallback(async () => {
    if (!activity) return
    try {
      const res = await fetch(`/api/activity/${activity.zoneID}/logs`)
      if (!res.ok) return
      const { logs: raw } = await res.json()
      const mapped: ProgressUpdate[] = (raw ?? []).map((log: any) => ({
        id: String(log.logentryid),
        activityID: log.activityid,
        title: log.description,
        description: "",
        status: activity.status,
        updatedBy: "Site Engineer",
        updatedAt: log.timestamp,
        images: log.evidencephoto ? [log.evidencephoto] : undefined,
      }))
      setLogs(mapped)
    } catch {
      // silent
    }
  }, [activity?.zoneID])

  useEffect(() => {
    setLogs([])
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    let cancelled = false

    async function loadActivityWeather() {
      setActivityWeather([])
      setWeatherError(null)

      if (!activity) return

      if (typeof activity.lat !== "number" || typeof activity.lng !== "number") {
        setWeatherError("This activity does not have a latitude and longitude.")
        return
      }

      try {
        setLoadingWeather(true)
        const raw = await fetchWeatherForecast(activity.lat, activity.lng)
        const forecast = transformWeatherData(raw)
        if (!cancelled) setActivityWeather(forecast)
      } catch (error) {
        console.error("Activity weather fetch failed:", error)
        if (!cancelled) {
          setActivityWeather(weatherForecast)
          setWeatherError("Live weather could not be loaded, so sample forecast data is shown.")
        }
      } finally {
        if (!cancelled) setLoadingWeather(false)
      }
    }

    loadActivityWeather()

    return () => {
      cancelled = true
    }
  }, [activity?.zoneID, activity?.lat, activity?.lng])

  const handleUpdateSubmitted = useCallback(() => {
    fetchLogs()
    onUpdateSubmitted?.()
  }, [fetchLogs, onUpdateSubmitted])

  if (!activity) {
    return (
      <Card className="bg-card border-border h-full">
        <CardHeader>
          <CardTitle className="text-foreground">Activity Details</CardTitle>
          <CardDescription>Select an activity on the map to view details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No activity selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click on any activity in the map to see its details
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-foreground text-lg">{activity.name}</CardTitle>
            <CardDescription className="mt-1">{activity.activity}</CardDescription>
          </div>
        </div>

        {/* Status Badge - Primary */}
        <div className="mt-3">
          <ActivityStatusBadge status={activity.status} size="lg" />
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        <div className="border-b border-border px-6">
          <TabsList className="grid w-full grid-cols-5 bg-transparent">
            <TabsTrigger value="overview" className="border-b-2 border-transparent data-[state=active]:border-primary text-xs">
              <ActivityIcon className="h-3 w-3 mr-1.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="timeline" className="border-b-2 border-transparent data-[state=active]:border-primary text-xs">
              <TrendingUp className="h-3 w-3 mr-1.5" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="weather" className="border-b-2 border-transparent data-[state=active]:border-primary text-xs">
              <Cloud className="h-3 w-3 mr-1.5" />
              Weather
            </TabsTrigger>
            <TabsTrigger value="blockers" className="border-b-2 border-transparent data-[state=active]:border-primary text-xs">
              <AlertTriangle className="h-3 w-3 mr-1.5" />
              Blockers
            </TabsTrigger>
            <TabsTrigger value="details" className="border-b-2 border-transparent data-[state=active]:border-primary text-xs">
              <MessageSquare className="h-3 w-3 mr-1.5" />
              Details
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-4 px-6 flex-1 overflow-y-auto space-y-4">
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-0">
            {/* Quick Status Info */}
            <div className="p-3 rounded-lg bg-secondary/30 border border-border space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Current Status</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activity.description || "No description provided"}
              </p>
            </div>

            <Separator className="my-2" />

            {/* Team Assignment */}
            {(activity.assignedTeam || activity.assignedSupervisor) && (
              <>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Assignment
                  </h4>
                  <div className="grid gap-2">
                    {activity.assignedTeam && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-xs font-medium">Team:</span>
                        <span>{activity.assignedTeam}</span>
                      </div>
                    )}
                    {activity.assignedSupervisor && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-xs font-medium">Supervisor:</span>
                        <span>{activity.assignedSupervisor}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Separator className="my-2" />
              </>
            )}

            {/* Schedule Info */}
            {(activity.startDate || activity.expectedCompletion) && (
              <>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Schedule
                  </h4>
                  <div className="grid gap-2">
                    {activity.startDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs font-medium">Start:</span>
                        <span>{formatDate(activity.startDate)}</span>
                      </div>
                    )}
                    {activity.expectedCompletion && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs font-medium">Target:</span>
                        <span>{formatDate(activity.expectedCompletion)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4 mt-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Progress Updates
              </h4>
              <ProgressUpdateModal activity={activity} onUpdateSubmitted={handleUpdateSubmitted} />
            </div>
            <ActivityTimeline updates={logs} />
          </TabsContent>

          {/* Weather Tab */}
          <TabsContent value="weather" className="space-y-4 mt-0">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Activity Weather Forecast
              </h4>
              <Badge variant="outline" className="text-xs">
                {activityCoordinateLabel}
              </Badge>
            </div>

            {weatherError && (
              <div className="rounded-lg border border-warning/50 bg-warning/5 p-3 text-xs text-muted-foreground">
                {weatherError}
              </div>
            )}

            {loadingWeather ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                Loading activity forecast...
              </div>
            ) : activityWeather.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Cloud className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No forecast data available</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-2">
                  {activityWeather.map((day) => {
                    const Icon = getWeatherIcon(day.condition)
                    return (
                      <div key={day.date} className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-muted-foreground">{formatDate(day.date)}</span>
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex items-end justify-between gap-2">
                          <span className="text-xl font-bold text-foreground">{day.temperature}C</span>
                          <Badge className={cn("text-[10px] capitalize", getImpactBadgeClass(day.impactLevel))}>
                            {day.impactLevel}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                          <span>{day.precipitation}% rain</span>
                          <span>{day.windSpeed} km/h</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                    <Wind className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Avg. Wind Speed</p>
                      <p className="text-sm font-medium text-foreground">
                        {Math.round(activityWeather.reduce((total, day) => total + day.windSpeed, 0) / activityWeather.length)} km/h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Rain Risk Days</p>
                      <p className="text-sm font-medium text-foreground">
                        {activityWeather.filter((day) => day.precipitation > 30).length} days
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Blockers Tab */}
          <TabsContent value="blockers" className="space-y-4 mt-0">
            {activityIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <AlertTriangle className="h-8 w-8 text-success mb-2" />
                <p className="text-sm text-muted-foreground">No blockers reported</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityIssues.map((issue) => (
                  <div key={issue.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{getIssueTypeIcon(issue.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-foreground">{issue.title}</span>
                          <Badge variant="outline" className={cn("text-xs", getPriorityColor(issue.priority))}>
                            {issue.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{issue.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("text-xs", getIssueStatusColor(issue.status))}>
                            {issue.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{issue.owner}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-3 mt-0 text-xs">
            <div className="p-2 rounded bg-secondary/30 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Zone ID:</span>
                <span className="font-semibold text-foreground">{activity.zoneID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Project ID:</span>
                <span className="font-semibold text-foreground">{activity.projectID}</span>
              </div>
              {activity.createdAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Created:</span>
                  <span className="font-semibold text-foreground">{formatDate(activity.createdAt)}</span>
                </div>
              )}
              {activity.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Updated:</span>
                  <span className="font-semibold text-foreground">{formatDate(activity.updatedAt)}</span>
                </div>
              )}
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
