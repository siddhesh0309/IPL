"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Share } from "lucide-react"
import { usePolls } from "@/contexts/poll-context"
import type { Poll } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

export default function PollResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { fetchPoll, isLoading } = usePolls()

  const [poll, setPoll] = useState<Poll | null>(null)
  const [loadingError, setLoadingError] = useState<string | null>(null)

  // Mock data for Man of the Match results
  const [motmResults, setMotmResults] = useState<
    Array<{ name: string; team: string; votes: number; percentage: number }>
  >([
    { name: "Rohit Sharma", team: "Mumbai Indians", votes: 312, percentage: 25 },
    { name: "MS Dhoni", team: "Chennai Super Kings", votes: 375, percentage: 30 },
    { name: "Jasprit Bumrah", team: "Mumbai Indians", votes: 188, percentage: 15 },
    { name: "Ravindra Jadeja", team: "Chennai Super Kings", votes: 125, percentage: 10 },
    { name: "Hardik Pandya", team: "Mumbai Indians", votes: 125, percentage: 10 },
    { name: "Ruturaj Gaikwad", team: "Chennai Super Kings", votes: 125, percentage: 10 },
  ])

  useEffect(() => {
    const loadPoll = async () => {
      try {
        const pollData = await fetchPoll(params.id)
        setPoll(pollData)
      } catch (error) {
        console.error("Error loading poll:", error)
        setLoadingError("Failed to load poll results. Please try again.")
      }
    }

    loadPoll()
  }, [fetchPoll, params.id])

  const handleExportResults = () => {
    toast({
      title: "Results exported",
      description: "Poll results have been exported to CSV",
    })
  }

  const handleShareResults = () => {
    // Copy the current URL to clipboard
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copied",
      description: "Results link has been copied to clipboard",
    })
  }

  if (isLoading || !poll) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate percentages for team votes
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0)
  const optionsWithPercentage = poll.options.map((option) => ({
    ...option,
    percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0,
  }))

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Poll Results</h1>
      </div>

      {loadingError && (
        <Alert variant="destructive">
          <AlertDescription>{loadingError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            {poll.team1} vs {poll.team2}
          </h2>
          <p className="text-muted-foreground">
            {new Date(poll.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportResults}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareResults}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Tabs defaultValue="match-winner">
        <TabsList>
          <TabsTrigger value="match-winner">Match Winner</TabsTrigger>
          <TabsTrigger value="motm">Man of the Match</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>
        <TabsContent value="match-winner">
          <Card>
            <CardHeader>
              <CardTitle>Match Winner Predictions</CardTitle>
              <CardDescription>
                Total votes: {totalVotes} • Poll {new Date(poll.pollEndTime) < new Date() ? "ended" : "ends"} on{" "}
                {new Date(poll.pollEndTime).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {optionsWithPercentage.map((option) => (
                <div key={option.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{option.text}</div>
                    <div className="text-sm font-medium">{option.percentage}%</div>
                  </div>
                  <div className="space-y-1">
                    <Progress value={option.percentage} className="h-3" />
                    <div className="text-xs text-muted-foreground">{option.votes} votes</div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                {poll.status === "completed"
                  ? `Final result: ${poll.team1} won the match`
                  : "Match result will be updated after the game is completed"}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="motm">
          <Card>
            <CardHeader>
              <CardTitle>Man of the Match Predictions</CardTitle>
              <CardDescription>
                Total votes: {motmResults.reduce((sum, player) => sum + player.votes, 0)} • Poll{" "}
                {new Date(poll.pollEndTime) < new Date() ? "ended" : "ends"} on{" "}
                {new Date(poll.pollEndTime).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {motmResults.map((player) => (
                <div key={player.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">
                      {player.name} <span className="text-sm text-muted-foreground">({player.team})</span>
                    </div>
                    <div className="text-sm font-medium">{player.percentage}%</div>
                  </div>
                  <div className="space-y-1">
                    <Progress value={player.percentage} className="h-3" />
                    <div className="text-xs text-muted-foreground">{player.votes} votes</div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                {poll.status === "completed"
                  ? "Final result: MS Dhoni was awarded Man of the Match"
                  : "Man of the Match will be updated after the game is completed"}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="demographics">
          <Card>
            <CardHeader>
              <CardTitle>Voter Demographics</CardTitle>
              <CardDescription>Analysis of voting patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Votes by Age Group</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">18-24 years</div>
                    <div className="text-sm font-medium">35%</div>
                  </div>
                  <Progress value={35} className="h-3" />
                  <div className="text-xs text-muted-foreground">437 votes</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">25-34 years</div>
                    <div className="text-sm font-medium">42%</div>
                  </div>
                  <Progress value={42} className="h-3" />
                  <div className="text-xs text-muted-foreground">525 votes</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">35-44 years</div>
                    <div className="text-sm font-medium">15%</div>
                  </div>
                  <Progress value={15} className="h-3" />
                  <div className="text-xs text-muted-foreground">187 votes</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">45+ years</div>
                    <div className="text-sm font-medium">8%</div>
                  </div>
                  <Progress value={8} className="h-3" />
                  <div className="text-xs text-muted-foreground">100 votes</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Votes by Location</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Mumbai</div>
                    <div className="text-sm font-medium">28%</div>
                  </div>
                  <Progress value={28} className="h-3" />
                  <div className="text-xs text-muted-foreground">350 votes</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Chennai</div>
                    <div className="text-sm font-medium">25%</div>
                  </div>
                  <Progress value={25} className="h-3" />
                  <div className="text-xs text-muted-foreground">312 votes</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Delhi</div>
                    <div className="text-sm font-medium">18%</div>
                  </div>
                  <Progress value={18} className="h-3" />
                  <div className="text-xs text-muted-foreground">225 votes</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Other</div>
                    <div className="text-sm font-medium">29%</div>
                  </div>
                  <Progress value={29} className="h-3" />
                  <div className="text-xs text-muted-foreground">362 votes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

