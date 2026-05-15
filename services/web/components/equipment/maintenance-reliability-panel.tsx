"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wrench, History, AlertTriangle, CheckCircle2 } from "lucide-react"
import { type MaintenanceLog, type EquipmentItem } from "@/lib/equipment-data"

interface MaintenanceReliabilityPanelProps {
  equipment: EquipmentItem[]
  logs: MaintenanceLog[]
}

export function MaintenanceReliabilityPanel({ equipment, logs }: MaintenanceReliabilityPanelProps) {
  const upcomingService = equipment
    .filter(e => e.nextServiceDate)
    .sort((a, b) => new Date(a.nextServiceDate!).getTime() - new Date(b.nextServiceDate!).getTime())

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* MAINTENANCE FORECAST */}
      <Card className="lg:col-span-4 border-2 bg-card/60 shadow-xl">
        <CardHeader className="border-b bg-muted/30 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-black uppercase tracking-tight">Service Forecast</CardTitle>
              <CardDescription className="text-xs font-bold uppercase text-primary/70">Next 14 Days Window</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {upcomingService.slice(0, 5).map((item) => {
              const daysLeft = Math.ceil((new Date(item.nextServiceDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              return (
                <div key={item.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-black tracking-tight">{item.name}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.className}</span>
                  </div>
                  <div className="text-right flex flex-col gap-1">
                    <div className="text-xs font-bold tracking-tighter uppercase">{item.nextServiceDate}</div>
                    <Badge className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${daysLeft < 7 ? "bg-red-500" : "bg-emerald-500"}`}>
                      {daysLeft} Days
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* RELIABILITY HISTORY LOG */}
      <Card className="lg:col-span-8 border-2 bg-card/60 shadow-xl">
        <CardHeader className="border-b bg-muted/30 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <History className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-base font-black uppercase tracking-tight">Reliability & Breakdown Log</CardTitle>
              <CardDescription className="text-xs font-bold uppercase text-amber-500/70">Historical Performance Audit</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableHead className="text-xs font-black uppercase tracking-wider px-6 py-5">Event Type</TableHead>
                <TableHead className="text-xs font-black uppercase tracking-wider px-6 py-5">Asset Involved</TableHead>
                <TableHead className="text-xs font-black uppercase tracking-wider px-6 py-5">Description / Resolution</TableHead>
                <TableHead className="text-xs font-black uppercase tracking-wider px-6 py-5 text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const asset = equipment.find(e => e.id === log.itemId)
                return (
                  <TableRow key={log.id} className="hover:bg-muted/10 border-b">
                    <TableCell className="px-6 py-6">
                      <div className="flex items-center gap-2.5">
                        {log.issueType === 'breakdown' ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                        <span className={`text-[11px] font-black uppercase ${log.issueType === 'breakdown' ? "text-red-500" : "text-emerald-500"}`}>
                          {log.issueType.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6 font-black text-sm">
                      {asset?.name || "Unknown Asset"}
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="flex flex-col gap-2 max-w-[350px]">
                        <p className="text-sm font-medium leading-relaxed text-foreground">{log.description}</p>
                        {log.resolutionNotes && (
                           <div className="bg-background/60 p-3 rounded-xl border border-dashed border-muted">
                             <span className="text-[10px] font-black uppercase text-primary tracking-widest block mb-1">Resolution:</span>
                             <p className="text-xs text-muted-foreground">{log.resolutionNotes}</p>
                           </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-right">
                       <span className="text-xs font-mono font-bold text-muted-foreground">
                         {new Date(log.reportedAt).toLocaleDateString()}
                       </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
