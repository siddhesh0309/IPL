"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BirdIcon as Cricket, HelpCircle, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { NotificationsPopover } from "@/components/notifications"

interface MainNavProps {
  isAdmin?: boolean
}

export function MainNav({ isAdmin = false }: MainNavProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const routes = isAdmin
    ? [
        { href: "/admin/dashboard", label: "Dashboard" },
        { href: "/admin/polls", label: "Manage Polls" },
        { href: "/admin/users", label: "Users" },
        { href: "/admin/statistics", label: "Statistics" },
      ]
    : [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/polls", label: "Active Polls" },
        { href: "/history", label: "My Predictions" },
        { href: "/leaderboard", label: "Leaderboard" },
      ]

  return (
    <div className="bg-primary text-primary-foreground py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2 mr-8">
          <Cricket className="h-6 w-6" />
          <span className="font-bold text-lg hidden sm:inline-block">IPL Prediction Portal</span>
        </Link>

        <nav className="flex gap-1 sm:gap-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors hover:bg-primary-foreground/10",
                pathname === route.href ? "bg-primary-foreground/20 font-medium" : "text-primary-foreground/80",
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {user && (
          <>
            <Link href="/help">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/settings">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <NotificationsPopover />
          </>
        )}
        <UserMenu isAdmin={isAdmin} user={user} logout={logout} />
      </div>
    </div>
  )
}

function UserMenu({ isAdmin, user, logout }: { isAdmin: boolean; user: any; logout: () => void }) {
  if (!user) {
    return (
      <Link href="/login">
        <Button
          variant="outline"
          size="sm"
          className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
        >
          Login
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 flex items-center gap-2"
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {user.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/history">My Predictions</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin/dashboard">Admin Dashboard</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

