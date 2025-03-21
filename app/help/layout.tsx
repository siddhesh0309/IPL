import type React from "react"
import { MainNav } from "@/components/main-nav"

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <div className="flex-1">{children}</div>
    </div>
  )
}

