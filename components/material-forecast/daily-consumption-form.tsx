"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  materials,
  activities,
  zones,
  recentConsumptionLogs,
  type MaterialConsumptionLog,
} from "@/lib/material-data"
import { Plus, ClipboardList, User, Calendar, MapPin, Package } from "lucide-react"

export function DailyConsumptionForm() {
  const [logs, setLogs] = useState<MaterialConsumptionLog[]>(recentConsumptionLogs)
  const [formData, setFormData] = useState({
    materialId: "",
    quantity: "",
    activity: "",
    zone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedMaterial = materials.find((m) => m.id === formData.materialId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.materialId || !formData.quantity || !formData.activity || !formData.zone) {
      return
    }

    setIsSubmitting(true)

    // Simulate submission
    setTimeout(() => {
      const newLog: MaterialConsumptionLog = {
        id: `LOG-${Date.now()}`,
        materialId: formData.materialId,
        date: new Date().toISOString().split("T")[0],
        quantity: parseFloat(formData.quantity),
        activity: formData.activity,
        zone: formData.zone,
        loggedBy: "Current User",
      }

      setLogs((prev) => [newLog, ...prev])
      setFormData({
        materialId: "",
        quantity: "",
        activity: "",
        zone: "",
      })
      setIsSubmitting(false)
    }, 500)
  }

  const getMaterialName = (id: string) => {
    return materials.find((m) => m.id === id)?.name || id
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Daily Consumption Log
        </CardTitle>
        <CardDescription>Record material usage for today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Material Selection */}
            <div className="col-span-2">
              <Label htmlFor="material">Material</Label>
              <Select
                value={formData.materialId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, materialId: value }))
                }
              >
                <SelectTrigger id="material">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      <div className="flex items-center gap-2">
                        <span>{material.name}</span>
                        {material.stockLevel === "critical" && (
                          <Badge variant="destructive" className="text-xs">Critical</Badge>
                        )}
                        {material.stockLevel === "low" && (
                          <Badge variant="secondary" className="text-xs bg-warning/20 text-warning">Low</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">
                Quantity {selectedMaterial && `(${selectedMaterial.unit})`}
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                }
              />
              {selectedMaterial && (
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {selectedMaterial.available.toLocaleString()} {selectedMaterial.unit}
                </p>
              )}
            </div>

            {/* Zone */}
            <div>
              <Label htmlFor="zone">Zone</Label>
              <Select
                value={formData.zone}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, zone: value }))
                }
              >
                <SelectTrigger id="zone">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Activity */}
            <div className="col-span-2">
              <Label htmlFor="activity">Activity</Label>
              <Select
                value={formData.activity}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, activity: value }))
                }
              >
                <SelectTrigger id="activity">
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  {activities.map((activity) => (
                    <SelectItem key={activity} value={activity}>
                      {activity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isSubmitting ||
              !formData.materialId ||
              !formData.quantity ||
              !formData.activity ||
              !formData.zone
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            {isSubmitting ? "Logging..." : "Log Consumption"}
          </Button>
        </form>

        <Separator />

        {/* Recent Logs */}
        <div>
          <h4 className="text-sm font-medium mb-3">Recent Consumption Logs</h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {logs.slice(0, 10).map((log) => {
                const material = materials.find((m) => m.id === log.materialId)
                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-secondary/50 border border-border text-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{getMaterialName(log.materialId)}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.quantity} {material?.unit || "units"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {log.zone}
                          </span>
                          <span>{log.activity}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(log.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <User className="h-3 w-3" />
                          {log.loggedBy}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
