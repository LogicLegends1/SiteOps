import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
import { Check, ChevronsUpDown, Plus, ClipboardList, User, Calendar, MapPin, Package, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Material } from "@/lib/material-data"

export function DailyConsumptionForm() {
  const [liveMaterials, setLiveMaterials] = useState<Material[]>([])
  const [liveActivities, setLiveActivities] = useState<any[]>([])
  const [zonesList, setZonesList] = useState<string[]>(["Zone A", "Zone B", "Zone C", "Zone D"]) // Default fallback
  
  const [openMaterial, setOpenMaterial] = useState(false)
  const [openActivity, setOpenActivity] = useState(false)
  const [openZone, setOpenZone] = useState(false)

  const [formData, setFormData] = useState({
    materialId: "",
    quantity: "",
    activityId: "",
    activityName: "",
    zone: "",
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [matsRes, actsRes] = await Promise.all([
          fetch("http://localhost:8000/predict/shortage/all/1"),
          fetch("/api/activity?projectId=1")
        ])
        
        const mats = await matsRes.json()
        const acts = await actsRes.json()
        
        setLiveMaterials(mats || [])
        setLiveActivities(acts || [])
        
        // Extract unique zones from activities if available
        if (acts && acts.length > 0) {
          const uniqueZones = Array.from(new Set(acts.map((a: any) => a.zonename).filter(Boolean))) as string[]
          if (uniqueZones.length > 0) setZonesList(uniqueZones)
        }
      } catch (err) {
        console.error("Failed to fetch form data", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const selectedMaterial = liveMaterials.find((m) => m.id === formData.materialId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.materialId || !formData.quantity || !formData.activityId || !formData.zone) {
      alert("Please fill all fields")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/materials/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: parseInt(formData.materialId),
          quantity: parseFloat(formData.quantity),
          activityId: parseInt(formData.activityId),
          // zone is currently logged in the UI but the API might need it later
        }),
      })

      if (res.ok) {
        setFormData({
          materialId: "",
          quantity: "",
          activityId: "",
          activityName: "",
          zone: "",
        })
        // Refresh local data to show impact immediately? (In a real app, we'd use a global state or SWR/Query)
        window.location.reload() 
      } else {
        const err = await res.json()
        alert(`Error: ${err.error || "Failed to log consumption"}`)
      }
    } catch (err) {
      console.error(err)
      alert("Network error. Check if backend is running.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading field parameters...</div>
  }

  return (
    <Card className="border-primary/20 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Field Consumption Log
            </CardTitle>
            <CardDescription className="text-xs uppercase font-medium tracking-tight">Record daily material utilization</CardDescription>
          </div>
          <Badge variant="outline" className="h-6 bg-primary/5 text-primary border-primary/20">Project Alpha</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Material Selection - Searchable Combobox */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="material" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" /> Item Specification
              </Label>
              <Popover open={openMaterial} onOpenChange={setOpenMaterial}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openMaterial}
                    className="w-full justify-between h-11 bg-background/50 border-input hover:border-primary/50"
                  >
                    {formData.materialId
                      ? liveMaterials.find((m) => m.id === formData.materialId)?.name
                      : "Search Materials..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Type material name..." />
                    <CommandList>
                      <CommandEmpty>No material found.</CommandEmpty>
                      <CommandGroup>
                        {liveMaterials.map((m) => (
                          <CommandItem
                            key={m.id}
                            value={m.name}
                            onSelect={() => {
                              setFormData((prev) => ({ ...prev, materialId: m.id }))
                              setOpenMaterial(false)
                            }}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{m.name}</span>
                              <span className="text-[10px] text-muted-foreground">{m.category}</span>
                            </div>
                            {formData.materialId === m.id && <Check className="h-4 w-4" />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Quantity Entry */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity" className="text-xs font-bold uppercase text-muted-foreground">
                Quantity Utilized {selectedMaterial && `(${selectedMaterial.unit})`}
              </Label>
              <div className="relative">
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="h-11 bg-background/50 text-lg font-bold"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                  }
                />
                {selectedMaterial && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-black bg-secondary text-secondary-foreground uppercase">
                    {selectedMaterial.unit}
                  </div>
                )}
              </div>
              {selectedMaterial && (
                <p className="text-[10px] font-medium text-success uppercase">
                  Current Stock: {selectedMaterial.available.toLocaleString()} {selectedMaterial.unit} available
                </p>
              )}
            </div>

            {/* Activity Selection - Searchable Combobox */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="activity" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5" /> Project Activity
              </Label>
              <Popover open={openActivity} onOpenChange={setOpenActivity}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openActivity}
                    className="w-full justify-between h-11 bg-background/50 text-left font-normal border-input hover:border-primary/50"
                  >
                    <span className="truncate">
                      {formData.activityName || "Search ongoing activities..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Type activity..." />
                    <CommandList>
                      <CommandEmpty>No ongoing activities found.</CommandEmpty>
                      <CommandGroup>
                        {liveActivities.map((act) => (
                          <CommandItem
                            key={act.activityid}
                            value={act.name}
                            onSelect={() => {
                              setFormData((prev) => ({ 
                                ...prev, 
                                activityId: act.activityid.toString(),
                                activityName: act.name,
                                zone: act.zonename || prev.zone
                              }))
                              setOpenActivity(false)
                            }}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span>{act.name}</span>
                              <span className="text-[10px] text-muted-foreground">{act.zonename || "Main Site"}</span>
                            </div>
                            {formData.activityId === act.activityid.toString() && <Check className="ml-auto h-4 w-4" />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Zone Selection */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="zone" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Operational Zone
              </Label>
              <Popover open={openZone} onOpenChange={setOpenZone}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-11 bg-background/50 border-input hover:border-primary/50"
                  >
                    {formData.zone || "Select location..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {zonesList.map((z) => (
                          <CommandItem
                            key={z}
                            value={z}
                            onSelect={() => {
                              setFormData((prev) => ({ ...prev, zone: z }))
                              setOpenZone(false)
                            }}
                            className="cursor-pointer"
                          >
                            {z}
                            {formData.zone === z && <Check className="ml-auto h-4 w-4" />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
            disabled={
              isSubmitting ||
              !formData.materialId ||
              !formData.quantity ||
              !formData.activityId ||
              !formData.zone
            }
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">Logging Utilization...</span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="h-5 w-5" /> Commit Entry
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
