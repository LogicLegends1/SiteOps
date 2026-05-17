"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ShieldCheck, ShieldAlert, Cpu } from "lucide-react"
import { type EquipmentItem } from "@/lib/equipment-data"

interface EquipmentRegistryPanelProps {
  equipment: EquipmentItem[]
}

export function EquipmentRegistryPanel({ equipment }: EquipmentRegistryPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = equipment.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.className.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card className="overflow-hidden border bg-card shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Asset Catalog</CardTitle>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mt-1">Operational Specifications & Deployment Tracking</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, serial, or class..." 
              className="pl-10 h-10 text-sm bg-background/50 border-2 border-muted hover:border-primary/50 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20 border-b-2">
              <TableHead className="text-xs font-black uppercase tracking-wider py-5 px-6">Equipment Unit</TableHead>
              <TableHead className="text-xs font-black uppercase tracking-wider py-5 px-6">Model / Specification</TableHead>
              <TableHead className="text-xs font-black uppercase tracking-wider py-5 px-6">Tech Specs</TableHead>
              <TableHead className="text-xs font-black uppercase tracking-wider py-5 px-6 text-center">Reliability</TableHead>
              <TableHead className="text-xs font-black uppercase tracking-wider py-5 px-6 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id} className="border-b hover:bg-muted/10 transition-colors">
                <TableCell className="py-6 px-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-base font-black tracking-tight">{item.name.replace(/#P\d+-/, "#")}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">{item.className}</span>
                       <span className="text-[10px] font-mono text-muted-foreground font-bold">S/N: {item.serialNumber}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-6 px-6">
                  <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-4 py-2 shadow-inner">
                    <span className="text-xs font-black uppercase text-foreground">{(item.technicalSpecs as any)?.model || "Standard"}</span>
                  </div>
                </TableCell>
                <TableCell className="py-6 px-6">
                  <div className="flex flex-wrap gap-2.5">
                    {Object.entries(item.technicalSpecs).filter(([k]) => k !== 'model').map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-muted-foreground/10">
                        <Cpu className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-xs font-black text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="py-6 px-6 text-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-2">
                      {item.reliabilityScore >= 80 ? (
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <ShieldAlert className="h-5 w-5 text-amber-500" />
                      )}
                      <span className={`text-lg font-black tracking-tighter ${item.reliabilityScore >= 80 ? "text-emerald-500" : "text-amber-500"}`}>
                        {item.reliabilityScore}%
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tight opacity-40">Stability</span>
                  </div>
                </TableCell>
                <TableCell className="py-6 px-6 text-center">
                   <Badge 
                    className={`text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md ${
                      item.status === 'active' ? "bg-emerald-500 text-white" :
                      item.status === 'idle' ? "bg-amber-500 text-white" :
                      item.status === 'down' || item.status === 'under_repair' || item.status === 'broken' ? "bg-red-600 text-white" :
                      item.status === 'maintenance' ? "bg-indigo-500 text-white" :
                      "bg-zinc-600 text-white"
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
