"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams } from "next/navigation"
import { 
  Wrench, Activity, AlertTriangle, Plus, Trash2, Edit, Calendar, MapPin, Search, Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// -- Types -- //
type ClassType = { id: string; name: string }
type EquipmentItem = { 
  id: string; 
  classId: string; 
  name: string; 
  utilScore: number; 
  status?: "operational" | "under_repair";
  dailyRate: number; 
  nextServiceDate: string; 
  serialNumber?: string;
}
type Allocation = { id: string; eqId: string; zone: string; start: string; end: string; activityId?: string }

// -- Initial Mock Data -- //
const initialClasses: ClassType[] = [
  { id: "c1", name: "Cranes" },
  { id: "c2", name: "Concrete Mixers" },
  { id: "c3", name: "Excavators" },
]

const initialEquipments: EquipmentItem[] = [
  { id: "e1", classId: "c1", name: "Tower Crane 1", utilScore: 85, status: "operational", dailyRate: 1500, nextServiceDate: "2026-05-10" },
  { id: "e2", classId: "c1", name: "Mobile Crane A", utilScore: 40, status: "operational", dailyRate: 1200, nextServiceDate: "2026-04-28" },
  { id: "e3", classId: "c2", name: "Mixer Truck X", utilScore: 92, status: "operational", dailyRate: 800, nextServiceDate: "2026-06-01" },
  { id: "e4", classId: "c2", name: "Mixer Truck Y", utilScore: 10, status: "under_repair", dailyRate: 800, nextServiceDate: "2026-04-20" },
  { id: "e5", classId: "c3", name: "Excavator Heavy", utilScore: 78, status: "operational", dailyRate: 1100, nextServiceDate: "2026-05-20" },
  { id: "e6", classId: "c3", name: "Mini Excavator", utilScore: 15, status: "operational", dailyRate: 500, nextServiceDate: "2026-05-02" },
]

const initialAllocations: Allocation[] = [
  { id: "a1", eqId: "e1", zone: "Zone A - Foundation", start: "2026-04-01", end: "2026-04-15", activityId: "act-01" },
  { id: "a2", eqId: "e3", zone: "Zone B - Ground Floor", start: "2026-04-03", end: "2026-04-10", activityId: "act-02" },
  { id: "a3", eqId: "e5", zone: "Zone A - Trenching", start: "2026-04-05", end: "2026-04-20", activityId: "act-03" },
]

export default function EquipmentAllocationPage() {
  const { id } = useParams()
  const [classes, setClasses] = useState<ClassType[]>(initialClasses)
  const [equipments, setEquipments] = useState<EquipmentItem[]>(initialEquipments)
  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations)
  const [loading, setLoading] = useState(true)

  // -- Fetch Feed -- //
  useEffect(() => {
     async function load() {
       try {
         const res = await fetch(`http://localhost:8000/equipment/${id}`)
         if (!res.ok) throw new Error("API not reachable")
         const data = await res.json()
         setEquipments(data)
         setAllocations([]) // Clear mock assignments to avoid ID mismatches with live DB assets
         
         // Dynamically generate classes from the dataset
         const uniqueClasses = Array.from(new Set(data.map((e: any) => e.className))).map((name, i) => ({
           id: data.find((e: any) => e.className === name)?.classId || String(i + 1),
           name: name as string
         }))
         if (uniqueClasses.length > 0) setClasses(uniqueClasses)
       } catch (err) {
         console.warn("Using mock data:", err)
       } finally {
         setLoading(false)
       }
     }
     load()
  }, [id])

  const [inventorySearch, setInventorySearch] = useState("")

  const filteredEquipments = useMemo(() => {
    return equipments.filter(eq => 
      eq.name.toLowerCase().includes(inventorySearch.toLowerCase()) || 
      eq.serialNumber?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      getClassName(eq.classId).toLowerCase().includes(inventorySearch.toLowerCase())
    )
  }, [equipments, inventorySearch])

  // -- Dialog States -- //
  const [classDialogOpen, setClassDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassType | null>(null)
  const [classNameInput, setClassNameInput] = useState("")

  const [eqDialogOpen, setEqDialogOpen] = useState(false)
  const [editingEq, setEditingEq] = useState<EquipmentItem | null>(null)
  const [eqNameInput, setEqNameInput] = useState("")
  const [eqClassInput, setEqClassInput] = useState("")

  const [allocDialogOpen, setAllocDialogOpen] = useState(false)
  const [editingAlloc, setEditingAlloc] = useState<Allocation | null>(null)
  const [allocEqInput, setAllocEqInput] = useState("")
  const [allocZoneInput, setAllocZoneInput] = useState("")
  const [allocStartInput, setAllocStartInput] = useState("")
  const [allocEndInput, setAllocEndInput] = useState("")
  const [allocActivityInput, setAllocActivityInput] = useState("")

  const activeEqIds = useMemo(() => new Set(allocations.map(a => a.eqId)), [allocations])
  
  const stats = useMemo(() => {
    const total = equipments.length
    const underRepair = equipments.filter(e => e.status === "under_repair").length
    const active = activeEqIds.size
    const idle = equipments.filter(e => e.status === "operational" && !activeEqIds.has(e.id))
    
    const idleCount = idle.length
    const activePercentage = total > 0 ? (active / total) * 100 : 0

    // Financial Leak Calculation (Access Engineering specific)
    const idleFinancialLeak = idle.reduce((sum, eq) => sum + eq.dailyRate, 0)

    // Activity Risk Attribution (Mock calculation)
    const activityRisksCount = underRepair > 0 ? underRepair * 2 : 0 // Mock: each breakdown delays 2 activities

    // Zone Density
    const zoneCounts: Record<string, number> = {}
    allocations.forEach(a => {
      const zoneBase = a.zone.split(" - ")[0]
      zoneCounts[zoneBase] = (zoneCounts[zoneBase] || 0) + 1
    })
    const zoneDensity = Object.entries(zoneCounts).map(([name, count]) => ({ name, count }))

    // Maintenance Proximity
    const today = new Date("2026-04-24")
    const dueSoonTable = equipments
      .map(eq => {
        const serviceDate = new Date(eq.nextServiceDate)
        const daysToService = Math.ceil((serviceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return { ...eq, daysToService }
      })
      .sort((a, b) => a.daysToService - b.daysToService)

    return { 
      total, 
      active, 
      idleCount, 
      underRepair, 
      idleFinancialLeak, 
      activityRisksCount, 
      zoneDensity,
      dueSoonTable
    }
  }, [equipments, activeEqIds, allocations])

  // -- Class Handlers -- //
  function saveClass() {
    if (!classNameInput.trim()) return
    if (editingClass) {
      setClasses(c => c.map(x => x.id === editingClass.id ? { ...x, name: classNameInput } : x))
    } else {
      setClasses(c => [...c, { id: Date.now().toString(), name: classNameInput }])
    }
    setClassDialogOpen(false)
  }
  function deleteClass(id: string) {
    setClasses(c => c.filter(x => x.id !== id))
    setEquipments(e => e.filter(x => x.classId !== id))
    // we also should remove their allocations 
    const eqsToRemove = new Set(equipments.filter(e => e.classId === id).map(e => e.id))
    setAllocations(a => a.filter(x => !eqsToRemove.has(x.eqId)))
  }
  function openClassDialog(c?: ClassType) {
    setEditingClass(c || null)
    setClassNameInput(c?.name || "")
    setClassDialogOpen(true)
  }

  // -- Equipment Handlers -- //
  function saveEquipment() {
    if (!eqNameInput.trim() || !eqClassInput) return
    if (editingEq) {
      setEquipments(e => e.map(x => x.id === editingEq.id ? { ...x, name: eqNameInput, classId: eqClassInput } : x))
    } else {
      setEquipments(e => [...e, { 
        id: Date.now().toString(), 
        classId: eqClassInput, 
        name: eqNameInput, 
        utilScore: 0, 
        status: "operational",
        dailyRate: 1000,
        nextServiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default to 30 days from now
      }])
    }
    setEqDialogOpen(false)
  }
  function deleteEquipment(id: string) {
    setEquipments(e => e.filter(x => x.id !== id))
    setAllocations(a => a.filter(x => x.eqId !== id))
  }
  function openEqDialog(eq?: EquipmentItem) {
    setEditingEq(eq || null)
    setEqNameInput(eq?.name || "")
    setEqClassInput(eq?.classId || "")
    setEqDialogOpen(true)
  }
  async function markOperational(eqId: string) {
    try {
      await fetch(`http://localhost:8000/equipment/${eqId}?status=operational`, { method: "PATCH" })
      setEquipments(prev => prev.map(e => e.id === eqId ? { ...e, status: "operational" } : e))
    } catch (err) {
       console.error("Update failed:", err)
    }
  }
  async function reportBreakdown(eqId: string) {
    try {
      await fetch(`http://localhost:8000/equipment/${eqId}?status=under_repair`, { method: "PATCH" })
      setEquipments(prev => prev.map(e => e.id === eqId ? { ...e, status: "under_repair" } : e))
      setAllocations(prev => prev.filter(a => a.eqId !== eqId))
    } catch (err) {
      console.error("Update failed:", err)
    }
  }

  // -- Allocation Handlers -- //
  function saveAllocation() {
    if (!allocEqInput || !allocZoneInput.trim() || !allocStartInput || !allocEndInput) return
    if (editingAlloc) {
      setAllocations(a => a.map(x => x.id === editingAlloc.id ? {
        ...x, eqId: allocEqInput, zone: allocZoneInput, start: allocStartInput, end: allocEndInput, activityId: allocActivityInput
      } : x))
    } else {
      setAllocations(a => [...a, {
        id: Date.now().toString(), eqId: allocEqInput, zone: allocZoneInput, start: allocStartInput, end: allocEndInput, activityId: allocActivityInput
      }])
    }
    setAllocDialogOpen(false)
  }
  function deleteAllocation(id: string) {
    setAllocations(a => a.filter(x => x.id !== id))
  }
  function openAllocDialog(a?: Allocation) {
    setEditingAlloc(a || null)
    setAllocEqInput(a?.eqId || "")
    setAllocZoneInput(a?.zone || "")
    setAllocStartInput(a?.start || "")
    setAllocEndInput(a?.end || "")
    setAllocActivityInput(a?.activityId || "")
    setAllocDialogOpen(true)
  }

  // Helper
  const getClassName = (cid: string) => classes.find(c => c.id === cid)?.name || cid
  const getEqName = (eid: string) => equipments.find(e => e.id === eid)?.name || "Unknown Asset"

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Equipment Registry & Allocation
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage heavy machinery, assignments, and utilization tracking
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="allocations">Assignments</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Fleet Status Control
              </h2>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => openAllocDialog()} className="h-8 text-xs font-bold uppercase">Quick Assign</Button>
                <Button size="sm" variant="outline" onClick={() => setEqDialogOpen(true)} className="h-8 text-xs font-bold uppercase">Report Issue</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card/50 shadow-none border-border">
                <CardHeader className="py-3 px-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fleet Active</span>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-2xl font-bold tracking-tighter">{stats.active} <span className="text-sm font-medium text-muted-foreground">/ {stats.total}</span></div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 shadow-none border-border">
                <CardHeader className="py-3 px-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Units Idle</span>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-2xl font-bold tracking-tighter">{stats.idleCount}</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 shadow-none border-border border-l-2 border-l-destructive">
                <CardHeader className="py-3 px-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-destructive">Daily Offline Cost</span>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-2xl font-bold text-destructive tracking-tighter">${stats.idleFinancialLeak.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 shadow-none border-border border-l-2 border-l-amber-500">
                <CardHeader className="py-3 px-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Blocked Activities</span>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-2xl font-bold text-amber-500 tracking-tighter">{stats.activityRisksCount}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Availability Matrix */}
              <Card className="lg:col-span-1 bg-card/10 shadow-none border-border">
                <CardHeader className="pb-2 border-b border-border/50">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">Availability Matrix</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border/40">
                        <TableHead className="text-[9px] font-black uppercase tracking-widest h-8 px-4">Model Type</TableHead>
                        <TableHead className="text-[9px] font-black uppercase tracking-widest h-8 px-4 text-center">Idle</TableHead>
                        <TableHead className="text-[9px] font-black uppercase tracking-widest h-8 px-4 text-center">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classes.map(c => {
                        const classEqs = equipments.filter(e => e.classId === c.id)
                        const classIdle = classEqs.filter(e => e.status === "operational" && !activeEqIds.has(e.id)).length
                        return (
                          <TableRow key={c.id} className="border-b border-border/20 px-4">
                            <TableCell className="text-xs font-bold py-3 px-4">{c.name}</TableCell>
                            <TableCell className={`text-xs font-bold text-center py-3 px-4 ${classIdle > 0 ? "text-emerald-500" : "text-muted-foreground"}`}>
                              {classIdle}
                            </TableCell>
                            <TableCell className="text-xs font-medium text-center py-3 px-4 text-muted-foreground">{classEqs.length}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Site Roster (Who is Where) */}
              <Card className="lg:col-span-2 bg-card/10 shadow-none border-border">
                <CardHeader className="pb-2 border-b border-border/50">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">Site Assignments Roster</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border/40">
                        <TableHead className="text-[9px] font-black uppercase tracking-widest h-8 px-4">Equipment</TableHead>
                        <TableHead className="text-[9px] font-black uppercase tracking-widest h-8 px-4">Zone</TableHead>
                        <TableHead className="text-[9px] font-black uppercase tracking-widest h-8 px-4">Activity</TableHead>
                        <TableHead className="text-[9px] font-black uppercase tracking-widest h-8 px-4 text-right">Durations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocations.slice(0, 6).map(a => (
                        <TableRow key={a.id} className="border-b border-border/20">
                          <TableCell className="text-xs font-bold py-2.5 px-4">{getEqName(a.eqId)}</TableCell>
                          <TableCell className="text-xs py-2.5 px-4">
                            <Badge variant="outline" className="bg-muted font-bold text-[10px] py-0 px-1 border-none">{a.zone.split(" - ")[0]}</Badge>
                          </TableCell>
                          <TableCell className="text-xs py-2.5 px-4 font-mono text-primary font-bold">{a.activityId || "TBD"}</TableCell>
                          <TableCell className="text-right text-[10px] py-2.5 px-4 text-muted-foreground font-black tracking-tighter">{a.start} | {a.end}</TableCell>
                        </TableRow>
                      ))}
                      {allocations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="h-32 text-center text-xs text-muted-foreground italic">No active units on site roster.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/10 shadow-none border-border">
               <CardHeader className="pb-2 border-b border-border/50">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">Upcoming Preventive Service</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="grid grid-cols-1 md:grid-cols-4 divide-x divide-border/40">
                      {stats.dueSoonTable.slice(0, 4).map(eq => (
                        <div key={eq.id} className="p-4 flex flex-col gap-1 hover:bg-muted/30 transition-colors">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black truncate uppercase max-w-[120px] tracking-tight">{eq.name}</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${eq.daysToService < 7 ? "bg-destructive/20 text-destructive" : "bg-emerald-500/20 text-emerald-500"}`}>
                              {eq.daysToService <= 0 ? "OVERDUE" : `IN ${eq.daysToService}D`}
                            </span>
                          </div>
                          <span className="text-[9px] text-muted-foreground font-black tracking-widest opacity-70 uppercase">{getClassName(eq.classId)}</span>
                        </div>
                      ))}
                   </div>
                </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value="inventory">
             <Card className="bg-card/30 shadow-none border-border">
              <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/50">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">Fleet Registry ({equipments.length} Assets)</CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                      placeholder="Search assets..." 
                      className="h-8 w-64 pl-8 text-xs bg-muted/20"
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => openEqDialog()} size="sm" className="h-8 text-xs font-bold uppercase">
                    <Plus className="mr-2 h-3.5 w-3.5" /> Registry Entry
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border/40">
                      <TableHead className="text-[9px] font-black uppercase tracking-widest h-8 px-4">Model / Name</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest h-8 px-4">Serial / SKU</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest h-8 px-4">Class</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest h-8 px-4">Daily Rate</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest h-8 px-4 text-center">Status</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest h-8 px-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEquipments.map(eq => {
                      const isActive = activeEqIds.has(eq.id)
                      const isBroken = eq.status === "under_repair"
                      return (
                        <TableRow key={eq.id} className="hover:bg-muted/10">
                          <TableCell className="font-bold text-xs tracking-tight py-3">{eq.name}</TableCell>
                          <TableCell className="font-mono text-[10px] text-muted-foreground">{eq.serialNumber || "N/A"}</TableCell>
                          <TableCell className="text-[10px] uppercase font-black opacity-70 tracking-tighter">{getClassName(eq.classId)}</TableCell>
                          <TableCell className="text-xs font-mono font-bold">${eq.dailyRate?.toLocaleString()}</TableCell>
                          <TableCell className="text-center">
                            {isBroken ? (
                              <Badge variant="outline" className="bg-destructive/10 text-destructive border-none text-[9px] font-black uppercase">
                                Broken
                              </Badge>
                            ) : isActive ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-black uppercase">
                                In Use
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-none text-[9px] font-black uppercase">
                                Idle
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                             <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEqDialog(eq)}>
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                {!isBroken && (
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-500" onClick={() => reportBreakdown(eq.id)}>
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                {isBroken && (
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500" onClick={() => markOperational(eq.id)}>
                                    <Wrench className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70" onClick={() => deleteEquipment(eq.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                     {equipments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                          No equipment units in inventory.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ALLOCATIONS TAB */}
          <TabsContent value="allocations">
             <Card className="bg-card/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Site Assignments</CardTitle>
                  <CardDescription>Link equipment to specific construction activities and zones</CardDescription>
                </div>
                <Button onClick={() => openAllocDialog()} size="sm" className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> New Assignment
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50">
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Equipment</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Zone / Location</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Activity Code</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider">Timeframe</TableHead>
                      <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.map(a => (
                      <TableRow key={a.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                        <TableCell className="font-bold text-sm tracking-tight">{getEqName(a.eqId)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{a.zone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[10px] border-primary/20 bg-primary/5 text-primary">
                            {a.activityId || "UNLINKED"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-medium">
                          {a.start} <span className="mx-1 text-muted-foreground/30">|</span> {a.end}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAllocDialog(a)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteAllocation(a.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allocations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-32 text-muted-foreground italic text-sm">
                          No active equipment assignments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MAINTENANCE TAB */}
          <TabsContent value="maintenance">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <Card className="lg:col-span-2 bg-card/30 backdrop-blur-sm border-destructive/20">
                 <CardHeader className="border-b border-destructive/10">
                   <div className="flex items-center gap-2">
                     <Wrench className="h-5 w-5 text-destructive" />
                     <CardTitle className="text-lg font-bold">Offline Units (Breakdowns)</CardTitle>
                   </div>
                   <CardDescription>Equipment currently undergoing repair or service</CardDescription>
                 </CardHeader>
                 <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-border/50">
                          <TableHead className="text-[10px] font-bold uppercase tracking-wider">Unit</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-wider">Class</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                          <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {equipments.filter(e => e.status === "under_repair").map(eq => (
                          <TableRow key={eq.id} className="border-b border-border/20 bg-destructive/5">
                            <TableCell className="font-bold text-sm text-destructive">{eq.name}</TableCell>
                            <TableCell className="text-xs uppercase font-medium">{getClassName(eq.classId)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive text-[10px] font-bold">
                                UNDER REPAIR
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 text-[10px] font-bold uppercase tracking-wider"
                                onClick={() => markOperational(eq.id)}
                              >
                                Mark Operational
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {equipments.filter(e => e.status === "under_repair").length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center h-32 text-muted-foreground italic text-sm">
                              No reported breakdowns in the fleet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                 </CardContent>
               </Card>

               <Card className="bg-card/30 backdrop-blur-sm">
                 <CardHeader>
                   <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Maintenance Log</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3 border-l-2 border-primary/30 pl-4 py-1">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">Tower Crane 1</span>
                          <span className="text-[10px] text-muted-foreground italic">Scheduled maintenance completed</span>
                          <span className="text-[9px] font-black tracking-widest text-primary mt-1">2026-04-20</span>
                        </div>
                      </div>
                      <div className="flex gap-3 border-l-2 border-destructive/30 pl-4 py-1">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">Mixer Truck Y</span>
                          <span className="text-[10px] text-destructive italic">Engine failure reported - High risk</span>
                          <span className="text-[9px] font-black tracking-widest text-destructive mt-1">2026-04-24</span>
                        </div>
                      </div>
                    </div>
                 </CardContent>
               </Card>
             </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* DIALOGS */}
      {/* Class Dialog */}
      <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClass ? "Edit Class" : "Add Equipment Class"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="className">Class Name (e.g., Crane)</Label>
              <Input 
                id="className" 
                value={classNameInput} 
                onChange={(e) => setClassNameInput(e.target.value)} 
                placeholder="Enter class name" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClassDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveClass}>Save Class</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Equipment Dialog */}
      <Dialog open={eqDialogOpen} onOpenChange={setEqDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEq ? "Edit Equipment" : "Register Equipment Unit"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eqName">Unit Name/Code</Label>
              <Input 
                id="eqName" 
                value={eqNameInput} 
                onChange={(e) => setEqNameInput(e.target.value)} 
                placeholder="e.g., Crane-01" 
              />
            </div>
            <div className="space-y-2">
              <Label>Equipment Class</Label>
              <Select value={eqClassInput} onValueChange={setEqClassInput}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEqDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveEquipment}>Save Equipment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Allocation Dialog */}
      <Dialog open={allocDialogOpen} onOpenChange={setAllocDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {editingAlloc ? "Edit Assignment" : "New Equipment Assignment"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-[10px]">Select Equipment</Label>
              <Select value={allocEqInput} onValueChange={setAllocEqInput}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an idle unit" />
                </SelectTrigger>
                <SelectContent>
                  {equipments.map(eq => {
                    const isAllocatedLocally = activeEqIds.has(eq.id) && editingAlloc?.eqId !== eq.id
                    const isBroken = eq.status === "under_repair"
                    return (
                      <SelectItem key={eq.id} value={eq.id} disabled={isAllocatedLocally || isBroken}>
                        <div className="flex justify-between w-full gap-4">
                          <span>{eq.name}</span>
                          <span className="text-[10px] font-bold opacity-50">
                            {isBroken ? "(REPAIR)" : isAllocatedLocally ? "(ACTIVE)" : "(IDLE)"}
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-[10px]">Zone / Location</Label>
                <Input 
                  id="zone" 
                  value={allocZoneInput} 
                  onChange={(e) => setAllocZoneInput(e.target.value)} 
                  placeholder="e.g., Zone A"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="act-code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-[10px]">Activity Code</Label>
                <Input 
                  id="act-code" 
                  value={allocActivityInput} 
                  onChange={(e) => setAllocActivityInput(e.target.value)} 
                  placeholder="e.g., ACT-44"
                  className="h-9 text-sm font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start" className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-[10px]">Start Date</Label>
                <Input 
                  id="start" 
                  type="date"
                  value={allocStartInput} 
                  onChange={(e) => setAllocStartInput(e.target.value)} 
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="end" className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-[10px]">End Date</Label>
                <Input 
                  id="end" 
                  type="date"
                  value={allocEndInput} 
                  onChange={(e) => setAllocEndInput(e.target.value)} 
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-6 mt-4">
             <Button variant="outline" onClick={() => setAllocDialogOpen(false)} className="text-xs font-bold uppercase">Cancel</Button>
            <Button onClick={saveAllocation} className="text-xs font-bold uppercase">Confirm Allocation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}