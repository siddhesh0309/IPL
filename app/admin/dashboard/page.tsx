"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Trophy, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { usePolls } from "@/contexts/poll-context"
import type { Poll } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { StatsCard } from "@/components/stats-card"
import { TeamLogo } from "@/components/team-logo"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
  const { fetchAdminPolls, isLoading } = usePolls()
  const [activePolls, setActivePolls] = useState<Poll[]>([])
  const [completedPolls, setCompletedPolls] = useState<Poll[]>([])
  const [upcomingPolls, setUpcomingPolls] = useState<Poll[]>([])
  const [stats, setStats] = useState({
    totalUsers: 856,
    totalVotes: 1245,
    completedPolls: 12,
    activePolls: 5,
  })

  // Use a ref to track if polls have been loaded
  const pollsLoaded = useRef(false)

  useEffect(() => {
    // Only load polls if they haven't been loaded yet
    if (!pollsLoaded.current) {
      const loadPolls = async () => {
        try {
          const polls = await fetchAdminPolls()
          console.log("Polls:", polls)


          // Filter polls by status
          setActivePolls(polls.data.filter((poll) => poll.status === "ACTIVE"))
          setCompletedPolls(polls.data.filter((poll) => poll.status === "COMPLETED"))
          setUpcomingPolls(polls.data.filter((poll) => poll.status === "UPCOMING"))

          // Update stats
          setStats((prev) => ({
            ...prev,
            activePolls: polls.data.filter((poll) => poll.status === "ACTIVE").length,
            completedPolls: polls.data.filter((poll) => poll.status === "COMPLETED").length,
          }))

          // Mark polls as loaded
          pollsLoaded.current = true
        } catch (error) {
          console.error("Error loading polls:", error)
        }
      }

      loadPolls()
    }
  }, [fetchAdminPolls])

  return (
    <div className="container mx-auto py-6 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage polls and view statistics for IPL predictions.</p>
        </div>
        <Link href="/admin/polls/create">
          <Button>Create New Poll</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Polls"
          value={stats.activePolls.toString()}
          description="Currently open for voting"
          icon={<CalendarDays />}
          isLoading={isLoading}
          className="animate-slide-up"
          trend="neutral"
        />
        <StatsCard
          title="Total Votes"
          value={stats.totalVotes.toString()}
          description="Across all polls"
          icon={<TrendingUp />}
          isLoading={isLoading}
          className="animate-slide-up [animation-delay:100ms]"
          trend="up"
        />
        <StatsCard
          title="Completed Polls"
          value={stats.completedPolls.toString()}
          description="With results finalized"
          icon={<Trophy />}
          isLoading={isLoading}
          className="animate-slide-up [animation-delay:200ms]"
          trend="neutral"
        />
        <StatsCard
          title="Registered Users"
          value={stats.totalUsers.toString()}
          description="Active participants"
          icon={<Users />}
          isLoading={isLoading}
          className="animate-slide-up [animation-delay:300ms]"
          trend="up"
        />
      </div>

      <Tabs defaultValue="active" className="animate-fade-in [animation-delay:400ms]">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Polls</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Matches</TabsTrigger>
          <TabsTrigger value="completed">Completed Polls</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activePolls.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activePolls.map((poll) => (
                <AdminPollCard
                  key={poll.id}
                  id={poll.id}
                  team1={poll.match.homeTeam.name}
                  team2={poll.match.awayTeam.name}
                  date={new Date(poll.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  time={new Date(poll.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  votes={poll.totalVotes}
                  endsIn={getTimeRemaining(poll.pollEndTime)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No active polls at the moment.</div>
          )}
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingPolls.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingPolls.map((poll) => (
                <AdminPollCard
                  key={poll.id}
                  id={poll.id}
                  team1={poll.match.homeTeam.name}
                  team2={poll.match.awayTeam.name}
                  date={new Date(poll.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  time={new Date(poll.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  status="Not Created"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No upcoming matches found.</div>
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : completedPolls.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedPolls.map((poll) => (
                <AdminPollCard
                  key={poll.id}
                  id={poll.id}
                  team1={poll.match.homeTeam.name}
                  team2={poll.match.awayTeam.name}
                  date={new Date(poll.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  votes={poll.totalVotes}
                  winner={poll.team1}
                  status="Completed"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No completed polls found.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AdminPollCard({
  id,
  team1,
  team2,
  date,
  time,
  votes,
  endsIn,
  winner,
  status,
}: {
  id: string
  team1: string
  team2: string
  date: string
  time?: string
  votes?: number
  endsIn?: string
  winner?: string
  status?: string
}) {
  const pollUrl = `${team1.toLowerCase().replace(/\s+/g, "-")}-vs-${team2.toLowerCase().replace(/\s+/g, "-")}`

  return (
    <Card className="match-card overflow-hidden">
      <div className="match-card-gradient from-[hsl(var(--primary))] to-[hsl(var(--primary))/30]"></div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="flex items-center gap-2">
            <TeamLogo team={team1} size="sm" />
            <span>vs</span>
            <TeamLogo team={team2} size="sm" />
          </div>
        </CardTitle>
        <CardDescription>
          {date} {time && `• ${time}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {votes !== undefined && (
          <div className="text-sm">
            Total votes: <span className="font-medium">{votes}</span>
          </div>
        )}
        {winner && (
          <div className="text-sm">
            Winner: <span className="font-medium">{winner}</span>
          </div>
        )}
        {endsIn && (
          <div className="text-sm">
            Poll ends in: <span className="font-medium">{endsIn}</span>
          </div>
        )}
        {status && (
          <div className="text-sm">
            Status: <Badge variant={status === "Completed" ? "secondary" : "outline"}>{status}</Badge>
          </div>
        )}
      </CardContent>
      <div className="px-6 pb-4 pt-0">
        {status === "Not Created" ? (
          <Link href={`/admin/polls/create?match=${pollUrl}`}>
            <Button className="w-full">Create Poll</Button>
          </Link>
        ) : status === "Completed" ? (
          <Link href={`/admin/polls/${id}/results`}>
            <Button variant="outline" className="w-full">
              View Results
            </Button>
          </Link>
        ) : (
          <div className="flex gap-2">
            <Link href={`/admin/polls/${id}/edit`}>
              <Button variant="outline" className="flex-1">
                Edit
              </Button>
            </Link>
            <Link href={`/admin/polls/${id}/results`}>
              <Button className="flex-1">Results</Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}

// Helper function to calculate time remaining
function getTimeRemaining(endTimeStr: string): string {
  const endTime = new Date(endTimeStr)
  const now = new Date()
  const diffMs = endTime.getTime() - now.getTime()

  if (diffMs <= 0) return "Ended"

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""}`
  } else {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""}`
  }
}

