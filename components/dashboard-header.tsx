"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BirdIcon as Cricket } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { NotificationsPopover } from "@/components/notifications"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardHeaderProps {
  isAdmin?: boolean
  sidebarTrigger?: React.ReactNode
}

export function DashboardHeader({ isAdmin = false, sidebarTrigger }: DashboardHeaderProps) {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        {sidebarTrigger}
        <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2">
          <Cricket className="h-6 w-6" />
          <span className="font-bold text-lg hidden md:inline-block">IPL Prediction</span>
        </Link>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <NotificationsPopover />
        <UserMenu user={user} logout={logout} isAdmin={isAdmin} />
      </div>
    </header>
  )
}

function UserMenu({ user, logout, isAdmin }: { user: any; logout: () => void; isAdmin: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/help">Help</Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard">Admin Dashboard</Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

