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

export const materials: Material[] = [
  {
    id: "MAT-001",
    name: "OPC Cement (50kg bags)",
    category: "Cement",
    unit: "bags",
    totalStock: 5000,
    allocated: 3200,
    consumed: 2800,
    available: 2200,
    reorderLevel: 1000,
    stockLevel: "adequate",
    consumptionTrend: "stable",
    dailyAvgConsumption: 85,
    daysUntilShortage: 26,
    linkedActivities: ["Foundation Work", "Concrete Pouring", "Piling Section"],
  },
  {
    id: "MAT-002",
    name: "PPC Cement (50kg bags)",
    category: "Cement",
    unit: "bags",
    totalStock: 3000,
    allocated: 2500,
    consumed: 2100,
    available: 900,
    reorderLevel: 800,
    stockLevel: "low",
    consumptionTrend: "increasing",
    dailyAvgConsumption: 72,
    daysUntilShortage: 12,
    linkedActivities: ["Foundation Work", "Structural Steel Erection"],
  },
  {
    id: "MAT-003",
    name: "River Sand",
    category: "Aggregates",
    unit: "cubic meters",
    totalStock: 800,
    allocated: 600,
    consumed: 480,
    available: 320,
    reorderLevel: 200,
    stockLevel: "adequate",
    consumptionTrend: "stable",
    dailyAvgConsumption: 15,
    daysUntilShortage: 21,
    linkedActivities: ["Foundation Work", "Concrete Pouring"],
  },
  {
    id: "MAT-004",
    name: "M-Sand",
    category: "Aggregates",
    unit: "cubic meters",
    totalStock: 500,
    allocated: 450,
    consumed: 420,
    available: 80,
    reorderLevel: 150,
    stockLevel: "critical",
    consumptionTrend: "spike",
    dailyAvgConsumption: 25,
    daysUntilShortage: 3,
    linkedActivities: ["Concrete Pouring", "Piling Section"],
  },
  {
    id: "MAT-005",
    name: "20mm Aggregate",
    category: "Aggregates",
    unit: "cubic meters",
    totalStock: 600,
    allocated: 400,
    consumed: 350,
    available: 250,
    reorderLevel: 150,
    stockLevel: "adequate",
    consumptionTrend: "stable",
    dailyAvgConsumption: 12,
    daysUntilShortage: 21,
    linkedActivities: ["Foundation Work", "Concrete Pouring"],
  },
  {
    id: "MAT-006",
    name: "Structural Steel (TMT Bars)",
    category: "Steel",
    unit: "tonnes",
    totalStock: 150,
    allocated: 120,
    consumed: 95,
    available: 55,
    reorderLevel: 40,
    stockLevel: "adequate",
    consumptionTrend: "increasing",
    dailyAvgConsumption: 3.5,
    daysUntilShortage: 16,
    linkedActivities: ["Structural Steel Erection", "Foundation Work"],
  },
  {
    id: "MAT-007",
    name: "Reinforcement Steel",
    category: "Steel",
    unit: "tonnes",
    totalStock: 80,
    allocated: 70,
    consumed: 62,
    available: 18,
    reorderLevel: 25,
    stockLevel: "low",
    consumptionTrend: "increasing",
    dailyAvgConsumption: 2.8,
    daysUntilShortage: 6,
    linkedActivities: ["Foundation Work", "Piling Section", "Concrete Pouring"],
  },
  {
    id: "MAT-008",
    name: "Bricks (Standard)",
    category: "Masonry",
    unit: "units",
    totalStock: 50000,
    allocated: 35000,
    consumed: 28000,
    available: 22000,
    reorderLevel: 15000,
    stockLevel: "adequate",
    consumptionTrend: "decreasing",
    dailyAvgConsumption: 800,
    daysUntilShortage: 28,
    linkedActivities: ["Wall Construction"],
  },
  {
    id: "MAT-009",
    name: "Electrical Cables (3-core)",
    category: "Electrical",
    unit: "meters",
    totalStock: 5000,
    allocated: 4000,
    consumed: 3800,
    available: 1200,
    reorderLevel: 1500,
    stockLevel: "low",
    consumptionTrend: "stable",
    dailyAvgConsumption: 120,
    daysUntilShortage: 10,
    linkedActivities: ["Electrical Installation"],
  },
  {
    id: "MAT-010",
    name: "PVC Pipes (4 inch)",
    category: "Plumbing",
    unit: "meters",
    totalStock: 2000,
    allocated: 1500,
    consumed: 1200,
    available: 800,
    reorderLevel: 500,
    stockLevel: "adequate",
    consumptionTrend: "stable",
    dailyAvgConsumption: 40,
    daysUntilShortage: 20,
    linkedActivities: ["Drainage Setup", "Plumbing Work"],
  },
]

export const materialAlerts: MaterialAlert[] = [
  {
    id: "MALERT-001",
    materialId: "MAT-004",
    materialName: "M-Sand",
    type: "critical_stock",
    severity: "critical",
    message: "M-Sand stock critically low. Only 3 days of supply remaining.",
    recommendation: "Place emergency order immediately. Consider alternative suppliers.",
    affectedActivities: ["Concrete Pouring", "Piling Section"],
    createdAt: "2026-03-22T06:00:00Z",
    acknowledged: false,
  },
  {
    id: "MALERT-002",
    materialId: "MAT-004",
    materialName: "M-Sand",
    type: "consumption_spike",
    severity: "high",
    message: "M-Sand consumption increased by 65% over the past week.",
    recommendation: "Review consumption patterns. Check for wastage or scope changes.",
    affectedActivities: ["Concrete Pouring"],
    createdAt: "2026-03-21T14:00:00Z",
    acknowledged: false,
  },
  {
    id: "MALERT-003",
    materialId: "MAT-007",
    materialName: "Reinforcement Steel",
    type: "shortage_predicted",
    severity: "high",
    message: "Reinforcement Steel will run out in approximately 6 days.",
    recommendation: "Initiate procurement process. Lead time is typically 5-7 days.",
    affectedActivities: ["Foundation Work", "Piling Section", "Concrete Pouring"],
    createdAt: "2026-03-22T08:00:00Z",
    acknowledged: false,
  },
  {
    id: "MALERT-004",
    materialId: "MAT-002",
    materialName: "PPC Cement",
    type: "low_stock",
    severity: "medium",
    message: "PPC Cement approaching reorder level. 12 days of supply remaining.",
    recommendation: "Schedule reorder within next 3 days to avoid stockout.",
    affectedActivities: ["Foundation Work", "Structural Steel Erection"],
    createdAt: "2026-03-21T10:00:00Z",
    acknowledged: true,
  },
  {
    id: "MALERT-005",
    materialId: "MAT-009",
    materialName: "Electrical Cables",
    type: "low_stock",
    severity: "medium",
    message: "Electrical Cables below reorder level. 10 days of supply remaining.",
    recommendation: "Contact supplier for delivery schedule.",
    affectedActivities: ["Electrical Installation"],
    createdAt: "2026-03-20T16:00:00Z",
    acknowledged: true,
  },
]

export const consumptionHistory: Record<string, ConsumptionDataPoint[]> = {
  "MAT-001": [
    { date: "2026-03-15", planned: 80, actual: 78 },
    { date: "2026-03-16", planned: 85, actual: 82 },
    { date: "2026-03-17", planned: 85, actual: 88 },
    { date: "2026-03-18", planned: 90, actual: 85 },
    { date: "2026-03-19", planned: 85, actual: 90 },
    { date: "2026-03-20", planned: 85, actual: 82 },
    { date: "2026-03-21", planned: 80, actual: 85 },
  ],
  "MAT-002": [
    { date: "2026-03-15", planned: 60, actual: 58 },
    { date: "2026-03-16", planned: 65, actual: 68 },
    { date: "2026-03-17", planned: 65, actual: 72 },
    { date: "2026-03-18", planned: 70, actual: 75 },
    { date: "2026-03-19", planned: 70, actual: 78 },
    { date: "2026-03-20", planned: 70, actual: 80 },
    { date: "2026-03-21", planned: 72, actual: 85 },
  ],
  "MAT-004": [
    { date: "2026-03-15", planned: 15, actual: 14 },
    { date: "2026-03-16", planned: 15, actual: 18 },
    { date: "2026-03-17", planned: 18, actual: 22 },
    { date: "2026-03-18", planned: 18, actual: 28 },
    { date: "2026-03-19", planned: 20, actual: 32 },
    { date: "2026-03-20", planned: 20, actual: 35 },
    { date: "2026-03-21", planned: 22, actual: 38 },
  ],
  "MAT-006": [
    { date: "2026-03-15", planned: 3.0, actual: 2.8 },
    { date: "2026-03-16", planned: 3.2, actual: 3.0 },
    { date: "2026-03-17", planned: 3.2, actual: 3.5 },
    { date: "2026-03-18", planned: 3.5, actual: 3.8 },
    { date: "2026-03-19", planned: 3.5, actual: 4.0 },
    { date: "2026-03-20", planned: 3.5, actual: 3.8 },
    { date: "2026-03-21", planned: 3.5, actual: 4.2 },
  ],
  "MAT-007": [
    { date: "2026-03-15", planned: 2.5, actual: 2.4 },
    { date: "2026-03-16", planned: 2.5, actual: 2.6 },
    { date: "2026-03-17", planned: 2.8, actual: 3.0 },
    { date: "2026-03-18", planned: 2.8, actual: 3.2 },
    { date: "2026-03-19", planned: 2.8, actual: 3.0 },
    { date: "2026-03-20", planned: 2.8, actual: 3.2 },
    { date: "2026-03-21", planned: 2.8, actual: 3.4 },
  ],
}

export const recentConsumptionLogs: MaterialConsumptionLog[] = [
  {
    id: "LOG-001",
    materialId: "MAT-004",
    date: "2026-03-22",
    quantity: 15,
    activity: "Concrete Pouring",
    zone: "Zone B",
    loggedBy: "John Smith",
  },
  {
    id: "LOG-002",
    materialId: "MAT-001",
    date: "2026-03-22",
    quantity: 45,
    activity: "Foundation Work",
    zone: "Zone A",
    loggedBy: "Sarah Wilson",
  },
  {
    id: "LOG-003",
    materialId: "MAT-006",
    date: "2026-03-22",
    quantity: 2.5,
    activity: "Structural Steel Erection",
    zone: "Zone A",
    loggedBy: "Mike Brown",
  },
  {
    id: "LOG-004",
    materialId: "MAT-003",
    date: "2026-03-22",
    quantity: 8,
    activity: "Foundation Work",
    zone: "Zone A",
    loggedBy: "Sarah Wilson",
  },
  {
    id: "LOG-005",
    materialId: "MAT-007",
    date: "2026-03-21",
    quantity: 1.8,
    activity: "Piling Section",
    zone: "Zone B",
    loggedBy: "David Lee",
  },
]

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

export function getMaterialStats() {
  const totalMaterials = materials.length
  const criticalCount = materials.filter((m) => m.stockLevel === "critical").length
  const lowStockCount = materials.filter((m) => m.stockLevel === "low").length
  const activeAlerts = materialAlerts.filter((a) => !a.acknowledged).length
  const materialsWithSpike = materials.filter((m) => m.consumptionTrend === "spike" || m.consumptionTrend === "increasing").length

  return {
    totalMaterials,
    criticalCount,
    lowStockCount,
    activeAlerts,
    materialsWithSpike,
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
