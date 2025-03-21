"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Search } from "lucide-react"
import Link from "next/link"
import { usePolls } from "@/contexts/poll-context"
import type { Poll } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"

export default function PollsPage() {
  const { fetchPolls, isLoading, error } = usePolls()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [activePolls, setActivePolls] = useState<Poll[]>([])
  const [upcomingPolls, setUpcomingPolls] = useState<Poll[]>([])
  const [completedPolls, setCompletedPolls] = useState<Poll[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadPolls = async () => {
      try {
        // Fetch polls from the API
        const response = await fetch("/api/polls")
        if (!response.ok) throw new Error("Failed to fetch polls")
        const data = await response.json()
        const polls = data.data

        // Filter polls by status
        setActivePolls(polls.filter((poll) => poll.status === "ACTIVE"))
        setUpcomingPolls(polls.filter((poll) => poll.status === "UPCOMING"))
        setCompletedPolls(polls.filter((poll) => poll.status === "COMPLETED"))

        // If user is logged in, fetch their votes
        if (user) {
          const votesResponse = await fetch(`/api/votes?userId=${user.id}`)
          if (votesResponse.ok) {
            const votes = await votesResponse.json()

            // Create a map of pollId -> optionId
            const voteMap: Record<string, string> = {}
            votes.forEach((vote: any) => {
              voteMap[vote.pollId] = vote.optionId
            })

            setUserVotes(voteMap)
          }
        }
      } catch (error) {
        console.error("Error loading polls:", error)
      }
    }

    loadPolls()
  }, [fetchPolls, user])

  // Filter polls based on search term
  const filterPolls = (polls: Poll[]) => {
    if (!searchTerm) return polls

    const term = searchTerm.toLowerCase()
    return polls.filter(
      (poll) =>
        poll.team1.toLowerCase().includes(term) ||
        poll.team2.toLowerCase().includes(term) ||
        poll.venue.toLowerCase().includes(term),
    )
  }

  const filteredActive = filterPolls(activePolls)
  const filteredUpcoming = filterPolls(upcomingPolls)
  const filteredCompleted = filterPolls(completedPolls)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Polls</h1>
          <p className="text-muted-foreground">Vote on upcoming IPL matches and view results</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search polls..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Polls</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
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
          ) : filteredActive.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredActive.map((poll) => (
                <PollCard
                  key={poll.id}
                  id={poll.id}
                  team1={poll.team1}
                  team2={poll.team2}
                  date={new Date(poll.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  time={new Date(poll.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  venue={poll.venue}
                  endsIn={getTimeRemaining(poll.pollEndTime)}
                  hasVoted={!!userVotes[poll.id]}
                  yourVote={userVotes[poll.id] ? getOptionText(poll, userVotes[poll.id]) : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No active polls found matching your criteria.</div>
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
          ) : filteredUpcoming.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUpcoming.map((poll) => (
                <PollCard
                  key={poll.id}
                  id={poll.id}
                  team1={poll.team1}
                  team2={poll.team2}
                  date={new Date(poll.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  time={new Date(poll.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  venue={poll.venue}
                  status="Polls not yet open"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming polls found matching your criteria.
            </div>
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
          ) : filteredCompleted.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCompleted.map((poll) => (
                <PollCard
                  key={poll.id}
                  id={poll.id}
                  team1={poll.team1}
                  team2={poll.team2}
                  date={new Date(poll.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  result={`${poll.team1} won by 24 runs`}
                  yourVote={userVotes[poll.id] ? getOptionText(poll, userVotes[poll.id]) : undefined}
                  isCorrect={userVotes[poll.id] ? getOptionText(poll, userVotes[poll.id]) === poll.team1 : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No completed polls found matching your criteria.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PollCard({
  id,
  team1,
  team2,
  date,
  time,
  venue,
  endsIn,
  result,
  yourVote,
  isCorrect,
  hasVoted,
  status,
}: {
  id: string
  team1: string
  team2: string
  date: string
  time?: string
  venue?: string
  endsIn?: string
  result?: string
  yourVote?: string
  isCorrect?: boolean
  hasVoted?: boolean
  status?: string
}) {
  const pollId = `${team1.toLowerCase().replace(/\s+/g, "-")}-vs-${team2.toLowerCase().replace(/\s+/g, "-")}`

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {team1} vs {team2}
          </CardTitle>
          {endsIn && (
            <Badge variant="outline" className="text-xs">
              Ends in {endsIn}
            </Badge>
          )}
        </div>
        <CardDescription>
          {date} {time && `• ${time}`}
        </CardDescription>
        {venue && <CardDescription>{venue}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        {result ? (
          <div className="space-y-2">
            <div className="text-sm font-medium">{result}</div>
            {yourVote && (
              <div className="flex items-center gap-2 text-sm">
                <span>Your prediction:</span>
                <Badge variant={isCorrect ? "default" : "destructive"} className="text-xs">
                  {yourVote}
                </Badge>
              </div>
            )}
          </div>
        ) : status ? (
          <div className="text-sm text-muted-foreground">{status}</div>
        ) : (
          <div className="space-y-3">
            {hasVoted ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  You voted for {yourVote}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Vote before match starts</span>
                </div>
                <Link href={`/polls/${id}`}>
                  <Button size="sm">Vote Now</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
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

// Helper function to get option text from option ID
function getOptionText(poll: Poll, optionId: string): string {
  const option = poll.options.find((opt) => opt.id === optionId)
  return option ? option.text : ""
}

