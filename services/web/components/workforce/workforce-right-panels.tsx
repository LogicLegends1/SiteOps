"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
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
  phase: string
  location: string
  assignedTeam: string
  status: "balanced" | "under-cap" | "over-cap"
  discipline: { labelLines: string[]; segments: DonutSegment[] }
  role: { labelLines: string[]; segments: DonutSegment[] }
  experience: { labelLines: string[]; segments: DonutSegment[] }
  allocationCap: { cap: number; allocated: number }
}

const demoItems: ActivityDistributionItem[] = [
  {
    title: "Excavate Zone A Foundation",
    phase: "Earthworks",
    location: "Zone A",
    assignedTeam: "Groundworks Alpha",
    status: "under-cap",
    discipline: {
      labelLines: ["5 Civil", "3 Surveying", "2 Logistics", "2 Safety"],
      segments: [
        { value: 5, className: "text-blue-500" },
        { value: 3, className: "text-cyan-500" },
        { value: 2, className: "text-amber-500" },
        { value: 2, className: "text-rose-500" },
      ],
    },
    role: {
      labelLines: ["3 Excavator Operators", "3 Tipper Drivers", "2 Surveyors", "4 General Labors"],
      segments: [
        { value: 3, className: "text-violet-500" },
        { value: 3, className: "text-amber-500" },
        { value: 2, className: "text-cyan-500" },
        { value: 4, className: "text-slate-500" },
      ],
    },
    experience: {
      labelLines: ["4 Junior", "5 Mid-level", "3 Senior"],
      segments: [
        { value: 4, className: "text-slate-500" },
        { value: 5, className: "text-emerald-500" },
        { value: 3, className: "text-primary" },
      ],
    },
    allocationCap: { cap: 14, allocated: 12 },
  },
  {
    title: "Rebar Fixing for Pier Caps",
    phase: "Structural Works",
    location: "Pier Line B",
    assignedTeam: "Steel Crew Bravo",
    status: "balanced",
    discipline: {
      labelLines: ["6 Structural", "3 Steel", "2 Surveying", "1 Safety"],
      segments: [
        { value: 6, className: "text-indigo-500" },
        { value: 3, className: "text-zinc-500" },
        { value: 2, className: "text-cyan-500" },
        { value: 1, className: "text-rose-500" },
      ],
    },
    role: {
      labelLines: ["6 Steel Fixers", "2 Carpenters", "2 Site Engineers", "2 General Labors"],
      segments: [
        { value: 6, className: "text-zinc-500" },
        { value: 2, className: "text-orange-500" },
        { value: 2, className: "text-blue-500" },
        { value: 2, className: "text-slate-500" },
      ],
    },
    experience: {
      labelLines: ["2 Junior", "4 Mid-level", "4 Senior", "2 Expert"],
      segments: [
        { value: 2, className: "text-slate-500" },
        { value: 4, className: "text-emerald-500" },
        { value: 4, className: "text-primary" },
        { value: 2, className: "text-amber-500" },
      ],
    },
    allocationCap: { cap: 12, allocated: 12 },
  },
  {
    title: "Deck Formwork and Concrete Pour",
    phase: "Concrete Works",
    location: "Span C",
    assignedTeam: "Deck Crew Charlie",
    status: "over-cap",
    discipline: {
      labelLines: ["5 Concrete", "4 Structural", "2 Mechanical", "2 Safety"],
      segments: [
        { value: 5, className: "text-sky-500" },
        { value: 4, className: "text-indigo-500" },
        { value: 2, className: "text-amber-500" },
        { value: 2, className: "text-rose-500" },
      ],
    },
    role: {
      labelLines: ["4 Masons", "3 Carpenters", "2 Tower Crane Operators", "1 Crawler Crane Operator", "2 General Labors"],
      segments: [
        { value: 4, className: "text-sky-500" },
        { value: 3, className: "text-orange-500" },
        { value: 2, className: "text-fuchsia-500" },
        { value: 1, className: "text-violet-500" },
        { value: 2, className: "text-slate-500" },
      ],
    },
    experience: {
      labelLines: ["3 Junior", "4 Mid-level", "5 Senior"],
      segments: [
        { value: 3, className: "text-slate-500" },
        { value: 4, className: "text-emerald-500" },
        { value: 5, className: "text-primary" },
      ],
    },
    allocationCap: { cap: 11, allocated: 12 },
  },
  {
    title: "Electrical Conduit Installation",
    phase: "MEP Works",
    location: "Service Corridor D",
    assignedTeam: "MEP Delta",
    status: "under-cap",
    discipline: {
      labelLines: ["6 Electrical", "2 Civil", "1 Surveying", "1 Safety"],
      segments: [
        { value: 6, className: "text-emerald-500" },
        { value: 2, className: "text-blue-500" },
        { value: 1, className: "text-cyan-500" },
        { value: 1, className: "text-rose-500" },
      ],
    },
    role: {
      labelLines: ["5 Electricians", "2 Site Engineers", "2 General Labors", "1 Surveyor"],
      segments: [
        { value: 5, className: "text-emerald-500" },
        { value: 2, className: "text-blue-500" },
        { value: 2, className: "text-slate-500" },
        { value: 1, className: "text-cyan-500" },
      ],
    },
    experience: {
      labelLines: ["2 Junior", "5 Mid-level", "3 Senior"],
      segments: [
        { value: 2, className: "text-slate-500" },
        { value: 5, className: "text-emerald-500" },
        { value: 3, className: "text-primary" },
      ],
    },
    allocationCap: { cap: 12, allocated: 10 },
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

function statusBadgeClass(status: ActivityDistributionItem["status"]) {
  switch (status) {
    case "over-cap":
      return "bg-destructive/10 text-destructive border-destructive/20"
    case "under-cap":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20"
    case "balanced":
    default:
      return "bg-success/15 text-success border-success/20"
  }
}

function statusBadgeLabel(status: ActivityDistributionItem["status"]) {
  switch (status) {
    case "over-cap":
      return "Over cap"
    case "under-cap":
      return "Capacity available"
    case "balanced":
    default:
      return "Balanced"
  }
}

function ActivityDistributionCard({ item }: { item: ActivityDistributionItem }) {
  return (
    <Card className="h-full gap-0 border-border/60 bg-card/80 py-5">
      <CardHeader className="space-y-3 px-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-base font-black tracking-tight">{item.title}</CardTitle>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span>{item.phase}</span>
              <span className="text-border">/</span>
              <span>{item.location}</span>
            </div>
          </div>
          <Badge variant="outline" className={cn("shrink-0", statusBadgeClass(item.status))}>
            {statusBadgeLabel(item.status)}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {item.assignedTeam}
          </Badge>
          <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-border/60">
            {item.allocationCap.allocated} assigned / {item.allocationCap.cap} cap
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 px-5">
        <div className="flex flex-1 items-center justify-center rounded-xl border border-border/60 bg-background/70 p-4">
          <MiniDonut segments={item.role.segments} labelLines={item.role.labelLines} size={124} strokeWidth={13} />
        </div>

        <div className="rounded-xl border border-border/60 bg-background/70 p-3">
          <MiniAllocationCap cap={item.allocationCap.cap} allocated={item.allocationCap.allocated} />
        </div>
      </CardContent>
    </Card>
  )
}

export function ActivityWorkforceDistributionPanel() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black tracking-wide text-foreground">Activity Workforce Distribution</h3>
          <p className="mt-1 text-xs text-muted-foreground">{demoItems.length} planned activity allocations</p>
        </div>
      </div>

      <Carousel opts={{ align: "start" }} className="px-10">
        <CarouselContent>
          {demoItems.map((item) => (
            <CarouselItem key={item.title} className="md:basis-1/2 2xl:basis-1/3">
              <ActivityDistributionCard item={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 border-border/60 bg-card/90" />
        <CarouselNext className="right-0 border-border/60 bg-card/90" />
      </Carousel>
    </section>
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

export function WorkforceAllocationAlertsPanel({
  projectId,
  className,
}: {
  projectId: string
  className?: string
}) {
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
    <Card className={cn("border-border/60 bg-card/60 flex h-full flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-black tracking-wide">Allocation Gap Alerts</CardTitle>
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
      <CardContent className="flex-1 min-h-0">
        {items.length === 0 && !loading ? (
          <div className="rounded-xl border border-border/60 bg-muted/10 p-4 text-center">
            <div className="text-sm font-semibold text-foreground">No gap alerts</div>
            <div className="text-xs text-muted-foreground">No activities with teams were found for this project.</div>
          </div>
        ) : (
          <ScrollArea className="h-full pr-3">
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

type TimelineActivity = {
  activityid: number
  name: string | null
  description: string | null
  status: string | null
  createdat: string | null
  deadline: string | null
}

type TimelineRow = {
  key: number
  title: string
  status: string | null
  createdAt: Date
  deadline: Date
  durationDays: number
  className: string
}

type TimelineMonth = {
  key: string
  label: string
  year: string
  start: Date
  end: Date
}

type TimelineYearBand = {
  key: string
  label: string
  startIndex: number
  monthCount: number
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function startOfMonth(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), 1)
}

function addMonths(value: Date, count: number): Date {
  return new Date(value.getFullYear(), value.getMonth() + count, 1)
}

function formatMonthLabel(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(value)
}

function formatYearLabel(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
  }).format(value)
}

function getTimelineColorClass(status: string | null): string {
  const normalized = (status ?? "").toLowerCase()
  if (normalized.includes("complete")) return "bg-emerald-500/80"
  if (normalized.includes("progress") || normalized.includes("active")) return "bg-sky-500/80"
  if (normalized.includes("cancel")) return "bg-zinc-500/70"
  if (normalized.includes("delay") || normalized.includes("late")) return "bg-rose-500/80"
  return "bg-amber-500/80"
}

function buildTimelineRows(items: TimelineActivity[]): TimelineRow[] {
  const parsed = items
    .map((item) => {
      const createdAt = parseDate(item.createdat)
      const deadline = parseDate(item.deadline)

      if (!createdAt || !deadline) return null

      const durationDays = Math.max(1, Math.round((deadline.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)))

      return {
        key: item.activityid,
        title: item.name?.trim() || item.description?.trim() || `Activity ${item.activityid}`,
        status: item.status,
        createdAt,
        deadline,
        durationDays,
        className: getTimelineColorClass(item.status),
      }
    })
    .filter((row): row is TimelineRow => row !== null)

  if (parsed.length === 0) return []

  return parsed
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}

function buildTimelineCalendar(rows: TimelineRow[], monthWidth = 144) {
  if (rows.length === 0) {
    return null
  }

  const timelineStart = startOfMonth(new Date(Math.min(...rows.map((row) => row.createdAt.getTime()))))
  const timelineEnd = addMonths(
    startOfMonth(new Date(Math.max(...rows.map((row) => Math.max(row.deadline.getTime(), row.createdAt.getTime()))))),
    1
  )

  const monthCount = Math.max(
    1,
    (timelineEnd.getFullYear() - timelineStart.getFullYear()) * 12 + (timelineEnd.getMonth() - timelineStart.getMonth())
  )

  const months = Array.from({ length: monthCount }, (_, index) => {
    const start = addMonths(timelineStart, index)
    const end = addMonths(start, 1)

    return {
      key: `${start.getFullYear()}-${start.getMonth()}`,
      label: formatMonthLabel(start),
      year: formatYearLabel(start),
      start,
      end,
    } satisfies TimelineMonth
  })

  const yearBands: TimelineYearBand[] = []
  let monthIndex = 0

  while (monthIndex < months.length) {
    const currentYear = months[monthIndex].start.getFullYear()
    const yearStart = monthIndex

    while (monthIndex < months.length && months[monthIndex].start.getFullYear() === currentYear) {
      monthIndex += 1
    }

    yearBands.push({
      key: String(currentYear),
      label: String(currentYear),
      startIndex: yearStart,
      monthCount: monthIndex - yearStart,
    })
  }

  const contentWidth = monthCount * monthWidth
  const totalWindow = Math.max(1, timelineEnd.getTime() - timelineStart.getTime())

  return {
    timelineStart,
    timelineEnd,
    displayEnd: addMonths(timelineEnd, -1),
    monthWidth,
    monthCount,
    contentWidth,
    months,
    yearBands,
    getTimeToPx(value: Date) {
      return ((value.getTime() - timelineStart.getTime()) / totalWindow) * contentWidth
    },
  }
}

function TimelineCard({
  projectId,
  compact = false,
  className,
}: {
  projectId: string
  compact?: boolean
  className?: string
}) {
  const [items, setItems] = useState<TimelineActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) return

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetch(`/api/project/${projectId}/activities`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((json) => {
        setItems(Array.isArray(json?.activities) ? json.activities : [])
      })
      .catch((fetchError: any) => {
        if (fetchError?.name === "AbortError") return
        setError(fetchError?.message ?? "Failed to load activity timeline")
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [projectId])

  const rows = useMemo(() => buildTimelineRows(items), [items])

  const monthWidth = compact ? 108 : 144
  const timelineBounds = useMemo(() => buildTimelineCalendar(rows, monthWidth), [rows, monthWidth])

  return (
    <Card className={cn("border-border/60 bg-card/60 flex h-full flex-col", className)}>
      <CardHeader className={compact ? "space-y-2 pb-2" : "space-y-3 pb-3"}>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className={compact ? "text-xs font-black tracking-wide" : "text-sm font-black tracking-wide"}>
            Workforce Allocation Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            {loading ? (
              <Badge variant="outline" className={compact ? "bg-muted/30 text-muted-foreground text-[10px]" : "bg-muted/30 text-muted-foreground"}>
                Loading…
              </Badge>
            ) : null}
            {error ? (
              <Badge variant="outline" className={compact ? "bg-destructive/10 text-destructive border-destructive/20 text-[10px]" : "bg-destructive/10 text-destructive border-destructive/20"}>
                {error}
              </Badge>
            ) : null}
          </div>
        </div>

        {!error && timelineBounds ? (
          <div className={compact ? "flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground" : "flex flex-wrap items-center gap-2 text-xs text-muted-foreground"}>
            <Badge variant="outline" className={compact ? "bg-muted/10 text-muted-foreground border-border/60 text-[10px]" : "bg-muted/10 text-muted-foreground border-border/60"}>
              {rows.length} activities
            </Badge>
            <Badge variant="outline" className={compact ? "bg-muted/10 text-muted-foreground border-border/60 text-[10px]" : "bg-muted/10 text-muted-foreground border-border/60"}>
              {timelineBounds.monthCount} month window
            </Badge>
            <span>
              {formatMonthLabel(timelineBounds.timelineStart)} {formatYearLabel(timelineBounds.timelineStart)} - {formatMonthLabel(timelineBounds.displayEnd)} {formatYearLabel(timelineBounds.displayEnd)}
            </span>
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="flex-1 min-h-0">
        {rows.length === 0 && !loading ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-8 text-center">
            <div className="text-sm font-semibold text-foreground">No timeline data</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Activities for this project need both a created date and a deadline to render the timeline.
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full pr-2">
            <div className={compact ? "space-y-2" : "space-y-3"}>
              {timelineBounds ? (
                <div className="overflow-x-auto pb-2">
                  <div style={{ minWidth: `${180 + timelineBounds.contentWidth}px` }}>
                    <div
                      className={cn(
                        "grid items-end px-1 pb-2 font-black uppercase tracking-widest text-muted-foreground",
                        compact ? "gap-2 text-[9px]" : "gap-3 text-[10px]"
                      )}
                      style={{ gridTemplateColumns: `180px ${timelineBounds.contentWidth}px` }}
                    >
                      <div>Activities</div>
                      <div className="grid" style={{ gridTemplateColumns: `repeat(${timelineBounds.monthCount}, ${timelineBounds.monthWidth}px)` }}>
                        {timelineBounds.yearBands.map((band) => (
                          <div
                            key={band.key}
                            className={cn(
                              "col-start-1 row-start-1 flex items-center justify-center text-muted-foreground",
                              compact ? "text-[9px] tracking-[0.25em]" : "text-[10px] tracking-[0.3em]"
                            )}
                            style={{ gridColumn: `${band.startIndex + 1} / span ${band.monthCount}` }}
                          >
                            <span className={cn("rounded-full border border-border/60 bg-background/80 shadow-sm", compact ? "px-2.5 py-0.5" : "px-3 py-1") }>
                              {band.label}
                            </span>
                          </div>
                        ))}

                        {timelineBounds.months.map((month, index) => (
                          <div
                            key={month.key}
                            className="col-start-1 row-start-2 flex flex-col items-center justify-end"
                            style={{ gridColumn: index + 1 }}
                          >
                            <div className={compact ? "mb-1.5 h-2 w-px bg-border/70" : "mb-2 h-2 w-px bg-border/70"} />
                            <span className={cn(
                              "whitespace-nowrap rounded-full border border-border/60 bg-background/80 font-bold normal-case tracking-normal text-muted-foreground shadow-sm",
                              compact ? "px-2 py-0.5 text-[8px]" : "px-2.5 py-1 text-[9px]"
                            )}>
                              {month.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {rows.map((row) => (
                <div
                  key={row.key}
                  className={cn(
                    "grid items-center rounded-xl border border-border/60 bg-muted/10",
                    compact ? "gap-2 p-2.5" : "gap-3 p-3"
                  )}
                  style={{ gridTemplateColumns: `180px ${timelineBounds?.contentWidth ?? 0}px` }}
                >
                  <div className="min-w-0">
                    <div className={compact ? "truncate text-xs font-semibold text-foreground" : "truncate text-sm font-semibold text-foreground"}>{row.title}</div>
                  </div>

                  <div className={compact ? "relative h-7 rounded-full border border-border/60 bg-background/70" : "relative h-8 rounded-full border border-border/60 bg-background/70"}>
                    {timelineBounds?.months.map((month) => (
                      <div
                        key={`${row.key}-${month.key}`}
                        className="pointer-events-none absolute inset-y-0 w-px bg-border/40"
                        style={{ left: `${timelineBounds.getTimeToPx(month.start)}px` }}
                      />
                    ))}

                    <div
                      className={cn("absolute top-1/2 h-3 -translate-y-1/2 rounded-full shadow-sm", row.className)}
                      style={{
                        left: `${Math.max(0, timelineBounds.getTimeToPx(row.createdAt))}px`,
                        width: `${Math.max(24, timelineBounds.getTimeToPx(row.deadline) - timelineBounds.getTimeToPx(row.createdAt))}px`,
                      }}
                    />
                    <div
                      className={cn("absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-background shadow-sm", row.className)}
                      style={{ left: `${Math.max(0, timelineBounds.getTimeToPx(row.createdAt))}px` }}
                    />
                    <div
                      className={cn("absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-background shadow-sm", row.className)}
                      style={{ left: `${Math.max(0, timelineBounds.getTimeToPx(row.deadline))}px` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

export function WorkforceAllocationTimelinePanel({
  projectId,
  compact = false,
  className,
}: {
  projectId: string
  compact?: boolean
  className?: string
}) {
  return <TimelineCard projectId={projectId} compact={compact} className={className} />
}
