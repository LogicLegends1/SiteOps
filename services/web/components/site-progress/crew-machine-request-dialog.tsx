"use client"

import { useEffect, useMemo, useState } from "react"
import { type Activity } from "@/lib/site-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

type RequestType = "crew" | "machine"

const EQUIPMENT_TYPES = [
  "Excavator",
  "Tipper",
  "Tower Crane",
  "Concrete Pump",
  "Bulldozer",
  "Roller",
  "Generator",
]

type CrewRequestValues = {
  tower_crane_operators: number
  excavator_operators: number
  crawler_crane_operators: number
  tipper_drivers: number
  surveyors: number
  masons: number
  carpenters: number
  steel_fixers: number
  electricians: number
  general_labors: number
  site_engineers: number
}

type CrewField = {
  key: keyof CrewRequestValues
  label: string
}

const CREW_FIELDS: CrewField[] = [
  { key: "site_engineers", label: "Site Engineers" },
  { key: "surveyors", label: "Surveyors" },
  { key: "tower_crane_operators", label: "Tower Crane Operators" },
  { key: "excavator_operators", label: "Excavator Operators" },
  { key: "crawler_crane_operators", label: "Crawler Crane Operators" },
  { key: "tipper_drivers", label: "Tipper Drivers" },
  { key: "masons", label: "Masons" },
  { key: "carpenters", label: "Carpenters" },
  { key: "steel_fixers", label: "Steel Fixers" },
  { key: "electricians", label: "Electricians" },
  { key: "general_labors", label: "General Labors" },
]

function createEmptyCrewRequest(): CrewRequestValues {
  return {
    tower_crane_operators: 0,
    excavator_operators: 0,
    crawler_crane_operators: 0,
    tipper_drivers: 0,
    surveyors: 0,
    masons: 0,
    carpenters: 0,
    steel_fixers: 0,
    electricians: 0,
    general_labors: 0,
    site_engineers: 0,
  }
}

function normalizeCrewRequest(data: Partial<Record<keyof CrewRequestValues, unknown>> | null | undefined) {
  const next = createEmptyCrewRequest()
  if (!data) return next

  for (const field of CREW_FIELDS) {
    const raw = data[field.key]
    const parsed = raw === null || raw === undefined || raw === "" ? 0 : Number(raw)
    next[field.key] = Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0
  }

  return next
}

function crewTotal(values: CrewRequestValues) {
  return Object.values(values).reduce((sum, value) => sum + value, 0)
}

interface CrewMachineRequestDialogProps {
  activity: Activity
  open: boolean
  requestType: RequestType | null
  onOpenChange: (open: boolean) => void
  onMachineRequestSubmit?: (activityId: number, details: string) => void
}

export function CrewMachineRequestDialog({
  activity,
  open,
  requestType,
  onOpenChange,
  onMachineRequestSubmit,
}: CrewMachineRequestDialogProps) {
  const [crewRequest, setCrewRequest] = useState<CrewRequestValues>(createEmptyCrewRequest())
  const [crewLoading, setCrewLoading] = useState(false)
  const [crewSubmitting, setCrewSubmitting] = useState(false)
  const [crewError, setCrewError] = useState<string | null>(null)
  const [machineDetails, setMachineDetails] = useState("")
  const [equipmentQuantities, setEquipmentQuantities] = useState<Record<string, number>>(() =>
    EQUIPMENT_TYPES.reduce((acc, type) => {
      acc[type] = 0
      return acc
    }, {} as Record<string, number>)
  )
  const [machineSubmitting, setMachineSubmitting] = useState(false)
  const [machineError, setMachineError] = useState<string | null>(null)

  const totalCrew = useMemo(() => crewTotal(crewRequest), [crewRequest])

  useEffect(() => {
    if (!open) return

    if (requestType === "machine") {
      setMachineDetails("")
      setMachineError(null)
      setEquipmentQuantities(
        EQUIPMENT_TYPES.reduce((acc, type) => {
          acc[type] = 0
          return acc
        }, {} as Record<string, number>)
      )
      return
    }

    let active = true
    const loadCrewRequirements = async () => {
      if (!activity.projectID) return
      try {
        setCrewLoading(true)
        setCrewError(null)
        const res = await fetch(`/api/project/${activity.projectID}/activity/${activity.zoneID}/worker-requirements`)
        const data = await res.json()
        if (!active) return
        setCrewRequest(normalizeCrewRequest(data?.requirements))
      } catch (error: any) {
        if (!active) return
        setCrewError(error?.message ?? "Failed to load crew request")
        setCrewRequest(createEmptyCrewRequest())
      } finally {
        if (active) setCrewLoading(false)
      }
    }

    void loadCrewRequirements()

    return () => {
      active = false
    }
  }, [activity.projectID, activity.zoneID, open, requestType])

  const updateCrewField = (key: keyof CrewRequestValues, value: string) => {
    const parsed = value === "" ? 0 : Number(value)
    setCrewRequest((prev) => ({
      ...prev,
      [key]: Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0,
    }))
  }

  const submitCrewRequest = async () => {
    if (!activity.projectID) return
    try {
      setCrewSubmitting(true)
      setCrewError(null)

      const res = await fetch(
        `/api/project/${activity.projectID}/activity/${activity.zoneID}/worker-requirements`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workerRequirements: crewRequest }),
        }
      )

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error ?? "Failed to save crew request")
      }

      onOpenChange(false)
    } catch (error: any) {
      setCrewError(error?.message ?? "Failed to save crew request")
    } finally {
      setCrewSubmitting(false)
    }
  }

  const submitMachineRequest = async () => {
    const details = machineDetails.trim()
    const items = EQUIPMENT_TYPES.map((type) => ({
      type,
      quantity: Math.max(0, Math.floor(Number(equipmentQuantities[type] ?? 0))),
    })).filter((item) => item.quantity > 0)

    if (!details && items.length === 0) {
      setMachineError("Please select at least one equipment item or enter details")
      return
    }

    try {
      setMachineSubmitting(true)
      setMachineError(null)

      const payload: Record<string, unknown> = {
        projectID: activity.projectID,
        activityId: activity.zoneID,
      }
      if (details) payload.details = details
      if (items.length > 0) payload.items = items

      const res = await fetch(
        `/api/project/${activity.projectID}/activity/${activity.zoneID}/equipment-requests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error ?? "Failed to submit equipment request")
      }

      onOpenChange(false)
    } catch (error: any) {
      setMachineError(error?.message ?? "Failed to submit equipment request")
    } finally {
      setMachineSubmitting(false)
    }
  }

  const title = requestType === "machine" ? "Equipment Request" : "Crew Request"
  const description =
    requestType === "machine"
      ? "Describe the equipment you need for this activity."
      : "Set the required worker counts for this activity. The latest request is stored in activity_worker_requirements."

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {activity.name}
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {activity.zoneID}
          </Badge>
        </div>

        {requestType === "crew" ? (
          <div className="space-y-4">
            {crewLoading ? (
              <p className="text-sm text-muted-foreground">Loading current crew request...</p>
            ) : null}
            {crewError ? <p className="text-sm text-destructive">{crewError}</p> : null}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CREW_FIELDS.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    type="number"
                    min={0}
                    step={1}
                    value={crewRequest[field.key]}
                    onChange={(event) => updateCrewField(field.key, event.target.value)}
                  />
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total requested workers</span>
              <span className="font-semibold text-foreground">{totalCrew}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {machineError ? <p className="text-sm text-destructive">{machineError}</p> : null}
            <div className="space-y-2">
              <Label>Equipment selection</Label>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_TYPES.map((type) => {
                  const qty = equipmentQuantities[type] ?? 0
                  return (
                    <div key={type} className="flex items-center gap-2 rounded-md border px-2 py-1">
                      <span className="text-sm font-medium">{type}</span>
                      <button
                        type="button"
                        className="inline-flex h-6 w-6 items-center justify-center rounded bg-muted text-sm"
                        onClick={() =>
                          setEquipmentQuantities((prev) => ({
                            ...prev,
                            [type]: Math.max(0, (prev[type] || 0) - 1),
                          }))
                        }
                      >
                        -
                      </button>
                      <Input
                        aria-label={`${type} quantity`}
                        type="number"
                        min={0}
                        value={qty}
                        onChange={(event) =>
                          setEquipmentQuantities((prev) => ({
                            ...prev,
                            [type]: Number(event.target.value || 0),
                          }))
                        }
                        className="h-8 w-16 text-center text-sm"
                      />
                      <button
                        type="button"
                        className="inline-flex h-6 w-6 items-center justify-center rounded bg-muted text-sm"
                        onClick={() =>
                          setEquipmentQuantities((prev) => ({
                            ...prev,
                            [type]: (prev[type] || 0) + 1,
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="machine-details">Equipment details</Label>
              <Textarea
                id="machine-details"
                value={machineDetails}
                onChange={(event) => setMachineDetails(event.target.value)}
                placeholder="For example: 1 excavator and 2 tippers for foundation excavation"
                rows={5}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {requestType === "crew" ? (
            <Button onClick={() => void submitCrewRequest()} disabled={crewSubmitting || crewLoading}>
              {crewSubmitting ? "Saving..." : "Save Crew Request"}
            </Button>
          ) : (
            <Button onClick={() => void submitMachineRequest()} disabled={machineSubmitting}>
              {machineSubmitting ? "Submitting..." : "Submit Equipment Request"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
