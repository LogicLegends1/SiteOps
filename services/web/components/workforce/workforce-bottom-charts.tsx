"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DonutChart, { type DonutChartSegment } from "@/components/charts/DonutChart"
import { getDisciplineLabel, getRoleLabel } from "@/lib/workforce-data"
import { type ExperienceLevel, type WorkforceWorker, type WorkerDiscipline, type WorkerRole } from "@/lib/workforce-live"
import { cn } from "@/lib/utils"

const DISCIPLINE_ORDER: WorkerDiscipline[] = ["civil", "electrical", "mechanical", "qa", "safety", "general", "it"]

const ROLE_ORDER: WorkerRole[] = [
  "engineer",
  "supervisor",
  "technician",
  "operator",
  "skilled-labour",
  "general-labour",
  "developer",
  "system-admin",
]

const EXPERIENCE_ORDER: ExperienceLevel[] = ["expert", "senior", "mid-level", "junior"]

const DISCIPLINE_COLORS: Record<WorkerDiscipline, string> = {
  civil: "text-blue-500",
  electrical: "text-emerald-500",
  mechanical: "text-amber-500",
  qa: "text-violet-500",
  safety: "text-rose-500",
  general: "text-cyan-500",
  it: "text-fuchsia-500",
}

const ROLE_COLORS: Record<WorkerRole, string> = {
  engineer: "text-blue-500",
  supervisor: "text-amber-500",
  technician: "text-emerald-500",
  operator: "text-violet-500",
  "skilled-labour": "text-cyan-500",
  "general-labour": "text-slate-500",
  developer: "text-fuchsia-500",
  "system-admin": "text-rose-500",
}

const EXPERIENCE_COLORS: Record<ExperienceLevel, string> = {
  expert: "text-amber-500",
  senior: "text-primary",
  "mid-level": "text-emerald-500",
  junior: "text-slate-500",
}

type WorkforceBottomChartsProps = {
  workers: WorkforceWorker[]
  className?: string
}

function buildSegments<T extends string>(
  workers: WorkforceWorker[],
  order: readonly T[],
  getValue: (worker: WorkforceWorker) => T,
  getLabel: (value: T) => string,
  colorMap: Record<T, string>
): DonutChartSegment[] {
  const counts = new Map<string, number>()

  for (const worker of workers) {
    const value = getValue(worker)
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return order
    .map((value) => ({
      key: value,
      label: getLabel(value),
      value: counts.get(value) ?? 0,
      colorClass: colorMap[value],
    }))
    .filter((segment) => segment.value > 0)
}

function formatExperienceLabel(level: ExperienceLevel): string {
  return level.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

export function WorkforceBottomCharts({ workers, className }: WorkforceBottomChartsProps) {
  const workforceByDiscipline = buildSegments(
    workers,
    DISCIPLINE_ORDER,
    (worker) => worker.discipline,
    getDisciplineLabel,
    DISCIPLINE_COLORS
  )
  const workforceByRole = buildSegments(workers, ROLE_ORDER, (worker) => worker.role, getRoleLabel, ROLE_COLORS)
  const workforceByExperience = buildSegments(
    workers,
    EXPERIENCE_ORDER,
    (worker) => worker.experienceLevel,
    formatExperienceLabel,
    EXPERIENCE_COLORS
  )

  return (
    <div className={cn("flex h-full flex-col justify-between gap-4", className)}>
      <Card className="border-border/60 bg-card/60 min-h-44">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-black tracking-wide">Workforce Distribution By Discipline</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart segments={workforceByDiscipline} centerLabel="Workers" className="w-full" compact />
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 min-h-44">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-black tracking-wide">Workforce Distribution By Role</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart segments={workforceByRole} centerLabel="Workers" className="w-full" compact />
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 min-h-44">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-black tracking-wide">Workforce Distribution By Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart segments={workforceByExperience} centerLabel="Workers" className="w-full" compact />
        </CardContent>
      </Card>
    </div>
  )
}
