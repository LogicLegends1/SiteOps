"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getDisciplineLabel,
  getRoleLabel,
} from "@/lib/workforce-data"
import { cn } from "@/lib/utils"
import { type WorkforceTeam, type WorkforceWorker, type WorkerDiscipline, type WorkerRole } from "@/lib/workforce-live"
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
  teams?: WorkforceTeam[]
  toolbarRight?: React.ReactNode
  className?: string
}

export function WorkerClassification({
  workers,
  teams = [],
  toolbarRight,
  className,
}: WorkerClassificationProps) {
  const [activeTab, setActiveTab] = useState<"discipline" | "role" | "experience">("discipline")

  const disciplines: WorkerDiscipline[] = ["civil", "electrical", "mechanical", "qa", "safety", "general", "it"]
  const roles: WorkerRole[] = ["engineer", "supervisor", "technician", "operator", "skilled-labour", "general-labour", "developer", "system-admin"]
  const experienceLevels = ["expert", "senior", "mid-level", "junior"]

  const teamById = new Map(teams.map((team) => [team.id, team]))

  const getStatusPresentation = (status: WorkforceWorker["status"]) => {
    switch (status) {
      case "active":
        return { label: "ACTIVE", className: "bg-success/15 text-success border-success/30" }
      case "idle":
        return { label: "IDLE", className: "bg-primary/10 text-primary border-primary/20" }
      case "unavailable":
      default:
        return { label: "UNAVAILABLE", className: "bg-muted text-muted-foreground border-border" }
    }
  }

  const getThirdColumn = (worker: WorkforceWorker) => {
    if (activeTab === "discipline") {
      return {
        title: "Role/Experience",
        top: getRoleLabel(worker.role),
        bottom: `${worker.experienceYears} yrs`,
      }
    }

    if (activeTab === "role") {
      return {
        title: "Discipline/Experience",
        top: getDisciplineLabel(worker.discipline),
        bottom: `${worker.experienceYears} yrs`,
      }
    }

    return {
      title: "Role/Discipline",
      top: getRoleLabel(worker.role),
      bottom: getDisciplineLabel(worker.discipline),
    }
  }

  const renderWorkerRow = (worker: WorkforceWorker) => {
    const DisciplineIcon = disciplineIcons[worker.discipline]
    const teamName = worker.assignedTeamId ? teamById.get(worker.assignedTeamId)?.name ?? "—" : "—"
    const status = getStatusPresentation(worker.status)
    const third = getThirdColumn(worker)

    return (
      <TableRow key={worker.id} className="border-border/60">
        <TableCell className="w-28 font-mono text-xs text-muted-foreground whitespace-nowrap">
          {worker.id}
        </TableCell>
        <TableCell className="min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-muted/50 text-foreground">
                {worker.name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">{worker.name}</span>
                <DisciplineIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="w-48 text-sm text-foreground">
          <div className="flex flex-col">
            <span className="truncate">{third.top}</span>
            <span className="text-xs text-muted-foreground truncate">{third.bottom}</span>
          </div>
        </TableCell>
        <TableCell className="w-44 text-sm text-foreground truncate">{teamName}</TableCell>
        <TableCell className="w-28 pr-3 text-right whitespace-nowrap">
          <Badge variant="outline" className={cn("capitalize px-2", status.className)}>
            {status.label}
          </Badge>
        </TableCell>
      </TableRow>
    )
  }

  const GroupHeader = ({
    icon,
    title,
    available,
  }: {
    icon?: React.ElementType
    title: string
    available: number
  }) => {
    const Icon = icon
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
        {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary/20">
          {available} active
        </Badge>
      </div>
    )
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as "discipline" | "role" | "experience")}
      className={cn("flex h-full flex-col", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <TabsList className="grid w-full max-w-105 grid-cols-3 rounded-lg bg-muted/30 p-1">
          <TabsTrigger value="discipline" className="rounded-md text-xs font-semibold">
            By Discipline
          </TabsTrigger>
          <TabsTrigger value="role" className="rounded-md text-xs font-semibold">
            By Role
          </TabsTrigger>
          <TabsTrigger value="experience" className="rounded-md text-xs font-semibold">
            By Experience
          </TabsTrigger>
        </TabsList>

        {toolbarRight ? <div className="shrink-0">{toolbarRight}</div> : null}
      </div>

      <TabsContent value="discipline" className="mt-4 flex-1 min-h-0">
        <ScrollArea className="h-full pr-2">
          <div className="space-y-4">
            {disciplines.map((discipline) => {
              const disciplineWorkers = workers.filter((w) => w.discipline === discipline)
              if (disciplineWorkers.length === 0) return null
              const available = disciplineWorkers.filter((w) => w.status !== "unavailable").length
              const DisciplineIcon = disciplineIcons[discipline]

              return (
                <div key={discipline} className="space-y-2">
                  <GroupHeader icon={DisciplineIcon} title={getDisciplineLabel(discipline)} available={available} />
                  <div className="rounded-lg border border-border/60 overflow-hidden">
                    <Table className="w-full table-fixed">
                      <TableHeader>
                        <TableRow className="border-border/60 hover:bg-transparent">
                          <TableHead className="w-28 text-xs">Worker ID</TableHead>
                          <TableHead className="text-xs">Name</TableHead>
                          <TableHead className="w-48 text-xs">Role/Experience</TableHead>
                          <TableHead className="w-44 text-xs">Primary Team</TableHead>
                          <TableHead className="w-28 pr-3 text-xs text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>{disciplineWorkers.map(renderWorkerRow)}</TableBody>
                    </Table>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="role" className="mt-4 flex-1 min-h-0">
        <ScrollArea className="h-full pr-2">
          <div className="space-y-4">
            {roles.map((role) => {
              const roleWorkers = workers.filter((w) => w.role === role)
              if (roleWorkers.length === 0) return null
              const available = roleWorkers.filter((w) => w.status !== "unavailable").length

              return (
                <div key={role} className="space-y-2">
                  <GroupHeader title={getRoleLabel(role)} available={available} />
                  <div className="rounded-lg border border-border/60 overflow-hidden">
                    <Table className="w-full table-fixed">
                      <TableHeader>
                        <TableRow className="border-border/60 hover:bg-transparent">
                          <TableHead className="w-28 text-xs">Worker ID</TableHead>
                          <TableHead className="text-xs">Name</TableHead>
                          <TableHead className="w-48 text-xs">Discipline/Experience</TableHead>
                          <TableHead className="w-44 text-xs">Primary Team</TableHead>
                          <TableHead className="w-28 pr-3 text-xs text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>{roleWorkers.map(renderWorkerRow)}</TableBody>
                    </Table>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="experience" className="mt-4 flex-1 min-h-0">
        <ScrollArea className="h-full pr-2">
          <div className="space-y-4">
            {experienceLevels.map((level) => {
              const levelWorkers = workers.filter((w) => w.experienceLevel === level)
              if (levelWorkers.length === 0) return null
              const available = levelWorkers.filter((w) => w.status !== "unavailable").length

              return (
                <div key={level} className="space-y-2">
                  <GroupHeader title={level.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} available={available} />
                  <div className="rounded-lg border border-border/60 overflow-hidden">
                    <Table className="w-full table-fixed">
                      <TableHeader>
                        <TableRow className="border-border/60 hover:bg-transparent">
                          <TableHead className="w-28 text-xs">Worker ID</TableHead>
                          <TableHead className="text-xs">Name</TableHead>
                          <TableHead className="w-48 text-xs">Role/Discipline</TableHead>
                          <TableHead className="w-44 text-xs">Primary Team</TableHead>
                          <TableHead className="w-28 pr-3 text-xs text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>{levelWorkers.map(renderWorkerRow)}</TableBody>
                    </Table>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  )
}
