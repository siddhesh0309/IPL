import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  isAdmin?: boolean
}

export function DashboardLayout({ children, isAdmin = false }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col overflow-fix">
        {/* <DashboardHeader
          isAdmin={isAdmin}
          sidebarTrigger={
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          }
        /> */}
        <div className="flex flex-1">
          <DashboardSidebar isAdmin={isAdmin} />
          <main className="flex-1 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
            <div className="max-w-full">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

