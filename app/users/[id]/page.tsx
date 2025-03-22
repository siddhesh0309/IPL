"use client"

import Link from "next/link"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Calendar, CheckCircle, Trophy, XCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

type UserProfile = {
  id: string
  name: string
  username: string
  bio: string
  joinedDate: string
  predictions: {
    total: number
    correct: number
    accuracy: number
  }
  points: number
  rank: number
  recentPredictions: Array<{
    id: string
    match: string
    date: string
    prediction: string
    actual: string
    isCorrect: boolean
    points: number
  }>
}

export default function UserProfilePage({ params }) {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCurrentUser, setIsCurrentUser] = useState(false)

  params == use(params)

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/users/${params.id}`)

        // Simulate API response with mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Check if this is the current user's profile
        if (user && user.id === params.id) {
          setIsCurrentUser(true)
        }

        const mockProfile: UserProfile = {
          id: params.id,
          name: "John Doe",
          username: "johndoe",
          bio: "Cricket enthusiast and IPL fan since 2008. Supporting Mumbai Indians all the way!",
          joinedDate: "2023-01-15",
          predictions: {
            total: 48,
            correct: 32,
            accuracy: 66.7,
          },
          points: 850,
          rank: 42,
          recentPredictions: [
            {
              id: "1",
              match: "Mumbai Indians vs Chennai Super Kings",
              date: "2025-03-20",
              prediction: "Mumbai Indians",
              actual: "Mumbai Indians",
              isCorrect: true,
              points: 30,
            },
            {
              id: "2",
              match: "Royal Challengers Bangalore vs Delhi Capitals",
              date: "2025-03-18",
              prediction: "Royal Challengers Bangalore",
              actual: "Delhi Capitals",
              isCorrect: false,
              points: 0,
            },
            {
              id: "3",
              match: "Kolkata Knight Riders vs Punjab Kings",
              date: "2025-03-15",
              prediction: "Kolkata Knight Riders",
              actual: "Kolkata Knight Riders",
              isCorrect: true,
              points: 30,
            },
          ],
        }

        setProfile(mockProfile)
      } catch (err) {
        console.error("Error fetching user profile:", err)
        setError("Failed to load user profile. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [params.id, user])

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
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
              <Skeleton className="h-24 w-24 rounded-full" />
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

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : profile ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row gap-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>
                <p>{profile.bio}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.joinedDate).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-bold">{profile.predictions.total}</div>
                    <p className="text-muted-foreground">Total Predictions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-bold">{profile.predictions.accuracy}%</div>
                    <p className="text-muted-foreground">Accuracy Rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-5 w-5 text-primary" />
                      <span className="text-3xl font-bold">{profile.points}</span>
                    </div>
                    <p className="text-muted-foreground">Points (Rank #{profile.rank})</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="recent">
            <TabsList>
              <TabsTrigger value="recent">Recent Predictions</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Predictions</CardTitle>
                  <CardDescription>Latest match predictions by {profile.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.recentPredictions.map((prediction) => (
                      <div
                        key={prediction.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex flex-col mb-4 md:mb-0">
                          <div className="font-medium">{prediction.match}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(prediction.date).toLocaleDateString()}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                            <div className="text-sm">
                              Prediction: <span className="font-medium">{prediction.prediction}</span>
                            </div>
                            <div className="text-sm">
                              Result: <span className="font-medium">{prediction.actual}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {prediction.isCorrect ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-5 w-5 mr-1" />
                              <span className="font-medium">+{prediction.points} pts</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-500">
                              <XCircle className="h-5 w-5 mr-1" />
                              <span className="font-medium">0 pts</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Prediction Statistics</CardTitle>
                  <CardDescription>Detailed statistics for {profile.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Prediction Accuracy by Team</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Mumbai Indians</span>
                            <span>75%</span>
                          </div>
                          <div className="bg-muted rounded-full h-2 w-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: "75%" }}></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Chennai Super Kings</span>
                            <span>60%</span>
                          </div>
                          <div className="bg-muted rounded-full h-2 w-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: "60%" }}></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Royal Challengers Bangalore</span>
                            <span>50%</span>
                          </div>
                          <div className="bg-muted rounded-full h-2 w-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: "50%" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Prediction Type Accuracy</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <h4 className="font-medium mb-2">Match Winner</h4>
                              <div className="text-3xl font-bold">68%</div>
                              <p className="text-sm text-muted-foreground">30 out of 44 correct</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <h4 className="font-medium mb-2">Man of the Match</h4>
                              <div className="text-3xl font-bold">42%</div>
                              <p className="text-sm text-muted-foreground">10 out of 24 correct</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {isCurrentUser && (
            <div className="flex justify-end">
              <Button asChild>
                <Link href="/profile">Edit Profile</Link>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Alert>
          <AlertDescription>User not found.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

