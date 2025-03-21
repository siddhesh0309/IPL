"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy } from "lucide-react"
import Link from "next/link"

type TeamStanding = {
  id: string
  name: string
  shortName: string
  logo: string
  played: number
  won: number
  lost: number
  tied: number
  nrr: number
  points: number
  lastFive: Array<"W" | "L" | "T" | "N">
  qualified?: "playoffs" | "eliminated"
}

export default function StandingsPage() {
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStandings = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/standings')

        // Simulate API response with mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockStandings: TeamStanding[] = [
          {
            id: "mi",
            name: "Mumbai Indians",
            shortName: "MI",
            logo: "/placeholder.svg?height=40&width=40",
            played: 10,
            won: 8,
            lost: 2,
            tied: 0,
            nrr: 0.75,
            points: 16,
            lastFive: ["W", "W", "L", "W", "W"],
            qualified: "playoffs",
          },
          {
            id: "csk",
            name: "Chennai Super Kings",
            shortName: "CSK",
            logo: "/placeholder.svg?height=40&width=40",
            played: 10,
            won: 7,
            lost: 3,
            tied: 0,
            nrr: 0.6,
            points: 14,
            lastFive: ["W", "W", "W", "L", "W"],
            qualified: "playoffs",
          },
          {
            id: "rcb",
            name: "Royal Challengers Bangalore",
            shortName: "RCB",
            logo: "/placeholder.svg?height=40&width=40",
            played: 10,
            won: 6,
            lost: 4,
            tied: 0,
            nrr: 0.35,
            points: 12,
            lastFive: ["L", "W", "W", "W", "L"],
          },
          {
            id: "dc",
            name: "Delhi Capitals",
            shortName: "DC",
            logo: "/placeholder.svg?height=40&width=40",
            played: 10,
            won: 5,
            lost: 5,
            tied: 0,
            nrr: 0.1,
            points: 10,
            lastFive: ["W", "L", "W", "L", "W"],
          },
          {
            id: "kkr",
            name: "Kolkata Knight Riders",
            shortName: "KKR",
            logo: "/placeholder.svg?height=40&width=40",
            played: 10,
            won: 4,
            lost: 6,
            tied: 0,
            nrr: -0.15,
            points: 8,
            lastFive: ["L", "L", "W", "L", "W"],
          },
          {
            id: "rr",
            name: "Rajasthan Royals",
            shortName: "RR",
            logo: "/placeholder.svg?height=40&width=40",
            played: 10,
            won: 3,
            lost: 7,
            tied: 0,
            nrr: -0.3,
            points: 6,
            lastFive: ["L", "L", "W", "L", "L"],
          },
          {
            id: "srh",
            name: "Sunrisers Hyderabad",
            shortName: "SRH",
            logo: "/placeholder.svg?height=40&width=40",
            played: 10,
            won: 2,
            lost: 8,
            tied: 0,
            nrr: -0.5,
            points: 4,
            lastFive: ["L", "L", "W", "L", "L"],
            qualified: "eliminated",
          },
          {
            id: "pbks",
            name: "Punjab Kings",
            shortName: "PBKS",
            logo: "/placeholder.svg?height=40&width=40",
            played: 10,
            won: 1,
            lost: 9,
            tied: 0,
            nrr: -0.85,
            points: 2,
            lastFive: ["L", "L", "L", "L", "W"],
            qualified: "eliminated",
          },
        ]

        setStandings(mockStandings)
      } catch (err) {
        console.error("Error fetching standings:", err)
        setError("Failed to load standings. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStandings()
  }, [])

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">IPL Standings</h1>
        <p className="text-muted-foreground">Current standings for IPL 2025</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team Standings</CardTitle>
          <CardDescription>Points table for the current IPL season</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Pos</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">P</TableHead>
                  <TableHead className="text-center">W</TableHead>
                  <TableHead className="text-center">L</TableHead>
                  <TableHead className="text-center">T</TableHead>
                  <TableHead className="text-center">NRR</TableHead>
                  <TableHead className="text-center">Pts</TableHead>
                  <TableHead className="text-center">Last 5</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((team, index) => (
                  <TableRow
                    key={team.id}
                    className={
                      team.qualified === "playoffs"
                        ? "bg-green-50 hover:bg-green-100"
                        : team.qualified === "eliminated"
                          ? "bg-red-50 hover:bg-red-100"
                          : ""
                    }
                  >
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <Link href={`/teams/${team.id}`} className="flex items-center gap-2 hover:underline">
                        <img
                          src={team.logo || "/placeholder.svg"}
                          alt={`${team.name} logo`}
                          className="h-8 w-8 object-contain"
                        />
                        <div>
                          <div className="font-medium">{team.name}</div>
                          <div className="text-xs text-muted-foreground">{team.shortName}</div>
                        </div>
                        {index === 0 && <Trophy className="h-4 w-4 text-amber-500 ml-1" />}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">{team.played}</TableCell>
                    <TableCell className="text-center font-medium text-green-600">{team.won}</TableCell>
                    <TableCell className="text-center font-medium text-red-600">{team.lost}</TableCell>
                    <TableCell className="text-center">{team.tied}</TableCell>
                    <TableCell className="text-center font-medium">
                      {team.nrr > 0 ? `+${team.nrr.toFixed(2)}` : team.nrr.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center font-bold">{team.points}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        {team.lastFive.map((result, i) => (
                          <div
                            key={i}
                            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              result === "W"
                                ? "bg-green-100 text-green-800"
                                : result === "L"
                                  ? "bg-red-100 text-red-800"
                                  : result === "T"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {result}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-100"></div>
          <span>Qualified for playoffs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-100"></div>
          <span>Eliminated from tournament</span>
        </div>
      </div>
    </div>
  )
}

