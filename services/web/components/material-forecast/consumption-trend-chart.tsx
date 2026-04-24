"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Bar,
  ReferenceLine,
  ReferenceArea,
} from "recharts"
import {
  type Material,
} from "@/lib/material-data"
import { cn } from "@/lib/utils"
import { 
  PlusCircle, 
  Info, 
  Search, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Minus,
  ArrowRight,
  Loader2
} from "lucide-react"

interface ConsumptionTrendChartProps {
  material: Material | null
  materialsList?: Material[]
  onMaterialChange?: (m: Material) => void
}

export function ConsumptionTrendChart({ material: initialMaterial, materialsList = [], onMaterialChange }: ConsumptionTrendChartProps) {
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(initialMaterial)
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [simulationAmount, setSimulationAmount] = useState<number>(0)
  const [simInput, setSimInput] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (initialMaterial) {
      setCurrentMaterial(initialMaterial)
    } else if (materialsList.length > 0 && !currentMaterial) {
      // Auto-select first material if none is selected to avoid "nothing"
      setCurrentMaterial(materialsList[0])
      onMaterialChange?.(materialsList[0])
    }
  }, [initialMaterial, materialsList])

  useEffect(() => {
    if (currentMaterial && currentMaterial.id) {
      setIsLoading(true)
      const rawId = currentMaterial.id.replace("MAT-", "")
      fetch(`http://localhost:8000/predict/trend/1/${rawId}`)
        .then((res) => res.json())
        .then((respData: any[]) => {
          if (!respData || !Array.isArray(respData) || respData.length === 0) {
            setData([])
            setIsLoading(false)
            return
          }
          
          // The backend now provides a true, non-linear stochastic model.
          // We just need to inject the simulation bounce into the forecast phase.
          const processedData = respData.map((point, index, arr) => {
            if (point.type === 'forecast') {
              return {
                ...point,
                forecastStock: point.stock + (simulationAmount || 0),
                historicalStock: null,
                stock: point.stock + (simulationAmount || 0), // Keeping generic 'stock' for tooltip compatibility
                optimistic: point.optimistic ? point.optimistic + (simulationAmount || 0) : undefined,
                pessimistic: point.pessimistic ? point.pessimistic + (simulationAmount || 0) : undefined,
              }
            } else {
               const isLastHistorical = index === arr.length - 1 || arr[index + 1].type === 'forecast';
               return {
                 ...point,
                 historicalStock: point.stock,
                 forecastStock: isLastHistorical ? point.stock : null,
                 optimistic: isLastHistorical ? point.stock : null,
                 pessimistic: isLastHistorical ? point.stock : null,
               }
            }
          });
          
          setData(processedData)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Failed to load trajectory", err)
          setData([])
          setIsLoading(false)
        })
    }
  }, [currentMaterial, simulationAmount])

  const filteredMaterials = materialsList.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentStock = currentMaterial?.available || 0
  const totalStock = currentStock + simulationAmount
  const burnRate = currentMaterial?.dailyAvgConsumption || 1
  const projectedDays = Math.floor(totalStock / burnRate)
  const exhaustionDate = new Date()
  exhaustionDate.setDate(exhaustionDate.getDate() + projectedDays)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
      {/* SIDEBAR: MATERIAL PICKER */}
      <Card className="lg:col-span-3 border-2 bg-card overflow-hidden flex flex-col shadow-sm">
        <CardHeader className="p-4 border-b bg-muted/50">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search materials..." 
              className="pl-8 h-9 text-xs font-bold uppercase tracking-wide bg-background border-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {filteredMaterials.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setCurrentMaterial(m)
                  onMaterialChange?.(m)
                }}
                className={cn(
                  "p-4 rounded-xl cursor-pointer transition-all border-2",
                  currentMaterial?.id === m.id 
                    ? "bg-primary border-primary text-primary-foreground shadow-md" 
                    : "bg-background border-border hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-black uppercase tracking-tight truncate">{m.name}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className={cn(
                      "text-[10px] font-bold uppercase opacity-80",
                      currentMaterial?.id === m.id ? "text-primary-foreground" : "text-muted-foreground"
                    )}>{m.available} {m.unit}</span>
                    <Badge variant="secondary" className={cn(
                      "text-[9px] h-5 px-2",
                      currentMaterial?.id === m.id ? "bg-white/20 text-white" : ""
                    )}>
                      {m.stockLevel}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* MAIN PANE: ANALYTICS WORKBENCH */}
      <Card className="lg:col-span-9 border-2 shadow-sm bg-card overflow-hidden flex flex-col">
        {!currentMaterial ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <BarChart3 className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">No Material Selected</h3>
            <p className="text-sm text-muted-foreground font-medium mt-2 max-w-xs">
              Select a resource from the inventory list to initialize depletion trajectory mapping and procurement simulation.
            </p>
            <div className="mt-8 flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest">
              <ArrowRight className="h-4 w-4 animate-bounce-x" />
              Use Sidebar to Begin
            </div>
          </div>
        ) : (
          <>
            <CardHeader className="p-6 border-b bg-muted/30 flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl font-black uppercase tracking-tight">{currentMaterial.name}</CardTitle>
                  <Badge variant="outline" className="text-[10px] font-black uppercase border-2 px-3">
                    Forecast Analysis
                  </Badge>
                </div>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-2 text-muted-foreground">
                  Baseline Consumption vs Adjusted Depletion Curve
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase opacity-70">Stock Out In</p>
                  <p className={cn(
                    "text-xl font-black tracking-tighter uppercase",
                    projectedDays < 7 ? "text-red-600" : "text-green-600"
                  )}>
                    {projectedDays} Days
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 flex-1 flex flex-col gap-10">
              <div className="flex-1 min-h-[300px] grid grid-cols-1 xl:grid-cols-2 gap-8 -ml-6 mr-6 relative">
                {/* LOADING OVERLAY */}
                {isLoading && (
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm rounded-lg">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest text-primary">Loading...</p>
                  </div>
                )}
                
                {/* CHART 1: DEPLETION TRAJECTORY */}
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="historicalStock" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="forecastStock" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="dangerZone" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()
                      }}
                      dy={10}
                    />
                    <YAxis
                      yAxisId="stock"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        border: "1px solid #1e293b",
                        borderRadius: "8px",
                        fontWeight: 600,
                        fontSize: "12px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
                      }}
                      itemStyle={{ color: "#f8fafc" }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const stockData = payload.find(p => p.dataKey === 'stock')?.payload || payload[0].payload;
                          const isForecast = stockData.type === 'forecast';
                          return (
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-2xl space-y-2 min-w-[200px]">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center justify-between">
                                {new Date(label).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                              </p>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between gap-8 text-[11px] font-bold">
                                  <span className="text-slate-400 uppercase">Projected Stock</span>
                                  <span className="font-black text-white font-mono">{Number(stockData.stock).toLocaleString()} {currentMaterial.unit}</span>
                                </div>
                                {isForecast && (
                                  <div className="mt-2 pt-2 border-t border-slate-900 flex flex-col gap-1">
                                    <div className="flex items-center justify-between gap-8 text-[9px] font-bold">
                                      <span className="text-emerald-500 uppercase opacity-70">Best Case</span>
                                      <span className="text-emerald-400 font-mono">{Number(stockData.optimistic).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-8 text-[9px] font-bold">
                                      <span className="text-red-500 uppercase opacity-70">Worst Case</span>
                                      <span className="text-red-400 font-mono">{Number(stockData.pessimistic).toLocaleString()}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine 
                      yAxisId="stock"
                      y={currentMaterial.reorderLevel} 
                      stroke="#ef4444" 
                      strokeDasharray="3 3" 
                      label={{ 
                        value: 'REORDER', 
                        position: 'insideBottomRight', 
                        fill: '#ef4444', 
                        fontSize: 10, 
                        fontWeight: 900,
                        letterSpacing: '0.1em'
                      }} 
                    />
                    <ReferenceArea
                      yAxisId="stock"
                      y1={0}
                      y2={currentMaterial.reorderLevel}
                      fill="url(#dangerZone)"
                    />
                    
                    {/* CONFIDENCE INTERVAL BAND */}
                    <Area
                      yAxisId="stock"
                      type="monotone"
                      dataKey="optimistic"
                      connectNulls={true}
                      stroke="none"
                      fill="#22c55e"
                      fillOpacity={0.05}
                    />
                    <Area
                      yAxisId="stock"
                      type="monotone"
                      dataKey="pessimistic"
                      connectNulls={true}
                      stroke="none"
                      fill="#22c55e"
                      fillOpacity={0.05}
                    />

                    {/* MAIN TREND LINES */}
                    <Area
                      yAxisId="stock"
                      type="monotone"
                      dataKey="historicalStock"
                      connectNulls={true}
                      stroke="#3b82f6"
                      fill="url(#historicalStock)"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: "#3b82f6" }}
                    />
                    <Area
                      yAxisId="stock"
                      type="monotone"
                      dataKey="forecastStock"
                      connectNulls={true}
                      stroke="#22c55e"
                      fill="url(#forecastStock)"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: "#22c55e" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>

                {/* CHART 2: DAILY BURN HISTOGRAM */}
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.filter(d => d.dailyBurn !== undefined)} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()
                      }}
                      dy={10}
                    />
                    <YAxis
                      yAxisId="burn"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        border: "1px solid #1e293b",
                        borderRadius: "8px",
                        fontWeight: 600,
                        fontSize: "12px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
                      }}
                      itemStyle={{ color: "#f8fafc" }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const burnData = payload[0].payload;
                          return (
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-2xl space-y-2 min-w-[150px]">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center justify-between">
                                {new Date(label).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                {burnData.isBurst && <AlertTriangle className="h-3 w-3 text-red-500" />}
                              </p>
                              <div className="flex items-center justify-between gap-6 text-[11px] font-bold mt-1">
                                <span className={cn("uppercase", burnData.isBurst ? "text-red-400" : "text-amber-500")}>Daily Burn</span>
                                <span className={cn("font-black font-mono", burnData.isBurst ? "text-red-400" : "text-amber-500")}>-{Number(burnData.dailyBurn).toLocaleString()}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* BURST CONSUMPTION BARS */}
                    <Bar
                      yAxisId="burn"
                      dataKey="dailyBurn"
                      fillOpacity={0.8}
                      radius={[4, 4, 0, 0]}
                      barSize={16}
                      shape={(props: any) => {
                        const { x, y, width, height, payload } = props;
                        const isBurst = payload.isBurst;
                        return (
                          <rect 
                            x={x} 
                            y={y} 
                            width={width} 
                            height={height} 
                            rx={4} 
                            ry={4} 
                            fill={isBurst ? "#ef4444" : "#f59e0b"} 
                            opacity={isBurst ? 0.9 : 0.4} 
                          />
                        );
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* SIMULATOR: SOLID DESIGN */}
              <div className="p-8 rounded-3xl bg-muted/10 border border-border/20 shadow-inner">
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 text-primary rounded-lg border border-primary/30">
                        <PlusCircle className="h-4 w-4" />
                      </div>
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Adjust Supply (Simulation)</Label>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Input 
                          type="number" 
                          placeholder="Delivery amount..." 
                          className="bg-muted/20 border-border/50 h-14 font-bold text-xl p-6 focus-visible:ring-primary shadow-sm"
                          value={simInput}
                          onChange={(e) => setSimInput(e.target.value)}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40 uppercase">{currentMaterial.unit}</span>
                      </div>
                      <Button 
                        variant="default"
                        onClick={() => setSimulationAmount(Number(simInput) || 0)}
                        className="h-14 px-8 bg-blue-600 hover:bg-blue-700 font-black uppercase text-[10px] tracking-widest text-white transition-colors"
                      >
                        Apply
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          setSimulationAmount(0)
                          setSimInput("")
                        }}
                        className="h-14 px-8 border border-border/50 font-black uppercase text-[10px] tracking-widest hover:bg-red-950/20 hover:text-red-400 transition-colors"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center px-10 border-l border-border/20 h-24">
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Impacted Runway</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold tracking-tighter text-blue-400">{projectedDays}</span>
                      <span className="text-xs font-bold uppercase text-blue-400/60">Days</span>
                    </div>
                    {simulationAmount > 0 && (
                      <Badge className="mt-2 bg-green-950/20 text-green-400 hover:bg-green-950/30 border border-green-900/50 font-bold text-[9px] uppercase tracking-widest px-3">
                        +{projectedDays - (currentMaterial.daysUntilShortage || 0)} Day Extension
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
