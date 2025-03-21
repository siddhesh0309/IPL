"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronRight, Clock, Filter, MapPin, Search } from "lucide-react"
import Link from "next/link"

type Match = {
  id: string
  team1: string
  team1ShortName: string
  team2: string
  team2ShortName: string
  date: string
  venue: string
  status: "upcoming" | "live" | "completed"
  result?: string
  hasPolls: boolean
}

export default function SchedulePage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [teamFilter, setTeamFilter] = useState("all")
  const [venueFilter, setVenueFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("upcoming")

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/matches")

        if (!response.ok) {
          throw new Error("Failed to fetch matches")
        }

        const data = await response.json()
        setMatches(data.matches)
      } catch (err) {
        console.error("Error fetching matches:", err)
        setError("Failed to load match schedule. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMatches()
  }, [])

  // Get unique venues for filter
  const venues = [...new Set(matches.map((match) => match.venue.split(",")[0].trim()))]

  // Filter matches based on search term, team filter, venue filter, and active tab
  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      match.team1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.team2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.venue.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTeam =
      teamFilter === "all" ||
      match.team1.toLowerCase().includes(teamFilter.toLowerCase()) ||
      match.team2.toLowerCase().includes(teamFilter.toLowerCase())

    const matchesVenue = venueFilter === "all" || match.venue.toLowerCase().includes(venueFilter.toLowerCase())

    const matchesTab =
      (activeTab === "upcoming" && match.status === "upcoming") ||
      (activeTab === "completed" && match.status === "completed") ||
      activeTab === "all"

    return matchesSearch && matchesTeam && matchesVenue && matchesTab
  })

  // Group matches by date for better display
  const groupedMatches: Record<string, Match[]> = {}

  filteredMatches.forEach((match) => {
    const dateKey = new Date(match.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    if (!groupedMatches[dateKey]) {
      groupedMatches[dateKey] = []
    }

    groupedMatches[dateKey].push(match)
  })

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">IPL Schedule</h1>
        <p className="text-muted-foreground">View the complete schedule of IPL 2025 matches</p>
      </div>

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Matches</TabsTrigger>
          </TabsList>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search matches..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="Mumbai Indians">Mumbai Indians</SelectItem>
                  <SelectItem value="Chennai Super Kings">Chennai Super Kings</SelectItem>
                  <SelectItem value="Royal Challengers">Royal Challengers</SelectItem>
                  <SelectItem value="Kolkata Knight Riders">Kolkata Knight Riders</SelectItem>
                  <SelectItem value="Delhi Capitals">Delhi Capitals</SelectItem>
                  <SelectItem value="Rajasthan Royals">Rajasthan Royals</SelectItem>
                  <SelectItem value="Sunrisers Hyderabad">Sunrisers Hyderabad</SelectItem>
                  <SelectItem value="Punjab Kings">Punjab Kings</SelectItem>
                </SelectContent>
              </Select>
              <Select value={venueFilter} onValueChange={setVenueFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <MapPin className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Venues</SelectItem>
                  {venues.map((venue) => (
                    <SelectItem key={venue} value={venue}>
                      {venue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-8 mt-0">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-8">
              {[1, 2].map((dateGroup) => (
                <div key={dateGroup} className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <div className="space-y-4">
                    {[1, 2, 3].map((match) => (
                      <Card key={match}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <Skeleton className="h-6 w-64" />
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-4 w-40" />
                            </div>
                            <Skeleton className="h-10 w-28" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(groupedMatches).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedMatches).map(([date, dateMatches]) => (
                <div key={date} className="space-y-4">
                  <h2 className="text-xl font-semibold">{date}</h2>
                  <div className="space-y-4">
                    {dateMatches.map((match) => (
                      <Card key={match.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
                                  {match.team1} vs {match.team2}
                                </h3>
                                {match.status === "live" && <Badge variant="destructive">LIVE</Badge>}
                                {match.hasPolls && match.status === "upcoming" && <Badge>Polls Open</Badge>}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Clock className="mr-1 h-4 w-4" />
                                {new Date(match.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <MapPin className="mr-1 h-4 w-4" />
                                {match.venue}
                              </div>
                              {match.result && <div className="text-sm font-medium mt-1">{match.result}</div>}
                            </div>
                            <Button asChild>
                              <Link href={`/matches/${match.id}`}>
                                {match.status === "upcoming"
                                  ? match.hasPolls
                                    ? "Vote Now"
                                    : "View Match"
                                  : "View Details"}
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No matches found matching your criteria.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

const mockMatches: Match[] = [
  {
    id: "m1",
    team1: "Mumbai Indians",
    team1ShortName: "MI",
    team2: "Chennai Super Kings",
    team2ShortName: "CSK",
    date: "2025-04-10T18:30:00",
    venue: "Wankhede Stadium, Mumbai",
    status: "upcoming",
    hasPolls: true,
  },
  {
    id: "m2",
    team1: "Royal Challengers Bangalore",
    team1ShortName: "RCB",
    team2: "Kolkata Knight Riders",
    team2ShortName: "KKR",
    date: "2025-04-12T14:00:00",
    venue: "M. Chinnaswamy Stadium, Bangalore",
    status: "upcoming",
    hasPolls: true,
  },
  {
    id: "m3",
    team1: "Delhi Capitals",
    team1ShortName: "DC",
    team2: "Rajasthan Royals",
    team2ShortName: "RR",
    date: "2025-04-15T18:30:00",
    venue: "Arun Jaitley Stadium, Delhi",
    status: "upcoming",
    hasPolls: false,
  },
  {
    id: "m4",
    team1: "Sunrisers Hyderabad",
    team1ShortName: "SRH",
    team2: "Punjab Kings",
    team2ShortName: "PBKS",
    date: "2025-04-05T18:30:00",
    venue: "Rajiv Gandhi Stadium, Hyderabad",
    status: "completed",
    result: "Sunrisers Hyderabad won by 7 wickets",
    hasPolls: true,
  },
  {
    id: "m5",
    team1: "Gujarat Titans",
    team1ShortName: "GT",
    team2: "Lucknow Super Giants",
    team2ShortName: "LSG",
    date: "2025-04-03T18:30:00",
    venue: "Narendra Modi Stadium, Ahmedabad",
    status: "completed",
    result: "Gujarat Titans won by 5 wickets",
    hasPolls: true,
  },
  {
    id: "m6",
    team1: "Mumbai Indians",
    team1ShortName: "MI",
    team2: "Royal Challengers Bangalore",
    team2ShortName: "RCB",
    date: "2025-04-18T18:30:00",
    venue: "Wankhede Stadium, Mumbai",
    status: "upcoming",
    hasPolls: false,
  },
  {
    id: "m7",
    team1: "Chennai Super Kings",
    team1ShortName: "CSK",
    team2: "Kolkata Knight Riders",
    team2ShortName: "KKR",
    date: "2025-04-20T18:30:00",
    venue: "M. A. Chidambaram Stadium, Chennai",
    status: "upcoming",
    hasPolls: false,
  },
  {
    id: "m8",
    team1: "Rajasthan Royals",
    team1ShortName: "RR",
    team2: "Punjab Kings",
    team2ShortName: "PBKS",
    date: "2025-04-22T18:30:00",
    venue: "Sawai Mansingh Stadium, Jaipur",
    status: "upcoming",
    hasPolls: false,
  },
]