"use client"

import { useState, useMemo } from "react"
import { 
  Wrench, Activity, AlertTriangle, Plus, Trash2, Edit, Calendar, MapPin, Search
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
type EquipmentItem = { id: string; classId: string; name: string; utilScore: number }
type Allocation = { id: string; eqId: string; zone: string; start: string; end: string }

// -- Initial Mock Data -- //
const initialClasses: ClassType[] = [
  { id: "c1", name: "Cranes" },
  { id: "c2", name: "Concrete Mixers" },
  { id: "c3", name: "Excavators" },
]

const initialEquipments: EquipmentItem[] = [
  { id: "e1", classId: "c1", name: "Tower Crane 1", utilScore: 85 },
  { id: "e2", classId: "c1", name: "Mobile Crane A", utilScore: 40 },
  { id: "e3", classId: "c2", name: "Mixer Truck X", utilScore: 92 },
  { id: "e4", classId: "c2", name: "Mixer Truck Y", utilScore: 10 },
  { id: "e5", classId: "c3", name: "Excavator Heavy", utilScore: 78 },
  { id: "e6", classId: "c3", name: "Mini Excavator", utilScore: 15 },
]

const initialAllocations: Allocation[] = [
  { id: "a1", eqId: "e1", zone: "Zone A - Foundation", start: "2026-04-01", end: "2026-04-15" },
  { id: "a2", eqId: "e3", zone: "Zone B - Ground Floor", start: "2026-04-03", end: "2026-04-10" },
  { id: "a3", eqId: "e5", zone: "Zone A - Trenching", start: "2026-04-05", end: "2026-04-20" },
]

export default function EquipmentAllocationPage() {
  const [classes, setClasses] = useState<ClassType[]>(initialClasses)
  const [equipments, setEquipments] = useState<EquipmentItem[]>(initialEquipments)
  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations)

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

  // -- Derived Data for Dashboard -- //
  const activeEqIds = useMemo(() => new Set(allocations.map(a => a.eqId)), [allocations])
  
  const stats = useMemo(() => {
    const total = equipments.length
    const active = activeEqIds.size
    const idle = total - active
    const activePercentage = total > 0 ? (active / total) * 100 : 0

    const sortedByUtil = [...equipments].sort((a, b) => b.utilScore - a.utilScore)
    const mostUsed = sortedByUtil.slice(0, 3)
    const leastUsed = sortedByUtil.slice(-3).reverse()

    return { total, active, idle, activePercentage, mostUsed, leastUsed }
  }, [equipments, activeEqIds])

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
      setEquipments(e => [...e, { id: Date.now().toString(), classId: eqClassInput, name: eqNameInput, utilScore: 0 }])
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

  // -- Allocation Handlers -- //
  function saveAllocation() {
    if (!allocEqInput || !allocZoneInput.trim() || !allocStartInput || !allocEndInput) return
    if (editingAlloc) {
      setAllocations(a => a.map(x => x.id === editingAlloc.id ? {
        ...x, eqId: allocEqInput, zone: allocZoneInput, start: allocStartInput, end: allocEndInput
      } : x))
    } else {
      setAllocations(a => [...a, {
        id: Date.now().toString(), eqId: allocEqInput, zone: allocZoneInput, start: allocStartInput, end: allocEndInput
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
    setAllocDialogOpen(true)
  }

  // Helper
  const getClassName = (cid: string) => classes.find(c => c.id === cid)?.name || "Unknown"
  const getEqName = (eid: string) => equipments.find(e => e.id === eid)?.name || "Unknown"

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Equipment Allocation &amp; Utilization
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage heavy machinery, assignments, and utilization tracking
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="allocations">Assignments</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">In Use</CardTitle>
                  <Activity className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{stats.active}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {stats.activePercentage.toFixed(0)}% utilization
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Idle / Available</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{stats.idle}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ready for assignment
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historical Utilization</CardTitle>
                  <CardDescription>Most frequently used equipment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.mostUsed.map(eq => (
                    <div key={eq.id} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{eq.name} ({getClassName(eq.classId)})</span>
                        <span className="text-muted-foreground">{eq.utilScore}%</span>
                      </div>
                      <Progress value={eq.utilScore} className="h-2" />
                    </div>
                  ))}
                  {stats.mostUsed.length === 0 && <p className="text-sm text-muted-foreground">No data available.</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Underutilized Equipment</CardTitle>
                  <CardDescription>Least frequently used equipment (candidate for off-hiring)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.leastUsed.map(eq => (
                    <div key={eq.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <div className="font-medium text-sm">{eq.name}</div>
                        <div className="text-xs text-muted-foreground">{getClassName(eq.classId)}</div>
                      </div>
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                        {eq.utilScore}% Used
                      </Badge>
                    </div>
                  ))}
                  {stats.leastUsed.length === 0 && <p className="text-sm text-muted-foreground">No data available.</p>}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Current Locations</CardTitle>
                <CardDescription>Where active equipment is mapped right now</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allocations.length > 0 ? allocations.map(a => (
                    <div key={a.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{getEqName(a.eqId)}</p>
                          <p className="text-xs text-muted-foreground">Assigned to: {a.zone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">Until {a.end}</p>
                        <Badge variant="outline" className="mt-1 bg-emerald-500/10 text-emerald-600 border-none">
                          Active
                        </Badge>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">No active allocations at the moment.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CLASSES TAB */}
          <TabsContent value="classes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Equipment Classes</CardTitle>
                  <CardDescription>Manage types of machinery available (e.g. Cranes, Excavators)</CardDescription>
                </div>
                <Button onClick={() => openClassDialog()} size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Add Class
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Name</TableHead>
                      <TableHead>Registered Items</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map(c => {
                      const count = equipments.filter(e => e.classId === c.id).length
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{count} Items</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openClassDialog(c)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteClass(c.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {classes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                          No classes found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INVENTORY TAB */}
          <TabsContent value="inventory">
             <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Equipment Inventory</CardTitle>
                  <CardDescription>Manage individual machinery units</CardDescription>
                </div>
                <Button onClick={() => openEqDialog()} size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Add Equipment
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name/Code</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipments.map(eq => {
                      const isActive = activeEqIds.has(eq.id)
                      return (
                        <TableRow key={eq.id}>
                          <TableCell className="font-medium">{eq.name}</TableCell>
                          <TableCell>{getClassName(eq.classId)}</TableCell>
                          <TableCell>
                            {isActive ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none">
                                In Use
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-none">
                                Idle
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openEqDialog(eq)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteEquipment(eq.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
             <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Assignments</CardTitle>
                  <CardDescription>Allocate equipment to construction zones or tasks</CardDescription>
                </div>
                <Button onClick={() => openAllocDialog()} size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Assign Equipment
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Zone / Task</TableHead>
                      <TableHead>Timeframe</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.map(a => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{getEqName(a.eqId)}</TableCell>
                        <TableCell>{a.zone}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {a.start} <span className="mx-1 text-muted-foreground/50">→</span> {a.end}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openAllocDialog(a)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteAllocation(a.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allocations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                          No active allocations.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAlloc ? "Edit Assignment" : "Assign Equipment"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Select Equipment</Label>
              <Select value={allocEqInput} onValueChange={setAllocEqInput}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an idle equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipments.map(eq => {
                    const isAllocatedLocally = activeEqIds.has(eq.id) && editingAlloc?.eqId !== eq.id
                    return (
                      <SelectItem key={eq.id} value={eq.id} disabled={isAllocatedLocally}>
                        {eq.name} {isAllocatedLocally ? "(In Use)" : "(Idle)"}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone">Task / Zone</Label>
              <Input 
                id="zone" 
                value={allocZoneInput} 
                onChange={(e) => setAllocZoneInput(e.target.value)} 
                placeholder="e.g., Zone A - Foundation"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Date</Label>
                <Input 
                  id="start" 
                  type="date"
                  value={allocStartInput} 
                  onChange={(e) => setAllocStartInput(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="end">End Date</Label>
                <Input 
                  id="end" 
                  type="date"
                  value={allocEndInput} 
                  onChange={(e) => setAllocEndInput(e.target.value)} 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setAllocDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveAllocation}>Save Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}