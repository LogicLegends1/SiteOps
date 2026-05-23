"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Activity } from "@/lib/site-data"
import {
  type Subtask,
  getSubtaskCounts,
  getActivityDeadline,
} from "@/lib/subtasks-data"
import { SubtasksList } from "@/components/site-progress/subtasks-list"
import { SubtaskTimeline } from "@/components/site-progress/subtask-timeline"
import { cn } from "@/lib/utils"
import { fetchWeatherForecast, transformWeatherData } from "@/lib/weather-api"
import { weatherForecast, type WeatherForecast } from "@/lib/delay-engine-data"
import {
  Calendar,
  MapPin,
  Activity as ActivityIcon,
  AlertTriangle,
  Cloud,
  CloudRain,
  CloudLightning,
  Droplets,
  Sun,
  Wind,
  ListTodo,
  Clock,
  Users,
} from "lucide-react"
import { getIssuesByActivityId, getPriorityColor, getIssueStatusColor } from "@/lib/issues-data"

interface ActivityWorkerDetail {
  id: number
  name: string
  role: string
  discipline: string
  experience: number
  teamName: string | null
  isAvailable: boolean
}

interface ActivityDetailsPanelProps {
  activity: Activity | null
  subtasks: Subtask[]
  progressPercent: number
  onToggleSubtask?: (subtaskId: string) => void
  onSubtaskUpdate?: (subtaskId: string, description: string, evidencePhotoUrl?: string) => void
  onUpdateSubmitted?: () => void
  activityWorkers?: ActivityWorkerDetail[]
  initialTab?: string
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

function capitalizeRole(role: string): string {
  return role.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ActivityDetailsPanel({
  activity,
  subtasks,
  progressPercent,
  onToggleSubtask,
  onSubtaskUpdate,
  activityWorkers = [],
  initialTab,
}: ActivityDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState(initialTab || "overview")

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
  }, [initialTab])

  const [activityWeather, setActivityWeather] = useState<WeatherForecast[]>([])
  const [loadingWeather, setLoadingWeather] = useState(false)
  const [weatherError, setWeatherError] = useState<string | null>(null)

  const activityIssues = activity ? getIssuesByActivityId(activity.zoneID) : []
  const { completed, total } = getSubtaskCounts(subtasks)
  const deadline = activity ? getActivityDeadline(activity) : null

  const hasActivityCoordinates =
    typeof activity?.lat === "number" && typeof activity?.lng === "number"
  const activityCoordinateLabel = hasActivityCoordinates
    ? `${activity!.lat.toFixed(4)}, ${activity!.lng.toFixed(4)}`
    : "No coordinates"

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

  const handleSubtaskUpdate = useCallback(
    (subtaskId: string, description: string, evidencePhotoUrl?: string) => {
      onSubtaskUpdate?.(subtaskId, description, evidencePhotoUrl)
    },
    [onSubtaskUpdate]
  )

  if (!activity) {
    return (
      <Card className="bg-card border-border w-full">
        <CardHeader>
          <CardTitle className="text-foreground">Activity Details</CardTitle>
          <CardDescription>Select an activity on the map or from the overview panel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No activity selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click a map marker or an activity in the sidebar
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border w-full flex flex-col">
      <CardHeader className="pb-3 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl text-foreground">{activity.name}</CardTitle>
            <CardDescription className="mt-1">
              {activity.description || activity.activity || "No description"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-3xl font-bold text-primary">{progressPercent}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completed} of {total} subtasks completed
            </span>
            <span className="font-medium text-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
        </div>

        {deadline && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>
              Deadline: <span className="text-foreground font-medium">{formatDate(deadline)}</span>
            </span>
          </div>
        )}
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        <div className="border-b border-border px-6">
          <TabsList className="grid w-full max-w-lg grid-cols-5 bg-transparent h-auto p-0 gap-0">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs py-3"
            >
              <ActivityIcon className="h-3.5 w-3.5 mr-1.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs py-3"
            >
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="weather"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs py-3"
            >
              <Cloud className="h-3.5 w-3.5 mr-1.5" />
              Weather
            </TabsTrigger>
            <TabsTrigger
              value="issues"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs py-3"
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              Issues
              {activityIssues.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                  {activityIssues.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="people"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs py-3"
            >
              <Users className="h-3.5 w-3.5 mr-1.5" />
              People
              {activityWorkers.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                  {activityWorkers.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-5 px-6 pb-6 flex-1 overflow-y-auto">
          <TabsContent value="overview" className="space-y-4 mt-0">
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Subtasks</h4>
            </div>
            <SubtasksList subtasks={subtasks} onToggleComplete={onToggleSubtask} />
            {subtasks.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No subtasks in the database for this activity yet. Add rows to the{" "}
                <code className="text-foreground">subtask</code> table linked by{" "}
                <code className="text-foreground">activityid</code>.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Click a subtask to mark complete. Progress is calculated from completed subtasks.
              </p>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="mt-0">
            <p className="text-xs text-muted-foreground mb-4">
              Timeline is organized by subtasks. Add updates per step or mark steps complete.
            </p>
            <SubtaskTimeline
              subtasks={subtasks}
              onAddUpdate={handleSubtaskUpdate}
              onToggleComplete={onToggleSubtask}
            />
          </TabsContent>

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
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
                  {activityWeather.map((day) => {
                    const Icon = getWeatherIcon(day.condition)
                    return (
                      <div
                        key={day.date}
                        className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            {formatDate(day.date)}
                          </span>
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex items-end justify-between gap-2">
                          <span className="text-xl font-bold text-foreground">
                            {day.temperature}C
                          </span>
                          <Badge
                            className={cn(
                              "text-[10px] capitalize",
                              getImpactBadgeClass(day.impactLevel)
                            )}
                          >
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
                        {Math.round(
                          activityWeather.reduce((t, d) => t + d.windSpeed, 0) /
                            activityWeather.length
                        )}{" "}
                        km/h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Rain Risk Days</p>
                      <p className="text-sm font-medium text-foreground">
                        {activityWeather.filter((d) => d.precipitation > 30).length} days
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="issues" className="space-y-4 mt-0">
            {activityIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="h-8 w-8 text-success mb-2" />
                <p className="text-sm text-muted-foreground">No issues reported for this activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 rounded-lg bg-secondary/30 border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getIssueTypeIcon(issue.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-foreground">{issue.title}</span>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getPriorityColor(issue.priority))}
                          >
                            {issue.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{issue.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getIssueStatusColor(issue.status))}
                          >
                            {issue.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{issue.owner}</span>
                          <span className="text-xs text-muted-foreground">
                            · {formatDate(issue.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="people" className="space-y-4 mt-0">
            {activityWorkers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No team members assigned to this activity</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Assign workers via the workforce_team table linked by activityid
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Team Members ({activityWorkers.length})
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                  {activityWorkers.map((worker) => (
                    <div
                      key={worker.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border"
                    >
                      <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {worker.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{worker.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            {capitalizeRole(worker.role)}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {capitalizeRole(worker.discipline)}
                          </span>
                        </div>
                      </div>
                      {worker.teamName && (
                        <span className="text-[10px] text-muted-foreground shrink-0 hidden lg:block">
                          {worker.teamName}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
