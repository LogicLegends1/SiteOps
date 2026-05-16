"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Construction, Calendar } from "lucide-react"
import { type EquipmentItem } from "@/lib/equipment-data"

interface AllocationManagerPanelProps {
  equipment: EquipmentItem[]
}

export function AllocationManagerPanel({ equipment }: AllocationManagerPanelProps) {
  const activeDeployments = equipment.filter(e => e.activeActivityId)

  return (
    <Card className="overflow-hidden border bg-card shadow-sm">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div>
          <CardTitle className="text-xl font-black uppercase tracking-tighter">Site Deployments</CardTitle>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Activity-Linked Asset Distribution</p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/20 hover:bg-muted/20">
              <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Asset</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Site Zone</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Linked Activity</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-right">Deployment Window</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeDeployments.length > 0 ? (
              activeDeployments.map((item) => (
                <TableRow key={item.id} className="border-b hover:bg-muted/5 transition-colors">
                  <TableCell className="py-5 font-black text-sm tracking-tight">
                    {item.name}
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-primary/10">
                        <MapPin className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-tight">{item.activeZoneId || "Zone ID Pending"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-2">
                      <Construction className="h-3.5 w-3.5 text-muted-foreground" />
                      <Badge variant="outline" className="font-mono text-[10px] border-primary/20 bg-primary/5 text-primary font-bold">
                        {item.activeActivityId}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 text-right">
                    <div className="flex items-center justify-end gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span className="text-[10px] font-black tracking-tighter uppercase">Shift-Active</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-50">
                    <Construction className="h-8 w-8" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Active Deployments Logged</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
