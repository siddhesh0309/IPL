import type React from "react"
import ProtectedRoute from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout isAdmin={true}>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}

