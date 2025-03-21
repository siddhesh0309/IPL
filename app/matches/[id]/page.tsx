"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, Clock, MapPin, MessageSquare, Share, ThumbsUp, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

type MatchDetails = {
  id: string
  team1: string
  team2: string
  date: string
  venue: string
  status: "upcoming" | "live" | "completed"
  result?: string
  polls: Array<{
    id: string
    type: "winner" | "motm"
    question: string
    status: "active" | "closed"
    totalVotes: number
  }>
  stats?: {
    team1Score?: string
    team2Score?: string
    manOfTheMatch?: string
    keyMoments?: Array<{
      time: string
      description: string
    }>
  }
  comments: Array<{
    id: string
    userId: string
    userName: string
    userAvatar?: string
    text: string
    timestamp: string
    likes: number
    hasLiked?: boolean
  }>
}

export default function MatchDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [match, setMatch] = useState<MatchDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    const fetchMatchDetails = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch match details from the API
        const response = await fetch(`/api/matches/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch match details")

        const matchData = await response.json()
        setMatch(matchData)

        // Fetch comments if available
        if (matchData.id) {
          const commentsResponse = await fetch(`/api/matches/${matchData.id}/comments`)
          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json()
            setMatch((prev) => (prev ? { ...prev, comments: commentsData } : null))
          }
        }
      } catch (err) {
        console.error("Error fetching match details:", err)
        setError("Failed to load match details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMatchDetails()
  }, [params.id])

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !match || !user) return

    setIsSubmittingComment(true)

    try {
      const response = await fetch(`/api/matches/${match.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      })

      if (!response.ok) throw new Error("Failed to post comment")

      const newComment = await response.json()

      // Update local state
      setMatch({
        ...match,
        comments: [newComment, ...(match.comments || [])],
      })

      setCommentText("")

      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      })
    } catch (error) {
      console.error("Error posting comment:", error)
      toast({
        title: "Error",
        description: "Failed to post your comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!match) return

    try {
      // In a real app, this would be an API call
      // await fetch(`/api/comments/${commentId}/like`, { method: 'POST' })

      // Update local state
      setMatch({
        ...match,
        comments: match.comments.map((comment) => {
          if (comment.id === commentId) {
            const hasLiked = comment.hasLiked || false
            return {
              ...comment,
              likes: hasLiked ? comment.likes - 1 : comment.likes + 1,
              hasLiked: !hasLiked,
            }
          }
          return comment
        }),
      })
    } catch (error) {
      console.error("Error liking comment:", error)
      toast({
        title: "Error",
        description: "Failed to like the comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShareMatch = () => {
    // Copy the current URL to clipboard
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copied",
      description: "Match link has been copied to clipboard",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Match Details</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : match ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-xl">
                    {match.team1} vs {match.team2}
                  </CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(match.date)}
                    </div>
                    <div className="hidden sm:block">•</div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {formatTime(match.date)}
                    </div>
                  </CardDescription>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="mr-1 h-4 w-4" />
                    {match.venue}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      match.status === "live" ? "destructive" : match.status === "upcoming" ? "default" : "secondary"
                    }
                  >
                    {match.status === "live" ? "LIVE" : match.status === "upcoming" ? "Upcoming" : "Completed"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleShareMatch}>
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {match.status === "completed" && match.result && (
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <h3 className="font-medium">Match Result</h3>
                  <p>{match.result}</p>
                  {match.stats?.manOfTheMatch && (
                    <p className="mt-2">
                      Man of the Match: <span className="font-medium">{match.stats.manOfTheMatch}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>{match.polls.reduce((sum, poll) => sum + poll.totalVotes, 0)} total votes on polls</span>
                </div>
                <div className="flex gap-2">
                  {match.polls.some((poll) => poll.status === "active") && (
                    <Button asChild>
                      <Link href={`/polls/${match.polls[0].id}`}>Vote Now</Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="polls">
            <TabsList>
              <TabsTrigger value="polls">Polls</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
              {match.status === "completed" && <TabsTrigger value="stats">Match Stats</TabsTrigger>}
            </TabsList>
            <TabsContent value="polls" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {match.polls.map((poll) => (
                  <Card key={poll.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{poll.question}</CardTitle>
                      <CardDescription>
                        {poll.totalVotes} votes • {poll.status === "active" ? "Active" : "Closed"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {poll.type === "winner"
                          ? "Predict which team will win this match."
                          : "Predict which player will be awarded Man of the Match."}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/polls/${poll.id}`}>{poll.status === "active" ? "Vote Now" : "View Results"}</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="discussion">
              <Card>
                <CardHeader>
                  <CardTitle>Discussion</CardTitle>
                  <CardDescription>Join the conversation about this match</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {user ? (
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <textarea
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Share your thoughts about this match..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end">
                          <Button onClick={handleSubmitComment} disabled={isSubmittingComment || !commentText.trim()}>
                            {isSubmittingComment ? "Posting..." : "Post Comment"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-2">Login to join the discussion</p>
                      <Button asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4 mt-6">
                    {match.comments.length > 0 ? (
                      match.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-4 border rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {comment.userName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{comment.userName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(comment.timestamp).toLocaleString()}
                                </p>
                              </div>
                              {user && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLikeComment(comment.id)}
                                  className={comment.hasLiked ? "text-primary" : ""}
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  {comment.likes}
                                </Button>
                              )}
                            </div>
                            <p className="mt-2">{comment.text}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {match.status === "completed" && (
              <TabsContent value="stats">
                <Card>
                  <CardHeader>
                    <CardTitle>Match Statistics</CardTitle>
                    <CardDescription>Detailed statistics for this match</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {match.stats ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">{match.team1}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xl font-bold">{match.stats.team1Score || "N/A"}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">{match.team2}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xl font-bold">{match.stats.team2Score || "N/A"}</p>
                            </CardContent>
                          </Card>
                        </div>

                        {match.stats.keyMoments && match.stats.keyMoments.length > 0 && (
                          <div>
                            <h3 className="text-lg font-medium mb-4">Key Moments</h3>
                            <div className="space-y-4">
                              {match.stats.keyMoments.map((moment, index) => (
                                <div key={index} className="flex gap-4 p-4 border rounded-lg">
                                  <div className="font-medium">{moment.time}</div>
                                  <div>{moment.description}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Detailed statistics not available yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      ) : (
        <Alert>
          <AlertDescription>Match not found.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

