export type RiskLevel = "low" | "medium" | "high" | "critical"

export interface WeatherForecast {
  date: string
  condition: "sunny" | "cloudy" | "rainy" | "stormy"
  temperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  impactLevel: "none" | "low" | "moderate" | "severe"
}

export interface ActivityProgress {
  id: string
  zoneId: string
  name: string
  activityName: string
  plannedProgress: number
  actualProgress: number
  variance: number
  plannedStartDate: string
  actualStartDate: string
  plannedEndDate: string
  estimatedEndDate: string
  daysDelayed: number
  riskLevel: RiskLevel
  riskFactors: string[]
  assignedTeam: string
  weatherSensitive: boolean
}

export interface DelayAlert {
  id: string
  activityId: string
  activityName: string
  name: string
  type: "schedule" | "weather" | "resource" | "dependency"
  severity: RiskLevel
  message: string
  recommendation: string
  createdAt: string
  acknowledged: boolean
}

export const weatherForecast: WeatherForecast[] = [
  {
    date: "2026-03-22",
    condition: "sunny",
    temperature: 28,
    humidity: 65,
    precipitation: 0,
    windSpeed: 12,
    impactLevel: "none",
  },
  {
    date: "2026-03-23",
    condition: "cloudy",
    temperature: 26,
    humidity: 70,
    precipitation: 10,
    windSpeed: 15,
    impactLevel: "low",
  },
  {
    date: "2026-03-24",
    condition: "rainy",
    temperature: 24,
    humidity: 85,
    precipitation: 60,
    windSpeed: 20,
    impactLevel: "moderate",
  },
  {
    date: "2026-03-25",
    condition: "stormy",
    temperature: 22,
    humidity: 90,
    precipitation: 85,
    windSpeed: 35,
    impactLevel: "severe",
  },
  {
    date: "2026-03-26",
    condition: "rainy",
    temperature: 23,
    humidity: 80,
    precipitation: 45,
    windSpeed: 18,
    impactLevel: "moderate",
  },
  {
    date: "2026-03-27",
    condition: "cloudy",
    temperature: 25,
    humidity: 72,
    precipitation: 15,
    windSpeed: 14,
    impactLevel: "low",
  },
  {
    date: "2026-03-28",
    condition: "sunny",
    temperature: 27,
    humidity: 60,
    precipitation: 0,
    windSpeed: 10,
    impactLevel: "none",
  },
]

export const activityProgress: ActivityProgress[] = [
  {
    id: "ACT-001",
    zoneId: "zone-a",
    name: "Zone A",
    activityName: "Foundation Work",
    plannedProgress: 85,
    actualProgress: 75,
    variance: -10,
    plannedStartDate: "2026-02-01",
    actualStartDate: "2026-02-03",
    plannedEndDate: "2026-04-10",
    estimatedEndDate: "2026-04-18",
    daysDelayed: 8,
    riskLevel: "medium",
    riskFactors: ["Material shortage", "Weather delays"],
    assignedTeam: "Team Alpha",
    weatherSensitive: true,
  },
  {
    id: "ACT-002",
    zoneId: "zone-b",
    name: "Zone B",
    activityName: "Piling Section",
    plannedProgress: 65,
    actualProgress: 40,
    variance: -25,
    plannedStartDate: "2026-02-15",
    actualStartDate: "2026-02-20",
    plannedEndDate: "2026-04-25",
    estimatedEndDate: "2026-05-15",
    daysDelayed: 20,
    riskLevel: "critical",
    riskFactors: ["Equipment failure", "Labour shortage", "Material delay"],
    assignedTeam: "Team Beta",
    weatherSensitive: true,
  },
  {
    id: "ACT-003",
    zoneId: "zone-c",
    name: "Zone C",
    activityName: "Electrical Installation",
    plannedProgress: 100,
    actualProgress: 100,
    variance: 0,
    plannedStartDate: "2026-01-15",
    actualStartDate: "2026-01-15",
    plannedEndDate: "2026-03-01",
    estimatedEndDate: "2026-03-01",
    daysDelayed: 0,
    riskLevel: "low",
    riskFactors: [],
    assignedTeam: "Team Gamma",
    weatherSensitive: false,
  },
  {
    id: "ACT-004",
    zoneId: "zone-d",
    name: "Zone D",
    activityName: "Drainage Setup",
    plannedProgress: 0,
    actualProgress: 0,
    variance: 0,
    plannedStartDate: "2026-04-20",
    actualStartDate: "-",
    plannedEndDate: "2026-06-01",
    estimatedEndDate: "2026-06-01",
    daysDelayed: 0,
    riskLevel: "low",
    riskFactors: [],
    assignedTeam: "Unassigned",
    weatherSensitive: true,
  },
  {
    id: "ACT-005",
    zoneId: "zone-a",
    name: "Zone A",
    activityName: "Structural Steel Erection",
    plannedProgress: 30,
    actualProgress: 22,
    variance: -8,
    plannedStartDate: "2026-03-01",
    actualStartDate: "2026-03-05",
    plannedEndDate: "2026-05-15",
    estimatedEndDate: "2026-05-25",
    daysDelayed: 10,
    riskLevel: "medium",
    riskFactors: ["Depends on foundation completion"],
    assignedTeam: "Team Alpha",
    weatherSensitive: true,
  },
  {
    id: "ACT-006",
    zoneId: "zone-b",
    name: "Zone B",
    activityName: "Concrete Pouring",
    plannedProgress: 20,
    actualProgress: 8,
    variance: -12,
    plannedStartDate: "2026-03-10",
    actualStartDate: "2026-03-18",
    plannedEndDate: "2026-04-30",
    estimatedEndDate: "2026-05-20",
    daysDelayed: 20,
    riskLevel: "high",
    riskFactors: ["Piling delays", "Crane unavailable"],
    assignedTeam: "Team Beta",
    weatherSensitive: true,
  },
]

export const delayAlerts: DelayAlert[] = [
  {
    id: "ALERT-001",
    activityId: "ACT-002",
    activityName: "Piling Section",
    name: "Zone B",
    type: "schedule",
    severity: "critical",
    message: "Piling work is 25% behind schedule. Critical path activity at risk.",
    recommendation: "Consider adding additional piling crew or extending work hours.",
    createdAt: "2026-03-21T08:00:00Z",
    acknowledged: false,
  },
  {
    id: "ALERT-002",
    activityId: "ACT-001",
    activityName: "Foundation Work",
    name: "Zone A",
    type: "weather",
    severity: "high",
    message: "Heavy rain forecasted for next 3 days. Foundation curing may be affected.",
    recommendation: "Prepare protective covers and consider pausing concrete work.",
    createdAt: "2026-03-22T06:00:00Z",
    acknowledged: false,
  },
  {
    id: "ALERT-003",
    activityId: "ACT-006",
    activityName: "Concrete Pouring",
    name: "Zone B",
    type: "dependency",
    severity: "high",
    message: "Concrete pouring delayed due to piling work delays in Zone B.",
    recommendation: "Review and update project schedule. Coordinate with piling team.",
    createdAt: "2026-03-20T14:00:00Z",
    acknowledged: true,
  },
  {
    id: "ALERT-004",
    activityId: "ACT-002",
    activityName: "Piling Section",
    name: "Zone B",
    type: "resource",
    severity: "medium",
    message: "Labour shortage reported. 5 additional skilled workers needed.",
    recommendation: "Contact HR for temporary workforce or redistribute from other zones.",
    createdAt: "2026-03-19T10:00:00Z",
    acknowledged: true,
  },
  {
    id: "ALERT-005",
    activityId: "ACT-005",
    activityName: "Structural Steel Erection",
    name: "Zone A",
    type: "weather",
    severity: "medium",
    message: "High winds forecasted. Steel erection may need to pause on 25th.",
    recommendation: "Schedule indoor preparation work as backup.",
    createdAt: "2026-03-22T07:00:00Z",
    acknowledged: false,
  },
]

export function getRiskLevelColor(risk: RiskLevel): string {
  switch (risk) {
    case "critical":
      return "bg-destructive text-destructive-foreground"
    case "high":
      return "bg-warning text-warning-foreground"
    case "medium":
      return "bg-amber-500 text-white"
    case "low":
      return "bg-success text-success-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function getRiskLevelBorder(risk: RiskLevel): string {
  switch (risk) {
    case "critical":
      return "border-destructive"
    case "high":
      return "border-warning"
    case "medium":
      return "border-amber-500"
    case "low":
      return "border-success"
    default:
      return "border-muted"
  }
}

export function getWeatherIcon(condition: WeatherForecast["condition"]): string {
  switch (condition) {
    case "sunny":
      return "sun"
    case "cloudy":
      return "cloud"
    case "rainy":
      return "cloud-rain"
    case "stormy":
      return "cloud-lightning"
    default:
      return "sun"
  }
}

export function getAlertTypeIcon(type: DelayAlert["type"]): string {
  switch (type) {
    case "schedule":
      return "calendar"
    case "weather":
      return "cloud"
    case "resource":
      return "users"
    case "dependency":
      return "git-branch"
    default:
      return "alert-triangle"
  }
}

export function calculateOverallRisk(): { level: RiskLevel; score: number } {
  const riskScores = activityProgress.map((a) => {
    switch (a.riskLevel) {
      case "critical":
        return 4
      case "high":
        return 3
      case "medium":
        return 2
      case "low":
        return 1
      default:
        return 0
    }
  })
  const avgScore = riskScores.reduce((a, b) => a + b, 0) / riskScores.length
  let level: RiskLevel = "low"
  if (avgScore >= 3.5) level = "critical"
  else if (avgScore >= 2.5) level = "high"
  else if (avgScore >= 1.5) level = "medium"

  return { level, score: Math.round(avgScore * 25) }
}
