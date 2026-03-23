"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, AlertTriangle, Briefcase, HardHat } from "lucide-react"
import { getWorkforceSummary } from "@/lib/workforce-data"

export function WorkforceStats() {
  const summary = getWorkforceSummary()

  const stats = [
    {
      title: "Total Workers",
      value: summary.total,
      icon: Users,
      description: "Registered workforce",
      color: "text-primary",
    },
    {
      title: "Assigned",
      value: summary.assigned,
      icon: UserCheck,
      description: "Currently on tasks",
      color: "text-success",
    },
    {
      title: "Idle",
      value: summary.idle,
      icon: Briefcase,
      description: "Available for assignment",
      color: "text-amber-500",
    },
    {
      title: "Unavailable",
      value: summary.unavailable,
      icon: UserX,
      description: "On leave / absent",
      color: "text-muted-foreground",
    },
    {
      title: "Teams",
      value: 3,
      icon: HardHat,
      description: "Active teams",
      color: "text-primary",
    },
    {
      title: "Workforce Gap",
      value: summary.totalGap,
      icon: AlertTriangle,
      description: "Positions to fill",
      color: "text-destructive",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
