"use client"

import { useState, useMemo, useEffect } from "react"
import { type Activity } from "@/lib/site-data"
import {
  issues as allIssues,
  type Issue,
  type IssuePriority,
  type IssueStatus,
} from "@/lib/issues-data"
import { cn } from "@/lib/utils"
import {
  Search,
  AlertTriangle,
  Wrench,
  Package,
  Users,
  ShieldAlert,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  Filter,
  X,
} from "lucide-react"

interface IssuesRisksTabProps {
  activities: Activity[]
}

const PRIORITY_CONFIG: Record<IssuePriority, { label: string; dot: string; bg: string; text: string; border: string }> = {
  critical: { label: "Critical", dot: "bg-red-500", bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/20" },
  high:     { label: "High",     dot: "bg-orange-500", bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/20" },
  medium:   { label: "Medium",   dot: "bg-amber-500", bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/20" },
  low:      { label: "Low",      dot: "bg-slate-400", bg: "bg-slate-400/15", text: "text-slate-400", border: "border-slate-400/20" },
}

const STATUS_CONFIG: Record<IssueStatus, { label: string; bg: string; text: string; border: string }> = {
  open:        { label: "Open",        bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/15" },
  "in-progress": { label: "In Progress", bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/15" },
  resolved:    { label: "Resolved",    bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/15" },
}

const TYPE_CONFIG: Record<Issue["type"], { label: string; icon: typeof AlertTriangle }> = {
  "equipment-failure": { label: "Equipment", icon: Wrench },
  "material-delay":    { label: "Material",  icon: Package },
  "labour-shortage":   { label: "Labour",    icon: Users },
  "safety-issue":      { label: "Safety",    icon: ShieldAlert },
  "other":             { label: "Other",     icon: HelpCircle },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function daysAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  return `${diff}d ago`
}

function IssueCard({ issue, activityName }: { issue: Issue; activityName: string }) {
  const [expanded, setExpanded] = useState(false)
  const priority = PRIORITY_CONFIG[issue.priority]
  const status = STATUS_CONFIG[issue.status]
  const typeInfo = TYPE_CONFIG[issue.type]
  const TypeIcon = typeInfo.icon

  return (
    <div
      className={cn(
        "group rounded-xl border transition-all duration-200 cursor-pointer",
        "bg-[rgba(15,23,42,0.5)] hover:bg-[rgba(15,23,42,0.7)]",
        issue.priority === "critical"
          ? "border-red-500/20 hover:border-red-500/35"
          : "border-white/[0.06] hover:border-white/[0.12]"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="px-4 py-3.5">
        {/* Top row: priority + type + status + date */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border", priority.bg, priority.text, priority.border)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", priority.dot)} />
              {priority.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white/40 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.05]">
              <TypeIcon className="h-3 w-3" />
              {typeInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md border", status.bg, status.text, status.border)}>
              {status.label}
            </span>
            {expanded ? <ChevronDown className="h-3.5 w-3.5 text-white/30" /> : <ChevronRight className="h-3.5 w-3.5 text-white/30" />}
          </div>
        </div>

        {/* Title + ID */}
        <div className="flex items-start gap-2 mb-1.5">
          <h4 className="text-[14px] font-semibold text-white leading-snug flex-1">{issue.title}</h4>
          <span className="text-[10px] font-mono text-white/25 shrink-0 mt-0.5">{issue.id}</span>
        </div>

        {/* Activity name */}
        <div className="text-[11px] text-white/40 mb-2">{activityName}</div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-[11px] text-white/35">
          <span className="inline-flex items-center gap-1">
            <User className="h-3 w-3" />
            {issue.owner}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {daysAgo(issue.createdAt)}
          </span>
        </div>

        {/* Expanded description */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <p className="text-[13px] leading-relaxed text-white/60">{issue.description}</p>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-white/30">
              <span>Reported: {formatDate(issue.createdAt)}</span>
              <span>Assigned to: {issue.owner}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function IssuesRisksTab({ activities }: IssuesRisksTabProps) {
  const [search, setSearch] = useState("")
  const [filterPriority, setFilterPriority] = useState<IssuePriority | "all">("all")
  const [filterStatus, setFilterStatus] = useState<IssueStatus | "all">("all")
  const [filterType, setFilterType] = useState<Issue["type"] | "all">("all")
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set())

  useEffect(() => {
    const styleId = "issues-risks-scrollbar-styles"
    if (document.getElementById(styleId)) return
    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      .ir-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
      .ir-scroll::-webkit-scrollbar-track { background: transparent; }
      .ir-scroll::-webkit-scrollbar-thumb { background: rgba(14,165,233,0.15); border-radius: 4px; }
      .ir-scroll::-webkit-scrollbar-thumb:hover { background: rgba(14,165,233,0.3); }
    `
    document.head.appendChild(style)
    return () => { document.getElementById(styleId)?.remove() }
  }, [])

  const filteredIssues = useMemo(() => {
    let filtered = allIssues
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.owner.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)
      )
    }
    if (filterPriority !== "all") filtered = filtered.filter((i) => i.priority === filterPriority)
    if (filterStatus !== "all") filtered = filtered.filter((i) => i.status === filterStatus)
    if (filterType !== "all") filtered = filtered.filter((i) => i.type === filterType)
    return filtered
  }, [search, filterPriority, filterStatus, filterType])

  const issuesByActivity = useMemo(() => {
    const map: Record<number, Issue[]> = {}
    for (const issue of filteredIssues) {
      if (!map[issue.activityID]) map[issue.activityID] = []
      map[issue.activityID].push(issue)
    }
    return map
  }, [filteredIssues])

  const activityMap = useMemo(() => {
    const map: Record<number, Activity> = {}
    for (const a of activities) map[a.zoneID] = a
    return map
  }, [activities])

  const sortedActivityIds = useMemo(() => {
    return Object.keys(issuesByActivity)
      .map(Number)
      .sort((a, b) => {
        const aMax = Math.max(...(issuesByActivity[a]?.map((i) => (i.priority === "critical" ? 4 : i.priority === "high" ? 3 : i.priority === "medium" ? 2 : 1)) ?? [0]))
        const bMax = Math.max(...(issuesByActivity[b]?.map((i) => (i.priority === "critical" ? 4 : i.priority === "high" ? 3 : i.priority === "medium" ? 2 : 1)) ?? [0]))
        return bMax - aMax
      })
  }, [issuesByActivity])

  useEffect(() => {
    setExpandedActivities(new Set(sortedActivityIds))
  }, [sortedActivityIds])

  const toggleActivity = (id: number) => {
    setExpandedActivities((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const counts = useMemo(() => {
    const open = allIssues.filter((i) => i.status === "open").length
    const inProgress = allIssues.filter((i) => i.status === "in-progress").length
    const resolved = allIssues.filter((i) => i.status === "resolved").length
    const critical = allIssues.filter((i) => i.priority === "critical" && i.status !== "resolved").length
    return { open, inProgress, resolved, critical, total: allIssues.length }
  }, [])

  const hasActiveFilters = filterPriority !== "all" || filterStatus !== "all" || filterType !== "all"

  return (
    <div className="h-[calc(100vh-220px)] min-h-[500px] flex flex-col rounded-xl border border-border overflow-hidden bg-[rgba(3,6,12,0.6)]">
      {/* Summary bar */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] bg-[rgba(15,23,42,0.4)] shrink-0">
        <div className="flex items-center gap-2 mr-auto">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span className="text-[14px] font-bold text-white">Issues & Risks</span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-white/45">{counts.total}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {counts.critical} Critical
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/15">
            {counts.open} Open
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/15">
            {counts.inProgress} In Progress
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
            {counts.resolved} Resolved
          </span>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-[rgba(15,23,42,0.25)] shrink-0 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[12px] text-white placeholder:text-white/30 outline-none focus:border-blue-500/40 focus:bg-white/[0.06] transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-white/30" />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as IssuePriority | "all")}
            className="text-[11px] bg-white/[0.04] border border-white/[0.08] text-white/70 rounded-lg px-2.5 py-2 outline-none focus:border-blue-500/40 cursor-pointer appearance-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as IssueStatus | "all")}
            className="text-[11px] bg-white/[0.04] border border-white/[0.08] text-white/70 rounded-lg px-2.5 py-2 outline-none focus:border-blue-500/40 cursor-pointer appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as Issue["type"] | "all")}
            className="text-[11px] bg-white/[0.04] border border-white/[0.08] text-white/70 rounded-lg px-2.5 py-2 outline-none focus:border-blue-500/40 cursor-pointer appearance-none"
          >
            <option value="all">All Types</option>
            <option value="equipment-failure">Equipment</option>
            <option value="material-delay">Material</option>
            <option value="labour-shortage">Labour</option>
            <option value="safety-issue">Safety</option>
            <option value="other">Other</option>
          </select>
          {hasActiveFilters && (
            <button
              onClick={() => { setFilterPriority("all"); setFilterStatus("all"); setFilterType("all") }}
              className="text-[10px] text-white/40 hover:text-white/70 transition-colors flex items-center gap-1 px-2 py-1.5"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Issues list grouped by activity */}
      <div className="flex-1 overflow-y-auto ir-scroll p-4">
        {sortedActivityIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/35 gap-3">
            <AlertTriangle className="h-12 w-12 opacity-15" />
            <p className="text-sm font-medium">No issues found</p>
            <p className="text-[11px] opacity-50">Try adjusting your filters</p>
          </div>
        ) : (
          sortedActivityIds.map((activityId) => {
            const activityIssues = issuesByActivity[activityId] ?? []
            const activity = activityMap[activityId]
            const activityName = activity?.name ?? `Activity ${activityId}`
            const isExpanded = expandedActivities.has(activityId)
            const criticalCount = activityIssues.filter((i) => i.priority === "critical" && i.status !== "resolved").length
            const openCount = activityIssues.filter((i) => i.status === "open").length

            return (
              <div key={activityId} className="mb-4">
                {/* Activity group header */}
                <button
                  onClick={() => toggleActivity(activityId)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[rgba(15,23,42,0.6)] border border-white/[0.06] hover:border-white/[0.12] transition-colors mb-2"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-white/40 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-white/40 shrink-0" />
                  )}
                  <span className="text-[13px] font-bold text-white flex-1 text-left">{activityName}</span>
                  <div className="flex items-center gap-2">
                    {criticalCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 border border-red-500/20">
                        {criticalCount} critical
                      </span>
                    )}
                    {openCount > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.05] text-white/45">
                        {openCount} open
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-white/30">
                      {activityIssues.length} issue{activityIssues.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </button>

                {/* Issues list */}
                {isExpanded && (
                  <div className="flex flex-col gap-2 pl-3">
                    {activityIssues
                      .sort((a, b) => {
                        const pOrder: Record<IssuePriority, number> = { critical: 0, high: 1, medium: 2, low: 3 }
                        const sOrder: Record<IssueStatus, number> = { open: 0, "in-progress": 1, resolved: 2 }
                        return pOrder[a.priority] - pOrder[b.priority] || sOrder[a.status] - sOrder[b.status]
                      })
                      .map((issue) => (
                        <IssueCard key={issue.id} issue={issue} activityName={activityName} />
                      ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
