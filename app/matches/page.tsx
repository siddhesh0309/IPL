"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, ChevronRight, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data
const matches = [
  {
    id: 1,
    team1: "Mumbai Indians",
    team2: "Chennai Super Kings",
    date: "2025-04-10T18:30:00",
    venue: "Wankhede Stadium, Mumbai",
    status: "upcoming",
    hasVoted: false,
  },
  {
    id: 2,
    team1: "Royal Challengers Bangalore",
    team2: "Kolkata Knight Riders",
    date: "2025-04-12T14:00:00",
    venue: "M. Chinnaswamy Stadium, Bangalore",
    status: "upcoming",
    hasVoted: true,
  },
  {
    id: 3,
    team1: "Delhi Capitals",
    team2: "Rajasthan Royals",
    date: "2025-04-15T18:30:00",
    venue: "Arun Jaitley Stadium, Delhi",
    status: "upcoming",
    hasVoted: false,
  },
  {
    id: 4,
    team1: "Sunrisers Hyderabad",
    team2: "Punjab Kings",
    date: "2025-04-05T18:30:00",
    venue: "Rajiv Gandhi Stadium, Hyderabad",
    status: "completed",
    result: "Sunrisers Hyderabad won by 7 wickets",
    hasVoted: true,
  },
  {
    id: 5,
    team1: "Gujarat Titans",
    team2: "Lucknow Super Giants",
    date: "2025-04-03T18:30:00",
    venue: "Narendra Modi Stadium, Ahmedabad",
    status: "completed",
    result: "Gujarat Titans won by 5 wickets",
    hasVoted: true,
  },
]

export default function MatchesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [teamFilter, setTeamFilter] = useState("all")

  const upcomingMatches = matches.filter((match) => match.status === "upcoming")
  const completedMatches = matches.filter((match) => match.status === "completed")

  // Filter matches based on search term and team filter
  const filterMatches = (matchList: typeof matches) => {
    return matchList.filter((match) => {
      const matchesSearch =
        match.team1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.team2.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.venue.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesTeam =
        teamFilter === "all" ||
        match.team1.toLowerCase().includes(teamFilter.toLowerCase()) ||
        match.team2.toLowerCase().includes(teamFilter.toLowerCase())

      return matchesSearch && matchesTeam
    })
  }

  const filteredUpcoming = filterMatches(upcomingMatches)
  const filteredCompleted = filterMatches(completedMatches)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">IPL Matches</h1>

      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <Input
          placeholder="Search matches..."
          className="w-full md:w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            <SelectItem value="mumbai">Mumbai Indians</SelectItem>
            <SelectItem value="chennai">Chennai Super Kings</SelectItem>
            <SelectItem value="bangalore">Royal Challengers Bangalore</SelectItem>
            <SelectItem value="kolkata">Kolkata Knight Riders</SelectItem>
            <SelectItem value="delhi">Delhi Capitals</SelectItem>
            <SelectItem value="rajasthan">Rajasthan Royals</SelectItem>
            <SelectItem value="hyderabad">Sunrisers Hyderabad</SelectItem>
            <SelectItem value="punjab">Punjab Kings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 h-auto">
          <TabsTrigger value="upcoming">Upcoming Matches</TabsTrigger>
          <TabsTrigger value="completed">Completed Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Matches</CardTitle>
              <CardDescription>Vote on upcoming IPL matches</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUpcoming.length > 0 ? (
                <div className="space-y-4">
                  {filteredUpcoming.map((match) => (
                    <div
                      key={match.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex flex-col mb-4 md:mb-0">
                        <div className="font-medium">
                          {match.team1} vs {match.team2}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <CalendarDays className="mr-1 h-4 w-4" />
                          {new Date(match.date).toLocaleDateString()}
                          <span className="mx-2">•</span>
                          <Clock className="mr-1 h-4 w-4" />
                          {new Date(match.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{match.venue}</div>
                      </div>
                      <div className="flex items-center">
                        {match.hasVoted ? (
                          <Badge variant="outline" className="mr-2">
                            Voted
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="mr-2">
                            Not Voted
                          </Badge>
                        )}
                        <Button>
                          View Polls
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming matches found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Completed Matches</CardTitle>
              <CardDescription>View results of completed IPL matches</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCompleted.length > 0 ? (
                <div className="space-y-4">
                  {filteredCompleted.map((match) => (
                    <div
                      key={match.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex flex-col mb-4 md:mb-0">
                        <div className="font-medium">
                          {match.team1} vs {match.team2}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <CalendarDays className="mr-1 h-4 w-4" />
                          {new Date(match.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{match.venue}</div>
                        <div className="mt-2 font-medium text-primary">{match.result}</div>
                      </div>
                      <div className="flex items-center">
                        <Button variant="outline">
                          View Results
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No completed matches found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

