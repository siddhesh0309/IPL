"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { BarChart, LineChart, PieChart } from "@/components/charts"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Statistics = {
  users: {
    total: number
    active: number
    inactive: number
    admins: number
    growth: {
      daily: number
      weekly: number
      monthly: number
    }
    retention: number
  }
  polls: {
    total: number
    active: number
    completed: number
    totalVotes: number
    averageVotesPerPoll: number
    mostPopular: {
      id: string
      teams: string
      votes: number
    }
  }
  predictions: {
    total: number
    accuracy: {
      overall: number
      matchWinner: number
      manOfTheMatch: number
    }
    pointsAwarded: number
    averagePointsPerUser: number
  }
  teams: {
    mostPredicted: string
    mostAccurate: string
    leastAccurate: string
  }
}

export default function StatisticsPage() {
  const [timePeriod, setTimePeriod] = useState("all")
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/statistics?period=${timePeriod}`)

        if (!response.ok) {
          throw new Error("Failed to fetch statistics")
        }

        const data = await response.json()
        setStatistics(data)
      } catch (err) {
        console.error("Error fetching statistics:", err)
        setError("Failed to load statistics data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatistics()
  }, [timePeriod])

  // Calculate trend values
  const getTrend = (value: number, isPositive = true) => {
    return {
      value: isPositive ? `+${(value * 0.05).toFixed(1)}%` : `-${(value * 0.02).toFixed(1)}%`,
      isPositive,
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-muted-foreground">Analyze platform usage and prediction data</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="day">Last 24 Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))
          : statistics && (
              <>
                <StatCard
                  title="Total Users"
                  value={statistics.users.total.toString()}
                  trend={getTrend(statistics.users.growth.weekly)}
                />
                <StatCard
                  title="Active Polls"
                  value={statistics.polls.active.toString()}
                  trend={getTrend(statistics.polls.active, false)}
                  isPositive={false}
                />
                <StatCard
                  title="Total Votes"
                  value={statistics.polls.totalVotes.toLocaleString()}
                  trend={getTrend(statistics.polls.totalVotes)}
                />
                <StatCard
                  title="Avg. Accuracy"
                  value={`${statistics.predictions.accuracy.overall}%`}
                  trend={getTrend(statistics.predictions.accuracy.overall)}
                />
              </>
            )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="polls">Poll Statistics</TabsTrigger>
          <TabsTrigger value="predictions">Prediction Accuracy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {isLoading ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-60" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-60" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>New user registrations over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LineChart />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Votes by Poll Type</CardTitle>
                    <CardDescription>Distribution of votes across poll types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PieChart />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Activity</CardTitle>
                  <CardDescription>Daily active users and votes</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart />
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent className="space-y-6">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
              </CardContent>
            </Card>
          ) : (
            statistics && (
              <Card>
                <CardHeader>
                  <CardTitle>User Engagement</CardTitle>
                  <CardDescription>User activity metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Daily Active Users</span>
                      <span>
                        {Math.round(statistics.users.active * 0.38)} ({Math.round(0.38 * 100)}%)
                      </span>
                    </div>
                    <Progress value={38} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Weekly Active Users</span>
                      <span>
                        {Math.round(statistics.users.active * 0.6)} ({Math.round(0.6 * 100)}%)
                      </span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Active Users</span>
                      <span>
                        {Math.round(statistics.users.active * 0.87)} ({Math.round(0.87 * 100)}%)
                      </span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Predictions per User</span>
                      <span>{(statistics.predictions.total / statistics.users.total).toFixed(1)}</span>
                    </div>
                    <Progress value={71} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {isLoading ? (
              Array(2)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-4 w-60" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-64 w-full" />
                    </CardContent>
                  </Card>
                ))
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>User Retention</CardTitle>
                    <CardDescription>Return rate of users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LineChart />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>User Demographics</CardTitle>
                    <CardDescription>User distribution by activity level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PieChart />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="polls" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {isLoading
              ? Array(2)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-40 mb-2" />
                        <Skeleton className="h-4 w-60" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-64 w-full" />
                      </CardContent>
                    </Card>
                  ))
              : statistics && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Most Popular Polls</CardTitle>
                        <CardDescription>Polls with highest participation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>MI vs CSK (Mar 22)</span>
                            <span>1,245 votes</span>
                          </div>
                          <Progress value={92} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>RCB vs DC (Mar 24)</span>
                            <span>1,056 votes</span>
                          </div>
                          <Progress value={78} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>KKR vs PBKS (Mar 18)</span>
                            <span>987 votes</span>
                          </div>
                          <Progress value={73} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>GT vs LSG (Mar 19)</span>
                            <span>876 votes</span>
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Poll Participation Rate</CardTitle>
                        <CardDescription>Percentage of users voting in polls</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <LineChart />
                      </CardContent>
                    </Card>
                  </>
                )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Poll Type Distribution</CardTitle>
              <CardDescription>Votes by poll category</CardDescription>
            </CardHeader>
            <CardContent>{isLoading ? <Skeleton className="h-64 w-full" /> : <BarChart />}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prediction Accuracy</CardTitle>
              <CardDescription>User prediction success rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading
                ? Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))
                : statistics && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Match Winner Predictions</span>
                          <span>{statistics.predictions.accuracy.matchWinner}% accurate</span>
                        </div>
                        <Progress value={statistics.predictions.accuracy.matchWinner} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Man of the Match Predictions</span>
                          <span>{statistics.predictions.accuracy.manOfTheMatch}% accurate</span>
                        </div>
                        <Progress value={statistics.predictions.accuracy.manOfTheMatch} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Prediction Accuracy</span>
                          <span>{statistics.predictions.accuracy.overall}% accurate</span>
                        </div>
                        <Progress value={statistics.predictions.accuracy.overall} className="h-2" />
                      </div>
                    </>
                  )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {isLoading ? (
              Array(2)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-4 w-60" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-64 w-full" />
                    </CardContent>
                  </Card>
                ))
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Accuracy Trends</CardTitle>
                    <CardDescription>Prediction accuracy over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LineChart />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Team Prediction Bias</CardTitle>
                    <CardDescription>Most frequently predicted teams</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PieChart />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  title,
  value,
  trend,
  isPositive = true,
}: {
  title: string
  value: string
  trend: { value: string; isPositive: boolean }
  isPositive?: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${trend.isPositive ? "text-green-500" : "text-red-500"} flex items-center mt-1`}>
          {trend.value}
          <span className="ml-1">{trend.isPositive ? "↑" : "↓"}</span>
        </p>
      </CardContent>
    </Card>
  )
}

const mockStatistics: Statistics = {
  users: {
    total: 856,
    active: 742,
    inactive: 114,
    admins: 5,
    growth: {
      daily: 12,
      weekly: 68,
      monthly: 245,
    },
    retention: 87.5,
  },
  polls: {
    total: 48,
    active: 5,
    completed: 43,
    totalVotes: 12456,
    averageVotesPerPoll: 259.5,
    mostPopular: {
      id: "1",
      teams: "Mumbai Indians vs Chennai Super Kings",
      votes: 1245,
    },
  },
  predictions: {
    total: 8765,
    accuracy: {
      overall: 64.2,
      matchWinner: 68.4,
      manOfTheMatch: 42.7,
    },
    pointsAwarded: 245670,
    averagePointsPerUser: 286.8,
  },
  teams: {
    mostPredicted: "Mumbai Indians",
    mostAccurate: "Chennai Super Kings",
    leastAccurate: "Punjab Kings",
  },
}

