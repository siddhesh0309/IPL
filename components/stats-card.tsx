import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  isLoading?: boolean
  className?: string
  trend?: "up" | "down" | "neutral"
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  isLoading = false,
  className,
  trend = "neutral",
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-primary/30"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <div className="flex items-center mt-1">
              <p className="text-xs text-muted-foreground">{description}</p>
              {trend !== "neutral" && (
                <div
                  className={cn("ml-2 flex items-center text-xs", trend === "up" ? "text-green-500" : "text-red-500")}
                >
                  {trend === "up" ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  <span>{trend === "up" ? "+5%" : "-3%"}</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

