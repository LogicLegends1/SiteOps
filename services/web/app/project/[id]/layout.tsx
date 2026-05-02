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
import {
  MapPin,
  AlertTriangle,
  Package,
  Users,
  Settings,
  LogOut,
  ArrowLeft,
  Wrench,
  ChartNoAxesGantt
} from "lucide-react"
import { createClient } from "@/lib/superbase"

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
    title: "Predictive Delay Engine",
    segment: "delay-engine",
    icon: AlertTriangle,
  },
  {
    title: "Material Forecasting",
    segment: "material-forecast",
    icon: Package,
  },
  {
    title: "Workforce Allocation",
    segment: "workforce",
    icon: Users,
  },
  {
    title: "Equipment Allocation",
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
  const [userName, setUserName] = useState<string>("User")

  const getProjectHref = (segment: string) =>
    segment ? `/project/${projectId}/${segment}` : `/project/${projectId}`

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Get avatar from user metadata
        const avatarUrl = user.user_metadata?.avatar_url
        const fullName = user.user_metadata?.full_name || "User"
        
        setUserAvatar(avatarUrl)
        setUserName(fullName)
      }
    }
    
    fetchUser()
  }, [])

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
              {navItems.map((item) => (
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
              ))}
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
              <AvatarImage src={userAvatar || "/placeholder.svg?height=32&width=32"} alt={userName} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium text-foreground">{userName}</span>
              <span className="text-xs text-muted-foreground">Project Alpha</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              {navItems.find((item) => pathname === getProjectHref(item.segment))?.title || "Project Dashboard"}
            </h1>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
