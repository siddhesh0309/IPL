import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TeamLogo } from "@/components/team-logo"
import { Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface MatchCardProps {
  id: string
  team1: string
  team2: string
  date: string
  time?: string
  venue?: string
  status?: "upcoming" | "live" | "completed" | string
  result?: string
  pollStatus?: "active" | "closed" | "not-created"
  votes?: number
  className?: string
}

export function MatchCard({
  id,
  team1,
  team2,
  date,
  time,
  venue,
  status = "upcoming",
  result,
  pollStatus = "active",
  votes,
  className,
}: MatchCardProps) {
  // Determine badge variant based on status
  const getBadgeVariant = () => {
    if (status === "live") return "destructive"
    if (status === "completed") return "secondary"
    return "outline"
  }

  return (
    <Card className={cn("match-card overflow-hidden", className)}>
      <div className="match-card-gradient from-[hsl(var(--primary))] to-[hsl(var(--primary))/30]"></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            <div className="flex items-center gap-3">
              <TeamLogo team={team1} size="sm" />
              <span className="text-sm sm:text-base">vs</span>
              <TeamLogo team={team2} size="sm" />
            </div>
          </CardTitle>
          {status && (
            <Badge variant={getBadgeVariant()} className="text-xs">
              {status.toUpperCase()}
            </Badge>
          )}
        </div>
        <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2">
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            <span className="text-xs">{date}</span>
          </div>
          {time && (
            <>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                <span className="text-xs">{time}</span>
              </div>
            </>
          )}
        </CardDescription>
        {venue && <CardDescription className="text-xs mt-1">{venue}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        {result && <div className="text-sm font-medium bg-muted/50 p-2 rounded-md">{result}</div>}

        {votes !== undefined && (
          <div className="text-xs text-muted-foreground">
            Total votes: <span className="font-medium">{votes}</span>
          </div>
        )}

        <div className="flex justify-between items-center mt-2">
          {pollStatus === "active" && (
            <Link href={`/polls/${id}`} className="w-full">
              <Button size="sm" className="w-full">
                Vote Now
              </Button>
            </Link>
          )}

          {pollStatus === "closed" && (
            <Link href={`/polls/${id}/results`} className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                View Results
              </Button>
            </Link>
          )}

          {pollStatus === "not-created" && status === "upcoming" && (
            <Link href={`/admin/polls/create?match=${id}`} className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                Create Poll
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

