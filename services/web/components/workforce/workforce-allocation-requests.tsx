"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, ClipboardList, Clock3, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  type WorkerAllocationRequest,
  type WorkerAllocationRequestResponse,
} from "@/lib/workforce-live"
import { cn } from "@/lib/utils"

function formatActivityTitle(request: WorkerAllocationRequest) {
  return request.activityName || request.activityDescription || `Activity ${request.activityId}`
}

export function WorkforceAllocationRequestsPanel({
  projectId,
  className,
}: {
  projectId: string
  className?: string
}) {
  const [requests, setRequests] = useState<WorkerAllocationRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) return

    const controller = new AbortController()

    setLoading(true)
    setError(null)

    fetch(`/api/project/${projectId}/workforce/allocation-requests`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return response.json() as Promise<WorkerAllocationRequestResponse>
      })
      .then((json) => {
        setRequests(Array.isArray(json?.requests) ? json.requests : [])
      })
      .catch((fetchError: any) => {
        if (fetchError?.name === "AbortError") return
        setError(fetchError?.message ?? "Failed to load allocation requests")
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [projectId])

  const summary = useMemo(() => {
    const activities = new Set(requests.map((request) => request.activityId))
    const totalRequested = requests.reduce((sum, request) => sum + request.totalRequested, 0)

    return {
      pendingRequests: requests.length,
      activities: activities.size,
      totalRequested,
    }
  }, [requests])

  return (
    <Card className={cn("border-border/60 bg-card/60 flex h-full flex-col", className)}>
      <CardHeader className="shrink-0 space-y-2 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-black tracking-wide">
              Pending Worker Allocation Requests
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Requests with unallocated worker demand grouped by activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {loading ? (
              <Badge variant="outline" className="bg-muted/30 text-muted-foreground">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Loading…
              </Badge>
            ) : null}
            {error ? (
              <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive">
                <AlertCircle className="mr-1 h-3 w-3" />
                {error}
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 pt-0">
        <ScrollArea className="h-full pr-2">
          <div className="space-y-3 pb-1">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-muted/10 p-2.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Pending Requests
                </div>
                <div className="mt-1 text-xl font-bold tracking-tight text-foreground">{summary.pendingRequests}</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/10 p-2.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Activities Affected
                </div>
                <div className="mt-1 text-xl font-bold tracking-tight text-foreground">{summary.activities}</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/10 p-2.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Total Workers Requested
                </div>
                <div className="mt-1 text-xl font-bold tracking-tight text-foreground">{summary.totalRequested}</div>
              </div>
            </div>

            {!loading && !error ? (
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                {summary.pendingRequests} requests • {summary.activities} activities
              </Badge>
            ) : null}

            {requests.length === 0 && !loading ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/40 text-muted-foreground">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div className="mt-3 text-sm font-semibold text-foreground">No pending allocation requests</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Unallocated worker requests for this project will appear here.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="rounded-lg border border-border/60 bg-muted/10 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-semibold text-foreground">{formatActivityTitle(request)}</h4>
                          {request.activityStatus ? (
                            <Badge variant="outline" className="border-border/60 bg-background/70 text-[10px] uppercase tracking-wider text-muted-foreground">
                              {request.activityStatus}
                            </Badge>
                          ) : null}
                          <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-600 text-[10px] uppercase tracking-wider">
                            <Clock3 className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Activity ID: {request.activityId} • Request ID: {request.id}</p>
                      </div>

                      <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                        {request.totalRequested} worker{request.totalRequested === 1 ? "" : "s"}
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {request.roles.map((role) => (
                        <Badge key={role.key} variant="outline" className="border-border/60 bg-background/70 text-foreground">
                          {role.label}: {role.count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}