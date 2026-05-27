"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

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
  allocationCap: { cap: number; allocated: number }
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
    allocationCap: { cap: 10, allocated: 8 },
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
    allocationCap: { cap: 8, allocated: 8 },
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
    allocationCap: { cap: 9, allocated: 10 },
  },
]

function MiniAllocationCap({ cap, allocated }: { cap: number; allocated: number }) {
  const safeCap = Math.max(0, Number.isFinite(cap) ? cap : 0)
  const safeAllocated = Math.max(0, Number.isFinite(allocated) ? allocated : 0)
  const free = Math.max(0, safeCap - safeAllocated)
  const over = Math.max(0, safeAllocated - safeCap)

  const pct = safeCap > 0 ? Math.min(100, Math.round((safeAllocated / safeCap) * 100)) : 0
  const barClass = over > 0 ? "bg-destructive/70" : "bg-primary/70"

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-muted-foreground leading-4">Allocation Cap</div>
        {over > 0 ? (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
            Over +{over}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-border/60 text-[10px]">
            Free {free}
          </Badge>
        )}
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Allocated {safeAllocated}</span>
          <span>Cap {safeCap}</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full border border-border/60 bg-muted/20">
          <div className={cn("h-full", barClass)} style={{ width: `${safeCap > 0 ? pct : 0}%` }} />
        </div>
      </div>
    </div>
  )
}

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

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MiniDonut segments={item.discipline.segments} labelLines={item.discipline.labelLines} />
              <MiniDonut segments={item.role.segments} labelLines={item.role.labelLines} />
              <MiniDonut segments={item.experience.segments} labelLines={item.experience.labelLines} />
              <MiniAllocationCap cap={item.allocationCap.cap} allocated={item.allocationCap.allocated} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

type AllocationAlertStatus = "understaffed" | "overstaffed" | "ok" | "no-requirements"

type AllocationAlertRoleGap = {
  role: string
  required: number
  assigned: number
  delta: number
}

type AllocationAlertActivity = {
  activityid: number
  description: string
  status: string | null
  team: { teamid: number; teamname: string } | null
  totals: { required: number; assigned: number; missing: number; extra: number }
  statusSummary: AllocationAlertStatus
  gapsByRole: AllocationAlertRoleGap[]
}

function roleKeyToLabel(roleKey: string): string {
  return roleKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function statusBadge(status: AllocationAlertStatus) {
  switch (status) {
    case "understaffed":
      return { label: "Understaffed", className: "bg-destructive/10 text-destructive border-destructive/20" }
    case "overstaffed":
      return { label: "Overstaffed", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" }
    case "no-requirements":
      return { label: "No Requirements", className: "bg-muted/30 text-muted-foreground border-border/50" }
    case "ok":
    default:
      return { label: "OK", className: "bg-success/15 text-success border-success/20" }
  }
}

export function WorkforceAllocationAlertsPanel({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<AllocationAlertActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) return

    setLoading(true)
    setError(null)

    fetch(`/api/project/${projectId}/workforce/allocation-alerts`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json) => {
        setItems(Array.isArray(json?.activities) ? json.activities : [])
      })
      .catch((e: any) => setError(e?.message ?? "Failed to load") )
      .finally(() => setLoading(false))
  }, [projectId])

  const summary = useMemo(() => {
    const understaffed = items.filter((i) => i.statusSummary === "understaffed").length
    const totalMissing = items.reduce((sum, i) => sum + (i?.totals?.missing ?? 0), 0)
    return { understaffed, totalMissing }
  }, [items])

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-black tracking-wide">Workforce Allocation Alerts</CardTitle>
          <div className="flex items-center gap-2">
            {loading ? (
              <Badge variant="outline" className="bg-muted/30 text-muted-foreground">
                Loading…
              </Badge>
            ) : null}
            {error ? (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                {error}
              </Badge>
            ) : null}
            {!loading && !error ? (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {summary.understaffed} flagged • {summary.totalMissing} missing
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 && !loading ? (
          <div className="rounded-xl border border-border/60 bg-muted/10 p-4 text-center">
            <div className="text-sm font-semibold text-foreground">No allocation alerts</div>
            <div className="text-xs text-muted-foreground">No activities with teams were found for this project.</div>
          </div>
        ) : (
          <ScrollArea className="h-80 pr-3">
            <div className="space-y-3">
              {items.map((item) => {
                const badge = statusBadge(item.statusSummary)
                const required = item?.totals?.required ?? 0
                const assigned = item?.totals?.assigned ?? 0
                const pct = required > 0 ? Math.min(100, Math.round((assigned / required) * 100)) : 0

                const biggestGaps = (item.gapsByRole ?? [])
                  .map((g) => ({ ...g, missing: Math.max(0, g.required - g.assigned), extra: Math.max(0, g.assigned - g.required) }))
                  .filter((g) => g.missing > 0 || g.extra > 0)

                const topMissing = biggestGaps
                  .filter((g) => g.missing > 0)
                  .sort((a, b) => b.missing - a.missing)
                  .slice(0, 3)

                const topExtra = biggestGaps
                  .filter((g) => g.extra > 0)
                  .sort((a, b) => b.extra - a.extra)
                  .slice(0, 2)

                return (
                  <div key={item.activityid} className="rounded-xl border border-border/60 bg-muted/10 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">{item.description || `Activity ${item.activityid}`}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          Team: {item.team?.teamname ?? "—"}
                        </div>
                      </div>

                      <Badge variant="outline" className={cn("shrink-0", badge.className)}>
                        {badge.label}
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          Assigned {assigned} / Required {required}
                        </span>
                        {item.statusSummary === "understaffed" ? (
                          <span className="text-destructive font-semibold">Missing {item.totals.missing}</span>
                        ) : item.statusSummary === "overstaffed" ? (
                          <span className="text-amber-600 font-semibold">Extra {item.totals.extra}</span>
                        ) : null}
                      </div>

                      <div className="h-2 overflow-hidden rounded-full border border-border/60 bg-muted/20">
                        <div
                          className={cn(
                            "h-full",
                            item.statusSummary === "understaffed" ? "bg-destructive/70" : "bg-primary/70"
                          )}
                          style={{ width: `${required > 0 ? pct : 0}%` }}
                        />
                      </div>

                      {(topMissing.length > 0 || topExtra.length > 0) ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {topMissing.map((g) => (
                            <Badge
                              key={`m-${item.activityid}-${g.role}`}
                              variant="outline"
                              className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]"
                            >
                              -{g.missing} {roleKeyToLabel(g.role)}
                            </Badge>
                          ))}
                          {topExtra.map((g) => (
                            <Badge
                              key={`e-${item.activityid}-${g.role}`}
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]"
                            >
                              +{g.extra} {roleKeyToLabel(g.role)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-muted-foreground">No role-level gaps.</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
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
        <div className="grid grid-cols-[120px_1fr] gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
            <div key={row.label} className="grid grid-cols-[120px_1fr] items-center gap-2">
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
