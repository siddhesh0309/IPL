"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  BarChart3,
  BirdIcon as Cricket,
  CalendarDays,
  HelpCircle,
  History,
  Home,
  LogOut,
  Menu,
  Settings,
  Table,
  Trophy,
  User,
  Users,
} from "lucide-react"

interface DashboardSidebarProps {
  isAdmin?: boolean
}

export function DashboardSidebar({ isAdmin = false }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Close mobile sidebar when path changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  if (!user) return null

  const userRoutes = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/polls", label: "Active Polls", icon: CalendarDays },
    { href: "/schedule", label: "Schedule", icon: CalendarDays },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/standings", label: "Standings", icon: Table },
    { href: "/history", label: "My Predictions", icon: History },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ]

  const adminRoutes = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/polls", label: "Manage Polls", icon: CalendarDays },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/statistics", label: "Statistics", icon: BarChart3 },
  ]

  const routes = isAdmin ? adminRoutes : userRoutes

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 sidebar-mobile-fix w-[85%] sm:w-[350px]">
            <div className="flex h-full flex-col">
              <div className="border-b p-4">
                <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2">
                  <Cricket className="h-6 w-6" />
                  <span className="font-bold text-lg">IPL Prediction Portal</span>
                </Link>
              </div>
              <ScrollArea className="flex-1 p-4">
                <nav className="flex flex-col gap-2">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === route.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      <route.icon className="h-4 w-4" />
                      {route.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-6 space-y-2">
                  <div className="text-xs font-medium uppercase text-muted-foreground">Account</div>
                  <nav className="flex flex-col gap-2">
                    <Link
                      href="/profile"
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === "/profile" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === "/settings" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <Link
                      href="/help"
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === "/help" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      <HelpCircle className="h-4 w-4" />
                      Help
                    </Link>
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start gap-3 px-3 py-2 h-auto font-normal"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </nav>
                </div>
              </ScrollArea>
              <div className="border-t p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarProvider>
          <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-4 py-2">
                <Cricket className="h-6 w-6" />
                <span className="font-bold text-lg">IPL Prediction</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {routes.map((route) => (
                      <SidebarMenuItem key={route.href}>
                        <SidebarMenuButton asChild isActive={pathname === route.href} tooltip={route.label}>
                          <Link href={route.href}>
                            <route.icon className="h-4 w-4" />
                            <span>{route.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Account</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === "/profile"} tooltip="Profile">
                        <Link href="/profile">
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === "/settings"} tooltip="Settings">
                        <Link href="/settings">
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === "/help"} tooltip="Help">
                        <Link href="/help">
                          <HelpCircle className="h-4 w-4" />
                          <span>Help</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Logout" onClick={logout}>
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <div className="flex items-center gap-3 px-4 py-2">
                <Avatar>
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      </div>
    </>
  )
}

