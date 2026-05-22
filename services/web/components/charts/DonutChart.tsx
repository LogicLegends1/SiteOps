"use client"

import { useMemo, useState } from "react"

export type DonutChartSegment = {
  key: string
  label: string
  value: number
  colorClass: string
}

export type DonutChartProps = {
  segments: DonutChartSegment[]
  total?: number
  centerLabel?: string
  ariaLabel?: string
  className?: string
}

type ResolvedSegment = DonutChartSegment & {
  percentage: number
}

export default function DonutChart({
  segments,
  total,
  centerLabel = "Total",
  ariaLabel = "Donut chart",
  className = "",
}: DonutChartProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  const chartTotal = total ?? segments.reduce((sum, segment) => sum + segment.value, 0)

  const visibleSegments = useMemo<ResolvedSegment[]>(() => {
    if (chartTotal <= 0) return []

    return segments
      .filter((segment) => segment.value > 0)
      .map((segment) => ({
        ...segment,
        percentage: (segment.value / chartTotal) * 100,
      }))
  }, [chartTotal, segments])

  const hoveredSegment = visibleSegments.find((segment) => segment.key === hoveredKey) ?? null

  const closeTooltip = () => setHoveredKey(null)

  return (
    <div className={`grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center ${className}`}>
      <div className="relative mx-auto h-56 w-56">
        <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90" aria-label={ariaLabel}>
          <circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" strokeWidth="4" className="text-zinc-700/40" />

          {visibleSegments.map((segment, index) => {
            const offset = visibleSegments.slice(0, index).reduce((sum, entry) => sum + entry.percentage, 0)

            return (
              <circle
                key={segment.key}
                cx="20"
                cy="20"
                r="13"
                fill="none"
                stroke="currentColor"
                strokeWidth={hoveredKey === segment.key ? 5 : 4}
                strokeLinecap="butt"
                strokeDasharray={`${segment.percentage} ${100 - segment.percentage}`}
                strokeDashoffset={-offset}
                pathLength={100}
                className={`transition-[stroke-width,opacity] duration-200 ${segment.colorClass}`}
                opacity={hoveredKey && hoveredKey !== segment.key ? 0.45 : 1}
                onMouseEnter={() => setHoveredKey(segment.key)}
                onMouseLeave={closeTooltip}
              />
            )
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-semibold tracking-tight text-foreground">
            {hoveredSegment ? hoveredSegment.value : chartTotal}
          </span>
          <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            {hoveredSegment ? hoveredSegment.label : centerLabel}
          </span>
          <span className="mt-1 text-[11px] text-muted-foreground">
            {hoveredSegment ? `${hoveredSegment.percentage.toFixed(1)}%` : ""}
          </span>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 p-2">
        {visibleSegments.map((segment) => (
          <button
            key={segment.key}
            type="button"
            className="donut-chart-legend-item"
            onMouseEnter={() => setHoveredKey(segment.key)}
            onMouseLeave={closeTooltip}
            onFocus={() => setHoveredKey(segment.key)}
            onBlur={closeTooltip}
          >
            <span className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full bg-current ${segment.colorClass}`} />
              <span className="text-sm font-medium text-foreground">{segment.label}</span>
            </span>
            <span className="text-xs text-muted-foreground">
              {segment.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}