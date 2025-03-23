"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, CheckCircle, Search, XCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Prediction = {
  id: string
  teams: string
  date: string
  prediction: string
  actual: string
  isCorrect: boolean
  type: string
  points: number
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/users/${user.id}/predictions`)

        if (!response.ok) {
          throw new Error("Failed to fetch predictions")
        }

        const data = await response.json()
        setPredictions(data.predictions)
      } catch (err) {
        console.error("Error fetching predictions:", err)
        setError("Failed to load your prediction history. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPredictions()
  }, [user])

  // Filter predictions based on search term and filter
  const filteredPredictions = predictions.filter((prediction) => {
    const matchesSearch =
      prediction.teams.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prediction.prediction.toLowerCase().includes(searchTerm.toLowerCase())

    if (filter === "all") return matchesSearch
    if (filter === "correct") return matchesSearch && prediction.isCorrect
    if (filter === "incorrect") return matchesSearch && !prediction.isCorrect

    return matchesSearch
  })

  // Filter predictions by type
  const getFilteredByType = (type: string) => {
    return filteredPredictions.filter((prediction) => prediction.type === type)
  }

  // Calculate stats
  const totalPredictions = predictions.length
  const correctPredictions = predictions.filter((p) => p.isCorrect).length
  const accuracyRate = totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0
  const totalPoints = predictions.reduce((sum, p) => sum + p.points, 0)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Predictions</h1>
          <p className="text-muted-foreground">View your prediction history and results</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search predictions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Predictions</SelectItem>
              <SelectItem value="correct">Correct Only</SelectItem>
              <SelectItem value="incorrect">Incorrect Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Predictions"
          value={totalPredictions.toString()}
          description="Predictions made so far"
          isLoading={isLoading}
        />
        <StatCard
          title="Correct Predictions"
          value={`${correctPredictions} (${accuracyRate}%)`}
          description="Accuracy rate"
          variant="success"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Points"
          value={totalPoints.toString()}
          description="Current leaderboard points"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Predictions</TabsTrigger>
          <TabsTrigger value="match-winners">Match Winners</TabsTrigger>
          <TabsTrigger value="motm">Man of the Match</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prediction History</CardTitle>
              <CardDescription>All your past predictions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex flex-col mb-4 md:mb-0">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : filteredPredictions.length > 0 ? (
                <div className="space-y-4">
                  {filteredPredictions.map((prediction) => (
                    <PredictionItem
                      key={prediction.id}
                      teams={prediction.teams}
                      date={prediction.date}
                      prediction={prediction.prediction}
                      actual={prediction.actual}
                      isCorrect={prediction.isCorrect}
                      type={prediction.type}
                      points={prediction.points}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No predictions found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="match-winners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Match Winner Predictions</CardTitle>
              <CardDescription>Your predictions for match winners</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex flex-col mb-4 md:mb-0">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : getFilteredByType("Match Winner").length > 0 ? (
                <div className="space-y-4">
                  {getFilteredByType("Match Winner").map((prediction) => (
                    <PredictionItem
                      key={prediction.id}
                      teams={prediction.teams}
                      date={prediction.date}
                      prediction={prediction.prediction}
                      actual={prediction.actual}
                      isCorrect={prediction.isCorrect}
                      type={prediction.type}
                      points={prediction.points}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No match winner predictions found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="motm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Man of the Match Predictions</CardTitle>
              <CardDescription>Your predictions for Man of the Match</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex flex-col mb-4 md:mb-0">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : getFilteredByType("MOTM").length > 0 ? (
                <div className="space-y-4">
                  {getFilteredByType("MOTM").map((prediction) => (
                    <PredictionItem
                      key={prediction.id}
                      teams={prediction.teams}
                      date={prediction.date}
                      prediction={prediction.prediction}
                      actual={prediction.actual}
                      isCorrect={prediction.isCorrect}
                      type={prediction.type}
                      points={prediction.points}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No Man of the Match predictions found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  variant,
  isLoading,
}: {
  title: string
  value: string
  description: string
  variant?: "default" | "success"
  isLoading?: boolean
}) {
  return (
    <Card className={variant === "success" ? "border-green-500/50" : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function PredictionItem({
  teams,
  date,
  prediction,
  actual,
  isCorrect,
  type,
  points,
}: {
  teams: string
  date: string
  prediction: string
  actual: string
  isCorrect: boolean
  type: string
  points: number
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg">
      <div className="flex flex-col mb-4 md:mb-0">
        <div className="font-medium">{teams}</div>
        <div className="text-sm text-muted-foreground flex items-center mt-1">
          <CalendarDays className="mr-1 h-4 w-4" />
          {date}
          <Badge variant="outline" className="ml-2">
            {type}
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
          <div className="text-sm">
            Your prediction: <span className="font-medium">{prediction}</span>
          </div>
          <div className="text-sm">
            Actual result: <span className="font-medium">{actual}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isCorrect ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-1" />
            <span className="font-medium">+{points} pts</span>
          </div>
        ) : (
          <div className="flex items-center text-red-500">
            <XCircle className="h-5 w-5 mr-1" />
            <span className="font-medium">0 pts</span>
          </div>
        )}
      </div>
    </div>
  )
}


const mockPredictions: Prediction[] = [
  {
    id: "1",
    teams: "Mumbai Indians vs Chennai Super Kings",
    date: "Mar 19, 2025",
    prediction: "Mumbai Indians",
    actual: "Mumbai Indians",
    isCorrect: true,
    type: "Match Winner",
    points: 30,
  },
  {
    id: "2",
    teams: "Mumbai Indians vs Chennai Super Kings",
    date: "Mar 19, 2025",
    prediction: "Rohit Sharma",
    actual: "Jasprit Bumrah",
    isCorrect: false,
    type: "Man of the Match",
    points: 0,
  },
  {
    id: "3",
    teams: "Kolkata Knight Riders vs Punjab Kings",
    date: "Mar 18, 2025",
    prediction: "Kolkata Knight Riders",
    actual: "Punjab Kings",
    isCorrect: false,
    type: "Match Winner",
    points: 0,
  },
  {
    id: "4",
    teams: "Delhi Capitals vs Rajasthan Royals",
    date: "Mar 17, 2025",
    prediction: "Delhi Capitals",
    actual: "Delhi Capitals",
    isCorrect: true,
    type: "Match Winner",
    points: 30,
  },
  {
    id: "5",
    teams: "Delhi Capitals vs Rajasthan Royals",
    date: "Mar 17, 2025",
    prediction: "Rishabh Pant",
    actual: "Rishabh Pant",
    isCorrect: true,
    type: "Man of the Match",
    points: 50,
  },
]
