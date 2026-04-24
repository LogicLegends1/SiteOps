"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  AlertTriangle,
  Package,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { SriLankaSitesMap } from "@/components/dashboard/sri-lanka-sites-map"

const projectStats = [
  {
    title: "Site Progress",
    value: "68%",
    description: "Overall completion",
    icon: MapPin,
    trend: "+5% this week",
    href: "/site-progress",
  },
  {
    title: "Delay Risks",
    value: "3",
    description: "Activities at risk",
    icon: AlertTriangle,
    trend: "2 new alerts",
    href: "/delay-engine",
  },
  {
    title: "Material Status",
    value: "2",
    description: "Low stock items",
    icon: Package,
    trend: "Cement, Steel",
    href: "/material-forecast",
  },
  {
    title: "Workforce",
    value: "45",
    description: "Active workers",
    icon: Users,
    trend: "5 idle today",
    href: "/workforce",
  },
]

const recentActivities = [
  {
    zone: "Zone A",
    activity: "Foundation Work",
    status: "in-progress",
    progress: 75,
    team: "Team Alpha",
  },
  {
    zone: "Zone B",
    activity: "Piling Section",
    status: "delayed",
    progress: 40,
    team: "Team Beta",
  },
  {
    zone: "Zone C",
    activity: "Electrical Installation",
    status: "completed",
    progress: 100,
    team: "Team Gamma",
  },
  {
    zone: "Zone D",
    activity: "Drainage Setup",
    status: "not-started",
    progress: 0,
    team: "Unassigned",
  },
]

const activeIssues = [
  {
    id: "ISS-001",
    title: "Material Delay - Steel Rebar",
    priority: "high",
    status: "open",
    owner: "Procurement Team",
  },
  {
    id: "ISS-002",
    title: "Equipment Failure - Crane #2",
    priority: "critical",
    status: "in-progress",
    owner: "Maintenance",
  },
  {
    id: "ISS-003",
    title: "Labour Shortage - Zone B",
    priority: "medium",
    status: "open",
    owner: "HR Department",
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-success text-success-foreground"
    case "in-progress":
      return "bg-primary text-primary-foreground"
    case "delayed":
      return "bg-destructive text-destructive-foreground"
    case "not-started":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "critical":
      return "bg-destructive text-destructive-foreground"
    case "high":
      return "bg-warning text-warning-foreground"
    case "medium":
      return "bg-primary text-primary-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export default function DashboardPage() {
  const params = useParams<{ id?: string }>()
  const projectId = params.id ?? "1"

  const getProjectHref = (segment: string) =>
    segment ? `/project/${projectId}/${segment}` : `/project/${projectId}`

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Header with Logo Placeholder */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo Placeholder */}
          <div className="h-16 w-16 rounded-lg bg-linear-to-br from-primary to-primary/60 flex items-center justify-center border border-border shadow-lg">
            <span className="text-primary-foreground font-bold text-xl">AE</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Access Engineering PLC</h1>
            <p className="text-muted-foreground">Construction Site Operations System</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Current Project</p>
          <p className="text-lg font-semibold text-foreground">Colombo Metro Tower</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {projectStats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="bg-card border-border transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                <p className="text-xs text-primary mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Recent Activities</CardTitle>
              <CardDescription>Latest updates from site zones</CardDescription>
            </div>
            <Link href={getProjectHref("site-progress")}>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                View All
              </Badge>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.zone}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {activity.zone}
                      </span>
                      <Badge className={getStatusColor(activity.status)} variant="secondary">
                        {activity.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.activity}</span>
                    <span className="text-xs text-muted-foreground">{activity.team}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 w-24">
                    <span className="text-sm font-medium text-foreground">{activity.progress}%</span>
                    <Progress value={activity.progress} className="h-2 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Issues */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Active Issues</CardTitle>
              <CardDescription>Current blockers and problems</CardDescription>
            </div>
            <Link href={getProjectHref("site-progress")}>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                View All
              </Badge>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {activeIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{issue.id}</span>
                      <Badge className={getPriorityColor(issue.priority)} variant="secondary">
                        {issue.priority}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium text-foreground">{issue.title}</span>
                    <span className="text-xs text-muted-foreground">Owner: {issue.owner}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {issue.status === "open" ? (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    ) : (
                      <Clock className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
