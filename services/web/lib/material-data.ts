export type StockLevel = "adequate" | "low" | "critical"
export type ConsumptionTrend = "stable" | "increasing" | "decreasing" | "spike"

export interface Material {
  id: string
  name: string
  category: string
  unit: string
  totalStock: number
  allocated: number
  consumed: number
  available: number
  reorderLevel: number
  stockLevel: StockLevel
  consumptionTrend: ConsumptionTrend
  dailyAvgConsumption: number
  daysUntilShortage: number | null
  linkedActivities: string[]
}

export interface MaterialConsumptionLog {
  id: string
  materialId: string
  date: string
  quantity: number
  activity: string
  zone: string
  loggedBy: string
}

export interface MaterialAlert {
  id: string
  materialId: string
  materialName: string
  type: "low_stock" | "critical_stock" | "consumption_spike" | "shortage_predicted"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  recommendation: string
  affectedActivities: string[]
  createdAt: string
  acknowledged: boolean
}

export interface ConsumptionDataPoint {
  date: string
  planned: number
  actual: number
}

export function getStockLevelColor(level: StockLevel): string {
  switch (level) {
    case "critical":
      return "bg-destructive text-destructive-foreground"
    case "low":
      return "bg-warning text-warning-foreground"
    case "adequate":
      return "bg-success text-success-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function getStockLevelBorder(level: StockLevel): string {
  switch (level) {
    case "critical":
      return "border-destructive"
    case "low":
      return "border-warning"
    case "adequate":
      return "border-success"
    default:
      return "border-muted"
  }
}

export function getTrendIcon(trend: ConsumptionTrend): string {
  switch (trend) {
    case "increasing":
      return "trending-up"
    case "decreasing":
      return "trending-down"
    case "spike":
      return "alert-triangle"
    case "stable":
      return "minus"
    default:
      return "minus"
  }
}

export function getTrendColor(trend: ConsumptionTrend): string {
  switch (trend) {
    case "increasing":
      return "text-warning"
    case "decreasing":
      return "text-success"
    case "spike":
      return "text-destructive"
    case "stable":
      return "text-muted-foreground"
    default:
      return "text-muted-foreground"
  }
}

export function getAlertSeverityColor(severity: MaterialAlert["severity"]): string {
  switch (severity) {
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

export const activities = [
  "Foundation Work",
  "Piling Section",
  "Concrete Pouring",
  "Structural Steel Erection",
  "Electrical Installation",
  "Drainage Setup",
  "Wall Construction",
  "Plumbing Work",
]

export const zones = ["Zone A", "Zone B", "Zone C", "Zone D"]
