"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WeatherForecast, ActivityProgress } from "@/lib/delay-engine-data"
import { Sun, Cloud, CloudRain, CloudLightning, Wind, Droplets, AlertTriangle } from "lucide-react"
import { format, parseISO } from "date-fns"

interface WeatherImpactPanelProps {
  forecast: WeatherForecast[]
  activities: ActivityProgress[]
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
      return Sun
  }
}

function getImpactColor(impact: WeatherForecast["impactLevel"]) {
  switch (impact) {
    case "severe":
      return "bg-destructive text-destructive-foreground"
    case "moderate":
      return "bg-warning text-warning-foreground"
    case "low":
      return "bg-amber-500/80 text-white"
    case "none":
      return "bg-success text-success-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function WeatherImpactPanel({ forecast, activities }: WeatherImpactPanelProps) {
  const weatherSensitiveActivities = activities.filter((a) => a.weatherSensitive && a.actualProgress < 100)
  const severeWeatherDays = forecast.filter((f) => f.impactLevel === "severe" || f.impactLevel === "moderate")

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Weather Impact Analysis
          </CardTitle>
          {severeWeatherDays.length > 0 && (
            <Badge className="bg-warning text-warning-foreground">
              {severeWeatherDays.length} Days at Risk
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 7-Day Forecast */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">7-Day Forecast</h4>
          <div className="grid grid-cols-7 gap-2">
            {forecast.map((day) => {
              const Icon = getWeatherIcon(day.condition)
              const isToday = day.date === format(new Date(), "yyyy-MM-dd")
              return (
                <div
                  key={day.date}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border ${
                    isToday
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <span className="text-xs text-muted-foreground">
                    {isToday ? "Today" : format(parseISO(day.date), "EEE")}
                  </span>
                  <Icon
                    className={`h-6 w-6 ${
                      day.condition === "sunny"
                        ? "text-amber-400"
                        : day.condition === "stormy"
                        ? "text-destructive"
                        : day.condition === "rainy"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-sm font-medium text-foreground">{day.temperature}°C</span>
                  <Badge className={`text-[10px] px-1.5 py-0 ${getImpactColor(day.impactLevel)}`}>
                    {day.impactLevel}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Avg. Wind Speed</p>
              <p className="text-sm font-medium text-foreground">
                {Math.round(forecast.reduce((a, b) => a + b.windSpeed, 0) / forecast.length)} km/h
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Precipitation Risk</p>
              <p className="text-sm font-medium text-foreground">
                {forecast.filter((f) => f.precipitation > 30).length} days
              </p>
            </div>
          </div>
        </div>

        {/* Affected Activities */}
        {weatherSensitiveActivities.length > 0 && severeWeatherDays.length > 0 && (
          <div className="rounded-lg border border-warning/50 bg-warning/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-foreground">Activities at Weather Risk</span>
            </div>
            <div className="space-y-2">
              {weatherSensitiveActivities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{activity.activityName}</span>
                  <span className="text-muted-foreground">{activity.zoneName}</span>
                </div>
              ))}
              {weatherSensitiveActivities.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{weatherSensitiveActivities.length - 3} more activities
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
