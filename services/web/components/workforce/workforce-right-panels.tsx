"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"

type DonutSegment = {
  value: number
  className: string
}

type MiniDonutProps = {
  segments: DonutSegment[]
  size?: number
  strokeWidth?: number
  labelLines: string[]
}

function MiniDonut({ segments, size = 44, strokeWidth = 6, labelLines }: MiniDonutProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let offset = 0

  return (
    <div className="flex items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-label="distribution"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-700/40"
        />

        {total > 0
          ? segments
              .filter((s) => s.value > 0)
              .map((segment, index) => {
                const ratio = segment.value / total
                const dash = ratio * circumference
                const dashArray = `${dash} ${circumference - dash}`

                const el = (
                  <circle
                    key={index}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={dashArray}
                    strokeDashoffset={-offset}
                    className={cn("transition-opacity", segment.className)}
                  />
                )

                offset += dash
                return el
              })
          : null}
      </svg>

      <div className="space-y-0.5">
        {labelLines.map((line) => (
          <div key={line} className="text-[11px] text-muted-foreground leading-4">
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}

type ActivityDistributionItem = {
  title: string
  subtitle: string
  assignedTeam: string
  discipline: { labelLines: string[]; segments: DonutSegment[] }
  role: { labelLines: string[]; segments: DonutSegment[] }
  experience: { labelLines: string[]; segments: DonutSegment[] }
}

const demoItems: ActivityDistributionItem[] = [
  {
    title: "Excavate for Zone A Foundation",
    subtitle: "Assigned Team: Flash A",
    assignedTeam: "Flash A",
    discipline: {
      labelLines: ["4 Civil", "2 Mechanical", "2 Electrical"],
      segments: [
        { value: 4, className: "text-blue-500" },
        { value: 2, className: "text-amber-500" },
        { value: 2, className: "text-emerald-500" },
      ],
    },
    role: {
      labelLines: ["2 Supervisor", "6 Technician"],
      segments: [
        { value: 2, className: "text-sky-500" },
        { value: 6, className: "text-violet-500" },
      ],
    },
    experience: {
      labelLines: ["3 < 1 yr", "3 1-5 yrs", "2 5-10 yrs"],
      segments: [
        { value: 3, className: "text-cyan-500" },
        { value: 3, className: "text-lime-500" },
        { value: 2, className: "text-orange-500" },
      ],
    },
  },
  {
    title: "Pour Foundation Zone B",
    subtitle: "Assigned Team: Thunder",
    assignedTeam: "Thunder",
    discipline: {
      labelLines: ["4 Civil", "2 Mechanical", "2 Electrical"],
      segments: [
        { value: 4, className: "text-blue-500" },
        { value: 2, className: "text-amber-500" },
        { value: 2, className: "text-emerald-500" },
      ],
    },
    role: {
      labelLines: ["2 Supervisor", "6 Technician"],
      segments: [
        { value: 2, className: "text-sky-500" },
        { value: 6, className: "text-violet-500" },
      ],
    },
    experience: {
      labelLines: ["3 < 1 yr", "3 1-5 yrs", "2 5-10 yrs"],
      segments: [
        { value: 3, className: "text-cyan-500" },
        { value: 3, className: "text-lime-500" },
        { value: 2, className: "text-orange-500" },
      ],
    },
  },
  {
    title: "Install Drainage Zone C",
    subtitle: "Assigned Team: Flash A",
    assignedTeam: "Flash A",
    discipline: {
      labelLines: ["4 Civil", "2 Mechanical", "2 Electrical"],
      segments: [
        { value: 4, className: "text-blue-500" },
        { value: 2, className: "text-amber-500" },
        { value: 2, className: "text-emerald-500" },
      ],
    },
    role: {
      labelLines: ["2 Supervisor", "6 Technician"],
      segments: [
        { value: 2, className: "text-sky-500" },
        { value: 6, className: "text-violet-500" },
      ],
    },
    experience: {
      labelLines: ["3 < 1 yr", "3 1-5 yrs", "2 5-10 yrs"],
      segments: [
        { value: 3, className: "text-cyan-500" },
        { value: 3, className: "text-lime-500" },
        { value: 2, className: "text-orange-500" },
      ],
    },
  },
]

export function ActivityWorkforceDistributionPanel() {
  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-black tracking-wide">Activity Workforce Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {demoItems.map((item) => (
          <div key={item.title} className="rounded-xl border border-border/60 bg-muted/10 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.subtitle}</div>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {item.assignedTeam}
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <MiniDonut segments={item.discipline.segments} labelLines={item.discipline.labelLines} />
              <MiniDonut segments={item.role.segments} labelLines={item.role.labelLines} />
              <MiniDonut segments={item.experience.segments} labelLines={item.experience.labelLines} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

type TimelineRow = {
  label: string
  bar: { startPct: number; widthPct: number; className: string }
}

const demoTimeline: TimelineRow[] = [
  {
    label: "Excavation (Flash A)",
    bar: { startPct: 2, widthPct: 42, className: "bg-blue-500/80" },
  },
  {
    label: "Pouring (Flash A)",
    bar: { startPct: 24, widthPct: 40, className: "bg-amber-500/80" },
  },
  {
    label: "Pouring (Flash B)",
    bar: { startPct: 40, widthPct: 32, className: "bg-sky-500/80" },
  },
  {
    label: "Drainage (Flash A)",
    bar: { startPct: 58, widthPct: 28, className: "bg-emerald-500/80" },
  },
  {
    label: "Drainage (Flash C)",
    bar: { startPct: 70, widthPct: 24, className: "bg-amber-500/80" },
  },
]

export function WorkforceAllocationTimelinePanel() {
  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-black tracking-wide">Workforce Allocation Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-[150px_1fr] gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <div />
          <div className="grid grid-cols-4">
            <div className="text-center">Phase 1</div>
            <div className="text-center">Phase 2</div>
            <div className="text-center">Phase 3</div>
            <div className="text-center">Phase 4</div>
          </div>
        </div>

        <div className="space-y-3">
          {demoTimeline.map((row) => (
            <div key={row.label} className="grid grid-cols-[150px_1fr] items-center gap-2">
              <div className="text-xs text-muted-foreground truncate">{row.label}</div>

              <div className="relative h-3 rounded-full border border-border/60 bg-muted/20 overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 left-1/4 w-px bg-border/50" />
                <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-border/50" />
                <div className="pointer-events-none absolute inset-y-0 left-3/4 w-px bg-border/50" />

                <div
                  className={cn("absolute top-1/2 h-2 -translate-y-1/2 rounded-full", row.bar.className)}
                  style={{ left: `${row.bar.startPct}%`, width: `${row.bar.widthPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
