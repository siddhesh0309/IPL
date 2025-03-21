"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Trophy } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

type LeaderboardUser = {
  id: string
  name: string
  username: string
  points: number
  correctPredictions: number
  rank: number
  avatar: string | null
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("points")
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch leaderboard data from the API
        const response = await fetch("/api/leaderboard")
        if (!response.ok) throw new Error("Failed to fetch leaderboard")

        const data = await response.json()
        setLeaderboardData(
          data.users.map((user: any) => ({
            id: user.id,
            name: user.name,
            username: user.username || user.name.toLowerCase().replace(/\s+/g, ""),
            points: user.points,
            correctPredictions: user.predictions || 0,
            rank: user.rank || 0,
            avatar: user.avatar || null,
          })),
        )

        // Find current user's rank if logged in
        if (user) {
          const currentUser = data.users.find((u: any) => u.id === user.id)
          if (currentUser) {
            setUserRank(currentUser.rank)
          } else {
            // If user not in top leaderboard, fetch their rank separately
            const userRankResponse = await fetch(`/api/statistics/user?userId=${user.id}`)
            if (userRankResponse.ok) {
              const userStats = await userRankResponse.json()
              setUserRank(userStats.rank)
            }
          }
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err)
        setError("Failed to load leaderboard data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [user])

  // Filter and sort the leaderboard data
  const filteredData = leaderboardData.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === "points") {
      return b.points - a.points
    } else if (sortBy === "predictions") {
      return b.correctPredictions - a.correctPredictions
    } else {
      return a.rank - b.rank
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Top Predictors</CardTitle>
          <CardDescription>See who's leading in IPL predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank">Rank</SelectItem>
                <SelectItem value="points">Points</SelectItem>
                <SelectItem value="predictions">Correct Predictions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <>
              {/* Top 3 Users Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[0, 1, 2].map((index) => (
                  <Card key={index} className="overflow-hidden">
                    <div
                      className={`h-2 ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-700"}`}
                    ></div>
                    <CardContent className="pt-6 text-center">
                      <div className="flex justify-center mb-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                      </div>
                      <Skeleton className="h-6 w-32 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto mb-4" />
                      <Skeleton className="h-6 w-16 mx-auto mb-2" />
                      <Skeleton className="h-4 w-40 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Leaderboard Table Skeleton */}
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Rank
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Points
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Correct Predictions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-6 w-6" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Skeleton className="h-8 w-8 rounded-full mr-3" />
                            <div>
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-4 w-24 mt-1" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-6 w-12" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-6 w-8" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              {/* Top 3 Users */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {sortedData.slice(0, 3).map((user, index) => (
                  <Card
                    key={user.id}
                    className={`overflow-hidden ${index === 0 ? "border-yellow-500" : index === 1 ? "border-gray-400" : "border-amber-700"}`}
                  >
                    <div
                      className={`h-2 ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-700"}`}
                    ></div>
                    <CardContent className="pt-6 text-center">
                      <div className="flex justify-center mb-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={user.avatar || undefined} alt={user.name} />
                          <AvatarFallback className="text-2xl">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge
                          className={`${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-700"}`}
                        >
                          #{user.rank}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      <div className="mt-4 flex justify-center items-center">
                        <Trophy className="h-5 w-5 mr-2 text-primary" />
                        <span className="text-2xl font-bold">{user.points}</span>
                        <span className="text-sm text-muted-foreground ml-1">points</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {user.correctPredictions} correct predictions
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Leaderboard Table */}
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Rank
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Points
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Correct Predictions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedData.map((user, index) => (
                      <tr
                        key={user.id}
                        className={index < 3 ? "bg-gray-50" : user.id === (user?.id || "") ? "bg-blue-50" : ""}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index < 3 ? (
                              <Badge
                                className={`${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-700"}`}
                              >
                                #{user.rank}
                              </Badge>
                            ) : (
                              <span className="font-medium">#{user.rank}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarImage src={user.avatar || undefined} alt={user.name} />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold">{user.points}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>{user.correctPredictions}</div>
                        </td>
                      </tr>
                    ))}

                    {/* If user is not in the top list, show their rank at the bottom */}
                    {userRank && userRank > sortedData.length && user && (
                      <>
                        <tr>
                          <td colSpan={4} className="px-6 py-2 text-center text-sm text-gray-500">
                            ...
                          </td>
                        </tr>
                        <tr className="bg-blue-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-medium">#{userRank}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarFallback>
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">@{user.username || "you"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg font-bold">350</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>18</div>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

