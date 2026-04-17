"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import {
  getTrendColor,
  type Material,
} from "@/lib/material-data"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TrendingUp, TrendingDown, AlertTriangle, Minus, Search, ChevronsUpDown, Check, BarChart3 } from "lucide-react"

interface ConsumptionTrendChartProps {
  material: Material | null
  materialsList?: Material[]
  onMaterialChange?: (m: Material) => void
}

function TrendIcon({ trend }: { trend: Material["consumptionTrend"] }) {
  switch (trend) {
    case "increasing":
      return <TrendingUp className="h-4 w-4" />
    case "decreasing":
      return <TrendingDown className="h-4 w-4" />
    case "spike":
      return <AlertTriangle className="h-4 w-4 text-destructive animate-bounce" />
    default:
      return <Minus className="h-4 w-4" />
  }
}

export function ConsumptionTrendChart({ material: initialMaterial, materialsList = [], onMaterialChange }: ConsumptionTrendChartProps) {
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(initialMaterial)
  const [data, setData] = useState<{date: string, actual: number, planned: number}[]>([])
  const [openSelector, setOpenSelector] = useState(false)

  useEffect(() => {
    setCurrentMaterial(initialMaterial)
  }, [initialMaterial])

  useEffect(() => {
    if (currentMaterial && currentMaterial.id) {
      const rawId = currentMaterial.id.replace("MAT-", "")
      fetch(`http://localhost:8000/predict/trend/1/${rawId}`)
        .then((res) => res.json())
        .then((respData) => setData(respData))
        .catch((err) => console.error("Failed to load trend", err))
    }
  }, [currentMaterial])

  if (!currentMaterial) {
    return (
      <Card className="border-2 border-dashed bg-muted/30">
        <CardHeader className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
          <CardTitle className="text-xl font-black uppercase tracking-tighter opacity-40">Intelligence Feed Offline</CardTitle>
          <CardDescription className="font-bold uppercase text-[10px] tracking-widest mt-2">Select a specification from the inventory to initialize tracking</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const hasData = data.length > 0
  const totalPlanned = data.reduce((sum, d) => sum + d.planned, 0)
  const totalActual = data.reduce((sum, d) => sum + d.actual, 0)
  const variancePercent = totalPlanned > 0 ? ((totalActual - totalPlanned) / totalPlanned) * 100 : 0

  return (
    <Card className="border-2 shadow-xl bg-card/40 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-6 border-b bg-muted/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <Popover open={openSelector} onOpenChange={setOpenSelector}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="p-0 hover:bg-transparent h-auto flex items-center gap-2 group">
                    <CardTitle className="text-lg font-black tracking-tighter uppercase group-hover:text-primary transition-colors">
                      {currentMaterial.name}
                    </CardTitle>
                    <ChevronsUpDown className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Switch material..." />
                    <CommandList>
                      <CommandEmpty>No specification matches.</CommandEmpty>
                      <CommandGroup heading="Project Inventory">
                        {materialsList.map((m) => (
                          <CommandItem
                            key={m.id}
                            value={m.name}
                            onSelect={() => {
                              setCurrentMaterial(m)
                              onMaterialChange?.(m)
                              setOpenSelector(false)
                            }}
                            className="cursor-pointer"
                          >
                            <span className="font-bold">{m.name}</span>
                            {currentMaterial.id === m.id && <Check className="ml-auto h-4 w-4" />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <CardDescription className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              7-Day Utilization Delta Analytics
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`border-2 font-black uppercase tracking-tighter text-[10px] px-2 py-1 flex items-center gap-1.5 shadow-sm ${getTrendColor(currentMaterial.consumptionTrend)}`}
            >
              <TrendIcon trend={currentMaterial.consumptionTrend} />
              {currentMaterial.consumptionTrend}
            </Badge>
            {variancePercent !== 0 && (
              <div className={`p-1.5 rounded-md border-2 text-[10px] font-black uppercase tracking-tighter ${
                variancePercent > 0 ? "border-warning/30 text-warning bg-warning/5" : "border-success/30 text-success bg-success/5"
              }`}>
                {variancePercent > 0 ? "Over" : "Under"} {Math.abs(variancePercent).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-8">
        {hasData ? (
          <div className="h-[320px] -ml-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "2px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontSize: "10px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  }}
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
                <Area
                  type="stepAfter"
                  dataKey="planned"
                  stroke="hsl(var(--primary))"
                  fill="url(#plannedGradient)"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--warning))"
                  fill="url(#actualGradient)"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "hsl(var(--warning))", strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[320px] flex flex-col items-center justify-center text-muted-foreground gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center animate-pulse">
              <Search className="h-6 w-6 opacity-20" />
            </div>
            <p className="font-bold text-xs uppercase tracking-[0.2em] opacity-30">Zero historical log signatures</p>
          </div>
        )}

        {/* Actionable Statistics Matrix */}
        <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-border">
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/30 border border-border/50">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest text-center">Engine Burn Rate</p>
            <p className="text-base font-black text-center text-primary">
              {currentMaterial.dailyAvgConsumption} <span className="text-[10px] uppercase">{currentMaterial.unit}/DAY</span>
            </p>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/30 border border-border/50">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest text-center">Safety Threshold</p>
            <p className="text-base font-black text-center">
              {(currentMaterial.reorderLevel || 0).toLocaleString()} <span className="text-[10px] uppercase">{currentMaterial.unit}</span>
            </p>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/30 border border-border/50">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest text-center">Stock Depletion</p>
            <p
              className={`text-base font-black text-center ${
                currentMaterial.daysUntilShortage && currentMaterial.daysUntilShortage <= 5
                  ? "text-destructive"
                  : currentMaterial.daysUntilShortage && currentMaterial.daysUntilShortage <= 15
                  ? "text-warning"
                  : "text-success"
              }`}
            >
              {currentMaterial.daysUntilShortage !== null && currentMaterial.daysUntilShortage !== 999 
                ? `${currentMaterial.daysUntilShortage} DAYS` 
                : "STABLE"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
