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
  chartClassName?: string
  legendClassName?: string
  legendItemClassName?: string
  legendLabelClassName?: string
  compact?: boolean
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
  chartClassName = "",
  legendClassName = "",
  legendItemClassName = "",
  legendLabelClassName = "",
  compact = false,
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
  const chartSizeClassName = chartClassName || (compact ? "h-28 w-28" : "h-40 w-40")
  const legendLabelClassNames = legendLabelClassName || "truncate"

  return (
    <div className={`flex ${className} justify-center items-center gap-2`}>
      <div className={`relative mx-auto ${chartSizeClassName} min-w-1/6`}>
        <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90" aria-label={ariaLabel}>
          <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="4" className="text-zinc-700/40" />

          {visibleSegments.map((segment, index) => {
            const offset = visibleSegments.slice(0, index).reduce((sum, entry) => sum + entry.percentage, 0)

            return (
              <circle
                key={segment.key}
                cx="20"
                cy="20"
                r="12"
                fill="none"
                stroke="currentColor"
                strokeWidth={hoveredKey === segment.key ? (compact ? 4 : 5) : (compact ? 3 : 4)}
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
          <span className={`${compact ? "text-lg" : "text-2xl"} font-semibold tracking-tight text-foreground`}>
            {hoveredSegment ? hoveredSegment.value : chartTotal}
          </span>
          <span className={`${compact ? "text-[9px]" : "text-[10px]"} uppercase tracking-[0.2em] text-muted-foreground`}>
            {hoveredSegment ? hoveredSegment.label.substring(0, 10) : centerLabel.substring(0, 10)}
          </span>
          <span className={`${compact ? "text-[9px]" : "text-[10px]"} text-muted-foreground`}>
            {hoveredSegment ? `${hoveredSegment.percentage.toFixed(1)}%` : ""}
          </span>
        </div>
      </div>

      <div className={`flex-1 ${legendClassName}`}>
        {visibleSegments.map((segment) => (
          <button
            key={segment.key}
            type="button"
            className={`flex min-w-0 items-center gap-1.5 rounded-full border border-border/50 bg-muted/20 transition-colors hover:bg-muted/50 ${compact ? 'py-1 px-2' : ''} ${legendItemClassName}`}
            onMouseEnter={() => setHoveredKey(segment.key)}
            onMouseLeave={closeTooltip}
            onFocus={() => setHoveredKey(segment.key)}
            onBlur={closeTooltip}
          >
            <span className={`h-2 w-2 rounded-full bg-current ${segment.colorClass}`} />
            <span className={`${compact ? 'text-[12px]' : 'text-[13px]'} font-medium text-foreground ${legendLabelClassNames}`}>{segment.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
