"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  AlertTriangle,
  Package,
  Users,
  Settings,
  LogOut,
  ArrowLeft,
  Wrench,
  ChartNoAxesGantt,
  Bell
} from "lucide-react"
import { createClient } from "@/lib/superbase"
import { ProjectContext, type Project } from "@/app/contexts/project-context"

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

const navItems = [
  {
    title: "Project Overview",
    segment: "",
    icon: ChartNoAxesGantt,
  },
  {
    title: "Site Progress Tracking",
    segment: "site-progress",
    icon: MapPin,
  },

  {
    title: "Materials",
    segment: "material-forecast",
    icon: Package,
  },
  {
    title: "Labor & Crew Management",
    segment: "workforce",
    icon: Users,
  },
  {
    title: "Machinery & Assets",
    segment: "equipment",
    icon: Wrench,
  },
]



export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams<{ id?: string }>()
  const pathname = usePathname()
  const router = useRouter()
  const projectId = params.id ?? "1"
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userRoleLoaded, setUserRoleLoaded] = useState(false)
  const [project, setProject] = useState<Project | null>(null)

  const formatRoleLabel = (role: string | null) => {
    switch (role) {
      case "OPERATION_MANAGER":
        return "Project Manager"
      case "PROJECT_MANAGER":
        return "Project Manager"
      case "SITE_ENGINEER":
        return "Site Engineer"
      default:
        return role
    }
  }

  const getProjectHref = (segment: string) =>
    segment ? `/project/${projectId}/${segment}` : `/project/${projectId}`

  const visibleNavItems = !userRoleLoaded
    ? []
    : userRole === "SITE_ENGINEER"
      ? []
      : navItems

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: dbUser } = await supabase
          .from("user")
          .select("username, role, avatarimage")
          .eq("email", user.email)
          .maybeSingle()

        const avatarUrl = dbUser?.avatarimage || user.user_metadata?.avatar_url || null
        const fullName = dbUser?.username || user.user_metadata?.full_name || ""
        
        setUserAvatar(avatarUrl)
        setUserName(fullName)

        setUserRole(dbUser?.role ?? null)
      }

      setUserRoleLoaded(true)
    }
    
    fetchUser()
  }, [])

  useEffect(() => {
    if (!userRoleLoaded || userRole !== "SITE_ENGINEER") return

    const pathnameSegment = pathname.replace(`/project/${projectId}`, "")
    const isAllowedRoute = pathnameSegment === "" || pathnameSegment === "/site-progress"

    if (!isAllowedRoute) {
      router.replace(`/project/${projectId}`)
    }
  }, [pathname, projectId, router, userRole, userRoleLoaded])

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/project/${projectId}`)
        if (response.ok) {
          const projectData: {project: Project} = await response.json()
          setProject(projectData.project)
        } else {
          // Navigate back to dashboard if project not found or error occurs
          router.push("/dashboard")
        }
      } catch (error) {
        // Navigate back to dashboard if an error occurs
        router.push("/dashboard")
      }
    }

    fetchProject()
  }, [projectId])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="border-sidebar-border flex flex-row items-center justify-between px-4 py-4">
          <Link href="/dashboard" aria-label="Go to dashboard" className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span className="text-base font-semibold text-foreground">Dashboard</span>
          </Link>
          <SidebarTrigger className="-ml-2 hidden md:inline-flex" />
        </SidebarHeader>

        <SidebarContent className="overflow-hidden">
          <div className="flex h-full flex-col">
            <SidebarMenu>
              {visibleNavItems.length > 0 ? visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.segment || "overview"}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === getProjectHref(item.segment)}
                    tooltip={item.title}
                  >
                    <Link href={getProjectHref(item.segment)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )) : !userRoleLoaded ? (
                <SidebarMenuItem>
                  <div className="px-2 py-3 text-xs text-muted-foreground">Loading navigation…</div>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
            <div className="mt-3 hidden flex-1 bg-linear-to-b from-transparent from-75% to-primary/30 opacity-5 group-data-[state=expanded]:block group-data-[state=expanded]:animate-[fadeIn_0.5s_ease-in-out_forwards]" />
          </div>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border px-2 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <Separator className="my-2" />
          <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userAvatar || "/placeholder.svg?height=32&width=32"} alt={userName || "User avatar"} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">{userName ? userName.substring(0, 2).toUpperCase() : "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium text-foreground">{userName || ""}</span>
              <span className="text-xs text-muted-foreground">{formatRoleLabel(userRole)}</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex min-h-14 items-center gap-3 border-b border-border bg-background/95 px-4 py-3 md:h-14 md:px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground sm:text-lg">
              {visibleNavItems.find((item) => pathname === getProjectHref(item.segment))?.title || "Project Dashboard"}
            </h1>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-full border border-border/40 bg-background/50 hover:bg-accent hover:text-accent-foreground"
                aria-label="Open notifications"
              >
                <Bell className="h-4 w-4 text-foreground" />
                {activeIssues.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-warning text-[9px] font-semibold text-warning-foreground ring-2 ring-background">
                    {activeIssues.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={10} className="w-80 sm:w-96 p-0 shadow-xl border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-warning" />
                    <p className="text-sm font-semibold text-foreground">Notifications</p>
                  </div>
                  <Badge variant="outline" className="border-warning/30 text-warning">
                    {activeIssues.length} open
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Expanded details for the latest site alerts and issues</p>
              </div>
              <div className="max-h-112 overflow-y-auto p-3">
                <div className="space-y-3">
                  {activeIssues.map((issue) => (
                    <div key={`notification-${issue.id}`} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-foreground">{issue.title}</p>
                            <Badge className={getPriorityColor(issue.priority)} variant="secondary">
                              {issue.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Owner: {issue.owner}</p>
                          <p className="text-xs text-muted-foreground">Notification ID: {issue.id}</p>
                          <p className="text-sm leading-6 text-foreground">
                            {issue.status === "open"
                              ? "This alert is active and needs review."
                              : "This alert has been updated and is ready for follow-up."}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {issue.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-lg border border-border bg-muted/20 p-2">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Priority</p>
                          <p className="mt-1 text-xs font-medium text-foreground capitalize">{issue.priority}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/20 p-2">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Status</p>
                          <p className="mt-1 text-xs font-medium text-foreground capitalize">{issue.status}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/20 p-2">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Source</p>
                          <p className="mt-1 text-xs font-medium text-foreground">Site Alerts</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-3 md:p-6">
          <ProjectContext.Provider value={{ project, userName, userRole }}>
            {children}
          </ProjectContext.Provider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
