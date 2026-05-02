"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  getDisciplineLabel,
  getRoleLabel,
  getStatusColor,
  getExperienceLevelColor,
} from "@/lib/workforce-data"
import { type WorkforceWorker, type WorkerDiscipline, type WorkerRole } from "@/lib/workforce-live"
import { HardHat, Zap, Wrench, ClipboardCheck, Shield, Users, Monitor } from "lucide-react"

const disciplineIcons: Record<WorkerDiscipline, React.ElementType> = {
  civil: HardHat,
  electrical: Zap,
  mechanical: Wrench,
  qa: ClipboardCheck,
  safety: Shield,
  general: Users,
  it: Monitor,
}

interface WorkerClassificationProps {
  workers: WorkforceWorker[]
  selectedWorkers: string[]
  onWorkerSelect: (workerId: string, selected: boolean) => void
  selectionMode: boolean
}

export function WorkerClassification({
  workers,
  selectedWorkers,
  onWorkerSelect,
  selectionMode,
}: WorkerClassificationProps) {
  const [activeTab, setActiveTab] = useState<"discipline" | "role" | "experience">("discipline")

  const disciplines: WorkerDiscipline[] = ["civil", "electrical", "mechanical", "qa", "safety", "general", "it"]
  const roles: WorkerRole[] = ["engineer", "supervisor", "technician", "operator", "skilled-labour", "general-labour", "developer", "system-admin"]
  const experienceLevels = ["expert", "senior", "mid-level", "junior"]

  const renderWorkerCard = (worker: WorkforceWorker) => {
    const isSelected = selectedWorkers.includes(worker.id)
    const DisciplineIcon = disciplineIcons[worker.discipline]

    return (
      <div
        key={worker.id}
        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
          isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent/50"
        } ${selectionMode && worker.status !== "idle" ? "opacity-50" : ""}`}
      >
        {selectionMode && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onWorkerSelect(worker.id, checked as boolean)}
            disabled={worker.status !== "idle"}
          />
        )}
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            {worker.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm text-foreground truncate">{worker.name}</p>
            <DisciplineIcon className="h-3 w-3 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">
            {getRoleLabel(worker.role)} - {worker.experienceYears} yrs
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className={getStatusColor(worker.status)}>
            {worker.status}
          </Badge>
          <Badge variant="outline" className={getExperienceLevelColor(worker.experienceLevel)}>
            {worker.experienceLevel}
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center justify-between">
          Worker Classification
          {selectionMode && (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {selectedWorkers.length} selected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "discipline" | "role" | "experience")}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="discipline">By Discipline</TabsTrigger>
            <TabsTrigger value="role">By Role</TabsTrigger>
            <TabsTrigger value="experience">By Experience</TabsTrigger>
          </TabsList>

          <TabsContent value="discipline">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {disciplines.map((discipline) => {
                  const disciplineWorkers = workers.filter((w) => w.discipline === discipline)
                  if (disciplineWorkers.length === 0) return null
                  const DisciplineIcon = disciplineIcons[discipline]

                  return (
                    <div key={discipline}>
                      <div className="flex items-center gap-2 mb-2">
                        <DisciplineIcon className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">
                          {getDisciplineLabel(discipline)}
                        </h4>
                        <Badge variant="secondary" className="ml-auto">
                          {disciplineWorkers.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {disciplineWorkers.map(renderWorkerCard)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="role">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {roles.map((role) => {
                  const roleWorkers = workers.filter((w) => w.role === role)
                  if (roleWorkers.length === 0) return null

                  return (
                    <div key={role}>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-foreground">{getRoleLabel(role)}</h4>
                        <Badge variant="secondary" className="ml-auto">
                          {roleWorkers.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">{roleWorkers.map(renderWorkerCard)}</div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="experience">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {experienceLevels.map((level) => {
                  const levelWorkers = workers.filter((w) => w.experienceLevel === level)
                  if (levelWorkers.length === 0) return null

                  return (
                    <div key={level}>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-foreground capitalize">{level}</h4>
                        <Badge variant="secondary" className="ml-auto">
                          {levelWorkers.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">{levelWorkers.map(renderWorkerCard)}</div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
