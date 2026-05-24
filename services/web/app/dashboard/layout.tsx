"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
  Settings,
  LogOut,
  HardHat
} from "lucide-react"
import { createClient } from "@/lib/superbase"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("User")

  useEffect(() => {
    let isMounted = true

    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user && isMounted) {
          const avatarUrl = user.user_metadata?.avatar_url
          const fullName = user.user_metadata?.full_name || "User"

          setUserAvatar(avatarUrl)
          setUserName(fullName)
        }
      } catch {
        if (isMounted) {
          setUserAvatar(null)
          setUserName("User")
        }
      }
    }

    fetchUser()

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // no-op: always return to login screen
    }

    router.push("/login")
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="border-sidebar-border flex flex-row items-center justify-between px-4 py-4">
          <Link href="/" aria-label="Go to home" className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <HardHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-base font-semibold text-foreground">SiteOps</span>
            </div>
          </Link>
          <SidebarTrigger className="-ml-2 hidden md:inline-flex" />
        </SidebarHeader>

        <SidebarContent className="overflow-hidden">
          <SidebarMenu className="h-full">
            <SidebarMenuItem className="h-full">
              <div className="relative h-full w-full overflow-hidden opacity-0 transition-opacity duration-500 group-data-[state=expanded]:animate-[fadeIn_0.5s_ease-in-out_forwards] group-data-[collapsible=icon]:opacity-0">
                <Image
                  src="/sidebar-menu-fill.png"
                  alt="Sidebar menu visual"
                  fill
                  priority
                  className="object-cover"
                  style={{
                    opacity: 1,
                    WebkitMaskImage:
                      "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.30) 25%, rgba(0, 0, 0, 0) 100%)",
                    maskImage:
                      "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.30) 25%, rgba(0, 0, 0, 0) 100%)",
                  }}
                  sizes="240px"
                />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-sidebar-border px-2 py-3">
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
        <header className="sticky top-0 z-10 flex min-h-16 items-center gap-3 border-b border-border bg-background/95 px-4 py-3 md:h-20 md:px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground md:text-2xl">
              Dashboard
            </h1>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-3 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
