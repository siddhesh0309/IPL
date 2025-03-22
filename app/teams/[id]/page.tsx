"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Calendar, MapPin, Trophy } from "lucide-react"
import Link from "next/link"

type Player = {
  id: string
  name: string
  role: string
  nationality: string
  battingStyle?: string
  bowlingStyle?: string
  matches: number
  runs?: number
  wickets?: number
  image: string
}

type TeamMatch = {
  id: string
  opponent: string
  date: string
  venue: string
  result?: string
  isWon?: boolean
}

type TeamDetails = {
  id: string
  name: string
  shortName: string
  logo: string
  primaryColor: string
  secondaryColor: string
  homeGround: string
  captain: string
  coach: string
  owner: string
  founded: string
  titles: number
  standing: number
  points: number
  matchesPlayed: number
  matchesWon: number
  matchesLost: number
  players: Player[]
  recentMatches: TeamMatch[]
  upcomingMatches: TeamMatch[]
}

export default function TeamDetailsPage({ params }) {
  const router = useRouter()
  const [team, setTeam] = useState<TeamDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  params == use(params)

  useEffect(() => {
    const fetchTeamDetails = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/teams/${params.id}`)

        // Simulate API response with mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data for Mumbai Indians
        const mockTeam: TeamDetails = {
          id: params.id,
          name: "Mumbai Indians",
          shortName: "MI",
          logo: "/placeholder.svg?height=200&width=200",
          primaryColor: "#004BA0",
          secondaryColor: "#D1AB3E",
          homeGround: "Wankhede Stadium, Mumbai",
          captain: "Rohit Sharma",
          coach: "Mahela Jayawardene",
          owner: "Reliance Industries",
          founded: "2008",
          titles: 5,
          standing: 1,
          points: 16,
          matchesPlayed: 10,
          matchesWon: 8,
          matchesLost: 2,
          players: [
            {
              id: "p1",
              name: "Rohit Sharma",
              role: "Batsman",
              nationality: "Indian",
              battingStyle: "Right-handed",
              matches: 213,
              runs: 5611,
              image: "/placeholder.svg?height=100&width=100",
            },
            {
              id: "p2",
              name: "Jasprit Bumrah",
              role: "Bowler",
              nationality: "Indian",
              bowlingStyle: "Right-arm fast",
              matches: 106,
              wickets: 130,
              image: "/placeholder.svg?height=100&width=100",
            },
            {
              id: "p3",
              name: "Kieron Pollard",
              role: "All-rounder",
              nationality: "West Indian",
              battingStyle: "Right-handed",
              bowlingStyle: "Right-arm medium",
              matches: 171,
              runs: 3191,
              wickets: 65,
              image: "/placeholder.svg?height=100&width=100",
            },
            {
              id: "p4",
              name: "Suryakumar Yadav",
              role: "Batsman",
              nationality: "Indian",
              battingStyle: "Right-handed",
              matches: 115,
              runs: 2341,
              image: "/placeholder.svg?height=100&width=100",
            },
            {
              id: "p5",
              name: "Quinton de Kock",
              role: "Wicket-keeper",
              nationality: "South African",
              battingStyle: "Left-handed",
              matches: 91,
              runs: 2256,
              image: "/placeholder.svg?height=100&width=100",
            },
            {
              id: "p6",
              name: "Hardik Pandya",
              role: "All-rounder",
              nationality: "Indian",
              battingStyle: "Right-handed",
              bowlingStyle: "Right-arm medium-fast",
              matches: 92,
              runs: 1476,
              wickets: 42,
              image: "/placeholder.svg?height=100&width=100",
            },
          ],
          recentMatches: [
            {
              id: "m1",
              opponent: "Chennai Super Kings",
              date: "2025-04-10",
              venue: "Wankhede Stadium, Mumbai",
              result: "Won by 5 wickets",
              isWon: true,
            },
            {
              id: "m2",
              opponent: "Royal Challengers Bangalore",
              date: "2025-04-05",
              venue: "M. Chinnaswamy Stadium, Bangalore",
              result: "Lost by 18 runs",
              isWon: false,
            },
            {
              id: "m3",
              opponent: "Kolkata Knight Riders",
              date: "2025-04-01",
              venue: "Wankhede Stadium, Mumbai",
              result: "Won by 42 runs",
              isWon: true,
            },
          ],
          upcomingMatches: [
            {
              id: "m4",
              opponent: "Delhi Capitals",
              date: "2025-04-15",
              venue: "Arun Jaitley Stadium, Delhi",
            },
            {
              id: "m5",
              opponent: "Rajasthan Royals",
              date: "2025-04-20",
              venue: "Wankhede Stadium, Mumbai",
            },
            {
              id: "m6",
              opponent: "Sunrisers Hyderabad",
              date: "2025-04-25",
              venue: "Rajiv Gandhi Stadium, Hyderabad",
            },
          ],
        }

        setTeam(mockTeam)
      } catch (err) {
        console.error("Error fetching team details:", err)
        setError("Failed to load team details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeamDetails()
  }, [])

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Team Details</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-64" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>

          <Skeleton className="h-10 w-full" />

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : team ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row gap-6">
              <div
                className="flex items-center justify-center p-4 rounded-lg"
                style={{ backgroundColor: `${team.primaryColor}20` }}
              >
                <img
                  src={team.logo || "/placeholder.svg"}
                  alt={`${team.name} logo`}
                  className="h-32 w-32 object-contain"
                />
              </div>
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{team.name}</h2>
                    <Badge>{team.shortName}</Badge>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {team.homeGround}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {team.titles > 0 && (
                    <div className="flex items-center gap-1 text-sm px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                      <Trophy className="h-4 w-4" />
                      {team.titles} {team.titles === 1 ? "Title" : "Titles"}
                    </div>
                  )}
                  <div className="text-sm px-2 py-1 bg-muted rounded-full">#{team.standing} in standings</div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Captain</p>
                    <p className="font-medium">{team.captain}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Coach</p>
                    <p className="font-medium">{team.coach}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Owner</p>
                    <p className="font-medium">{team.owner}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Founded</p>
                    <p className="font-medium">{team.founded}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Matches</p>
                    <p className="text-2xl font-bold">{team.matchesPlayed}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Won</p>
                    <p className="text-2xl font-bold text-green-600">{team.matchesWon}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Lost</p>
                    <p className="text-2xl font-bold text-red-600">{team.matchesLost}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Points</p>
                    <p className="text-2xl font-bold">{team.points}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="squad">
            <TabsList>
              <TabsTrigger value="squad">Squad</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            <TabsContent value="squad" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Squad</CardTitle>
                  <CardDescription>Players in {team.name} for IPL 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {team.players.map((player) => (
                      <Card key={player.id} className="overflow-hidden">
                        <div className="flex p-4 gap-4">
                          <div className="h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={player.image || "/placeholder.svg"}
                              alt={player.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-medium">{player.name}</h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">{player.role}</Badge>
                              <Badge variant="secondary">{player.nationality}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {player.battingStyle && `Batting: ${player.battingStyle}`}
                              {player.battingStyle && player.bowlingStyle && " • "}
                              {player.bowlingStyle && `Bowling: ${player.bowlingStyle}`}
                            </p>
                          </div>
                        </div>
                        <div className="bg-muted p-3 grid grid-cols-2 gap-2 text-center text-sm">
                          <div>
                            <p className="text-muted-foreground">Matches</p>
                            <p className="font-medium">{player.matches}</p>
                          </div>
                          {player.runs && (
                            <div>
                              <p className="text-muted-foreground">Runs</p>
                              <p className="font-medium">{player.runs}</p>
                            </div>
                          )}
                          {player.wickets && (
                            <div className={player.runs ? "col-span-2" : ""}>
                              <p className="text-muted-foreground">Wickets</p>
                              <p className="font-medium">{player.wickets}</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="matches" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Matches</CardTitle>
                  <CardDescription>Scheduled matches for {team.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {team.upcomingMatches.length > 0 ? (
                    <div className="space-y-4">
                      {team.upcomingMatches.map((match) => (
                        <div
                          key={match.id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex flex-col mb-4 md:mb-0">
                            <div className="font-medium">
                              {team.name} vs {match.opponent}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <Calendar className="mr-1 h-4 w-4" />
                              {new Date(match.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <MapPin className="mr-1 h-4 w-4" />
                              {match.venue}
                            </div>
                          </div>
                          <Button asChild>
                            <Link href={`/matches/${match.id}`}>View Match</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No upcoming matches scheduled.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Matches</CardTitle>
                  <CardDescription>Past matches of {team.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {team.recentMatches.length > 0 ? (
                    <div className="space-y-4">
                      {team.recentMatches.map((match) => (
                        <div
                          key={match.id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex flex-col mb-4 md:mb-0">
                            <div className="font-medium">
                              {team.name} vs {match.opponent}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <Calendar className="mr-1 h-4 w-4" />
                              {new Date(match.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <MapPin className="mr-1 h-4 w-4" />
                              {match.venue}
                            </div>
                            {match.result && (
                              <div
                                className={`text-sm font-medium mt-2 ${match.isWon ? "text-green-600" : "text-red-600"}`}
                              >
                                {match.result}
                              </div>
                            )}
                          </div>
                          <Button asChild variant="outline">
                            <Link href={`/matches/${match.id}`}>View Details</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No recent matches found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="stats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Statistics</CardTitle>
                  <CardDescription>Performance statistics for {team.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Win/Loss Ratio</h3>
                      <div className="h-8 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${(team.matchesWon / team.matchesPlayed) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <div>
                          <span className="font-medium text-green-600">{team.matchesWon}</span> Wins
                        </div>
                        <div>
                          Win Rate:{" "}
                          <span className="font-medium">
                            {Math.round((team.matchesWon / team.matchesPlayed) * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-red-600">{team.matchesLost}</span> Losses
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Top Run Scorers</h3>
                        <div className="space-y-3">
                          {team.players
                            .filter((player) => player.runs)
                            .sort((a, b) => (b.runs || 0) - (a.runs || 0))
                            .slice(0, 3)
                            .map((player) => (
                              <div key={player.id} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
                                    <img
                                      src={player.image || "/placeholder.svg"}
                                      alt={player.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <span>{player.name}</span>
                                </div>
                                <span className="font-medium">{player.runs} runs</span>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-4">Top Wicket Takers</h3>
                        <div className="space-y-3">
                          {team.players
                            .filter((player) => player.wickets)
                            .sort((a, b) => (b.wickets || 0) - (a.wickets || 0))
                            .slice(0, 3)
                            .map((player) => (
                              <div key={player.id} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
                                    <img
                                      src={player.image || "/placeholder.svg"}
                                      alt={player.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <span>{player.name}</span>
                                </div>
                                <span className="font-medium">{player.wickets} wickets</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Alert>
          <AlertDescription>Team not found.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

