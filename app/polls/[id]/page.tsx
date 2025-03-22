"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { usePolls } from "@/contexts/poll-context"
import type { Poll } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PollPage({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { fetchPoll, submitVote, isLoading, error } = usePolls()
  const [poll, setPoll] = useState<Poll | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState<{ team: string | null; player: string | null }>({ team: null, player: null })

  params = use(params)

  useEffect(() => {
    const loadPoll = async () => {
      try {
        const { data } = await fetchPoll(params.id)
        setPoll(data)

        // Check if user has already voted
        if (user) {
          const response = await fetch(`/api/votes?userId=${user.id}&pollId=${params.id}`)
          if (response.ok) {
            const votes = await response.json()
            if (votes.length > 0) {
              setHasVoted(true)

              // Find the option text for the user's vote
              const teamOption = data.options.find((opt) => opt.id === votes[0].optionId)
              if (teamOption) {
                setUserVote((prev) => ({ ...prev, team: teamOption.text }))
              }

              // If there's a second vote (for MOTM), get that too
              if (votes.length > 1) {
                const playerOption = data.options.find((opt) => opt.id === votes[1].optionId)
                if (playerOption) {
                  setUserVote((prev) => ({ ...prev, player: playerOption.text }))
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading poll:", error)
        toast({
          title: "Error",
          description: "Failed to load poll details. Please try again.",
          variant: "destructive",
        })
      }
    }

    loadPoll()
  }, [fetchPoll, user, toast])

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to vote on polls",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!selectedTeam || !selectedPlayer) {
      toast({
        title: "Incomplete selection",
        description: "Please select both a winning team and Man of the Match",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Submit team vote
      await submitVote(user.id, params.id, selectedTeam)

      // Submit player vote (in a real app, this would be a separate poll)
      // await submitVote(user.id, `${params.id}-motm`, selectedPlayer)

      toast({
        title: "Vote submitted successfully",
        description: "Your prediction has been recorded",
      })

      setHasVoted(true)

      // Set user vote for display
      const teamOption = poll?.options.find((opt) => opt.id === selectedTeam)
      const playerOption = poll?.options.find((opt) => opt.id === selectedPlayer)

      setUserVote({
        team: teamOption?.text || null,
        player: playerOption?.text || null,
      })
    } catch (error) {
      toast({
        title: "Failed to submit vote",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !poll) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-1" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Mock data for Man of the Match options
  const players = [
    { id: "p1", name: "Rohit Sharma", team: poll.match.homeTeam.name },
    { id: "p2", name: "Jasprit Bumrah", team: poll.match.homeTeam.name },
    { id: "p3", name: "Hardik Pandya", team: poll.match.homeTeam.name },
    { id: "p4", name: "MS Dhoni", team: poll.match.awayTeam.name },
    { id: "p5", name: "Ravindra Jadeja", team: poll.match.awayTeam.name },
    { id: "p6", name: "Ruturaj Gaikwad", team: poll.match.awayTeam.name },
  ]

  // Mock data for team votes
  const teamVotes = {
    [poll.match.homeTeam.name]: 65,
    [poll.match.awayTeam.name]: 35,
  }

  // Mock data for player votes
  const playerVotes = {
    "Rohit Sharma": 25,
    "Jasprit Bumrah": 15,
    "Hardik Pandya": 10,
    "MS Dhoni": 30,
    "Ravindra Jadeja": 10,
    "Ruturaj Gaikwad": 10,
  }

  const isPollEnded = new Date(poll.pollEndTime) < new Date()

  console.log(isPollEnded)
  console.log(poll)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Match Prediction</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">
                {poll.match.homeTeam.name} vs {poll.match.awayTeam.name}
              </CardTitle>
              <CardDescription>
                {new Date(poll.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} •
                {new Date(poll.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </CardDescription>
              <CardDescription>{poll.venue}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {isPollEnded ? "Poll ended" : `Poll ends in ${getTimeRemaining(poll.pollEndTime.toLocaleString())}`}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {hasVoted || isPollEnded ? (
            <Tabs defaultValue="results">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="your-vote">Your Vote</TabsTrigger>
              </TabsList>
              <TabsContent value="results" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Match Winner Predictions</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{poll.match.homeTeam.name}</span>
                        <span>{teamVotes[poll.match.homeTeam.name]}%</span>
                      </div>
                      <Progress value={teamVotes[poll.match.homeTeam.name]} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{poll.match.awayTeam.name}</span>
                        <span>{teamVotes[poll.match.awayTeam.name]}%</span>
                      </div>
                      <Progress value={teamVotes[poll.match.awayTeam.name]} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Man of the Match Predictions</h3>
                  <div className="space-y-3">
                    {Object.entries(playerVotes).map(([player, votes]) => (
                      <div key={player} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{player}</span>
                          <span>{votes}%</span>
                        </div>
                        <Progress value={votes} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground text-center">Total votes: {poll._count.votes}</div>
              </TabsContent>
              <TabsContent value="your-vote" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Your Prediction</h3>
                  <div className="p-4 bg-muted rounded-md">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-muted-foreground">Match Winner:</span>
                        <p className="font-medium">{userVote.team || selectedTeam}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Man of the Match:</span>
                        <p className="font-medium">{userVote.player || selectedPlayer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Predict the Match Winner</h3>
                <RadioGroup value={selectedTeam || ""} onValueChange={setSelectedTeam}>
                  <div className="flex flex-col gap-3">
                    {poll.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={`team-${option.id}`} />
                        <Label htmlFor={`team-${option.id}`}>{option.text}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Predict Man of the Match</h3>
                <RadioGroup value={selectedPlayer || ""} onValueChange={setSelectedPlayer}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {players.map((player) => (
                      <div key={player.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={player.id} id={`player-${player.id}`} />
                        <Label htmlFor={`player-${player.id}`} className="flex items-center gap-2">
                          {player.name}
                          <Badge variant="outline" className="text-xs">
                            {player.team}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          {hasVoted || isPollEnded ? (
            <Link href="/polls">
              <Button variant="outline">Back to Polls</Button>
            </Link>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedTeam || !selectedPlayer}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Prediction"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
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

