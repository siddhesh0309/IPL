"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search } from "lucide-react"
import Link from "next/link"

type Team = {
  id: string
  name: string
  shortName: string
  logo: string
  primaryColor: string
  secondaryColor: string
  homeGround: string
  captain: string
  titles: number
  standing: number
  points: number
  matchesPlayed: number
  matchesWon: number
  matchesLost: number
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/teams')

        // Simulate API response with mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockTeams: Team[] = [
          {
            id: "mi",
            name: "Mumbai Indians",
            shortName: "MI",
            logo: "/placeholder.svg?height=100&width=100",
            primaryColor: "#004BA0",
            secondaryColor: "#D1AB3E",
            homeGround: "Wankhede Stadium, Mumbai",
            captain: "Rohit Sharma",
            titles: 5,
            standing: 1,
            points: 16,
            matchesPlayed: 10,
            matchesWon: 8,
            matchesLost: 2,
          },
          {
            id: "csk",
            name: "Chennai Super Kings",
            shortName: "CSK",
            logo: "/placeholder.svg?height=100&width=100",
            primaryColor: "#FFFF3C",
            secondaryColor: "#0081E9",
            homeGround: "M. A. Chidambaram Stadium, Chennai",
            captain: "MS Dhoni",
            titles: 4,
            standing: 2,
            points: 14,
            matchesPlayed: 10,
            matchesWon: 7,
            matchesLost: 3,
          },
          {
            id: "rcb",
            name: "Royal Challengers Bangalore",
            shortName: "RCB",
            logo: "/placeholder.svg?height=100&width=100",
            primaryColor: "#EC1C24",
            secondaryColor: "#000000",
            homeGround: "M. Chinnaswamy Stadium, Bangalore",
            captain: "Virat Kohli",
            titles: 0,
            standing: 3,
            points: 12,
            matchesPlayed: 10,
            matchesWon: 6,
            matchesLost: 4,
          },
          {
            id: "dc",
            name: "Delhi Capitals",
            shortName: "DC",
            logo: "/placeholder.svg?height=100&width=100",
            primaryColor: "#0078BC",
            secondaryColor: "#EF1C25",
            homeGround: "Arun Jaitley Stadium, Delhi",
            captain: "Rishabh Pant",
            titles: 0,
            standing: 4,
            points: 10,
            matchesPlayed: 10,
            matchesWon: 5,
            matchesLost: 5,
          },
          {
            id: "kkr",
            name: "Kolkata Knight Riders",
            shortName: "KKR",
            logo: "/placeholder.svg?height=100&width=100",
            primaryColor: "#3A225D",
            secondaryColor: "#B3A123",
            homeGround: "Eden Gardens, Kolkata",
            captain: "Shreyas Iyer",
            titles: 2,
            standing: 5,
            points: 8,
            matchesPlayed: 10,
            matchesWon: 4,
            matchesLost: 6,
          },
          {
            id: "rr",
            name: "Rajasthan Royals",
            shortName: "RR",
            logo: "/placeholder.svg?height=100&width=100",
            primaryColor: "#EA1A85",
            secondaryColor: "#254AA5",
            homeGround: "Sawai Mansingh Stadium, Jaipur",
            captain: "Sanju Samson",
            titles: 1,
            standing: 6,
            points: 6,
            matchesPlayed: 10,
            matchesWon: 3,
            matchesLost: 7,
          },
          {
            id: "srh",
            name: "Sunrisers Hyderabad",
            shortName: "SRH",
            logo: "/placeholder.svg?height=100&width=100",
            primaryColor: "#F7A721",
            secondaryColor: "#E95E0B",
            homeGround: "Rajiv Gandhi Stadium, Hyderabad",
            captain: "Kane Williamson",
            titles: 1,
            standing: 7,
            points: 4,
            matchesPlayed: 10,
            matchesWon: 2,
            matchesLost: 8,
          },
          {
            id: "pbks",
            name: "Punjab Kings",
            shortName: "PBKS",
            logo: "/placeholder.svg?height=100&width=100",
            primaryColor: "#ED1B24",
            secondaryColor: "#A7A9AC",
            homeGround: "IS Bindra Stadium, Mohali",
            captain: "KL Rahul",
            titles: 0,
            standing: 8,
            points: 2,
            matchesPlayed: 10,
            matchesWon: 1,
            matchesLost: 9,
          },
        ]

        setTeams(mockTeams)
      } catch (err) {
        console.error("Error fetching teams:", err)
        setError("Failed to load teams. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeams()
  }, [])

  // Filter teams based on search term and active tab
  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.shortName.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "top4") return matchesSearch && team.standing <= 4
    if (activeTab === "champions") return matchesSearch && team.titles > 0

    return matchesSearch
  })

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">IPL Teams</h1>
        <p className="text-muted-foreground">View information about all IPL teams</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Teams</TabsTrigger>
            <TabsTrigger value="top4">Top 4</TabsTrigger>
            <TabsTrigger value="champions">Champions</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-6 flex justify-center">
                <Skeleton className="h-24 w-24 rounded-full" />
              </div>
              <CardContent className="pb-6 text-center">
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto mb-4" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTeams.map((team) => (
            <Link href={`/teams/${team.id}`} key={team.id}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="p-6 flex justify-center" style={{ backgroundColor: `${team.primaryColor}20` }}>
                  <div className="h-24 w-24 rounded-full flex items-center justify-center bg-white shadow-sm">
                    <img
                      src={team.logo || "/placeholder.svg"}
                      alt={`${team.name} logo`}
                      className="h-20 w-20 object-contain"
                    />
                  </div>
                </div>
                <CardContent className="pb-6 text-center">
                  <h3 className="text-xl font-bold mb-1">{team.name}</h3>
                  <div className="text-sm text-muted-foreground mb-3">{team.shortName}</div>
                  <div className="flex justify-center items-center gap-2">
                    <div className="text-xs px-2 py-1 bg-muted rounded-full">#{team.standing}</div>
                    {team.titles > 0 && (
                      <div className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                        {team.titles} {team.titles === 1 ? "Title" : "Titles"}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No teams found matching your search criteria.</p>
        </div>
      )}
    </div>
  )
}

