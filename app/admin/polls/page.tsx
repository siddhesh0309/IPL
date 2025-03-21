"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { usePolls } from "@/contexts/poll-context"
import type { Poll } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Calendar, ChevronRight, Clock, Edit, Eye, Filter, PlusCircle, Search, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function AdminPollsPage() {
  const { toast } = useToast()
  const { fetchPolls, deletePoll, isLoading, error } = usePolls()

  const [polls, setPolls] = useState<Poll[]>([])
  const [activeTab, setActiveTab] = useState("active")
  const [searchTerm, setSearchTerm] = useState("")
  const [teamFilter, setTeamFilter] = useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)

  useEffect(() => {
    const loadPolls = async () => {
      try {
        const fetchedPolls = await fetchPolls()
        setPolls(fetchedPolls)
      } catch (error) {
        console.error("Error loading polls:", error)
      }
    }

    loadPolls()
  }, [fetchPolls])

  // Filter polls based on active tab, search term, and team filter
  const filteredPolls = polls.filter((poll) => {
    // Filter by status based on active tab
    if (activeTab === "active" && poll.status !== "ACTIVE") return false
    if (activeTab === "upcoming" && poll.status !== "UPCOMING") return false
    if (activeTab === "completed" && poll.status !== "COMPLETED") return false

    // Filter by search term
    if (
      searchTerm &&
      !poll.team1.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !poll.team2.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !poll.venue.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    // Filter by team
    if (teamFilter !== "all") {
      const teamName = teamFilter.toLowerCase()
      if (!poll.team1.toLowerCase().includes(teamName) && !poll.team2.toLowerCase().includes(teamName)) {
        return false
      }
    }

    return true
  })

  const handleDeletePoll = (poll: Poll) => {
    setSelectedPoll(poll)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeletePoll = async () => {
    if (!selectedPoll) return

    try {
      await deletePoll(selectedPoll.id)

      // Update local state
      setPolls(polls.filter((p) => p.id !== selectedPoll.id))

      toast({
        title: "Poll deleted",
        description: `Poll for ${selectedPoll.team1} vs ${selectedPoll.team2} has been deleted.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete poll. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedPoll(null)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Polls</h1>
          <p className="text-muted-foreground">Create, edit, and manage polls for IPL matches</p>
        </div>
        <Link href="/admin/polls/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Poll
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search polls..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 h-auto">
          <TabsTrigger value="active">Active Polls</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Polls</CardTitle>
              <CardDescription>Currently open for voting</CardDescription>
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
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-60 mb-1" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPolls.length > 0 ? (
                <div className="space-y-4">
                  {filteredPolls.map((poll) => (
                    <div
                      key={poll.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex flex-col mb-4 md:mb-0">
                        <div className="font-medium">
                          {poll.team1} vs {poll.team2}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(poll.date).toLocaleDateString()}
                          <span className="mx-2">•</span>
                          <Clock className="mr-1 h-4 w-4" />
                          {new Date(poll.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{poll.totalVotes} votes</Badge>
                          <Badge>Active</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="mr-2 h-4 w-4" />
                              Manage
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/polls/${poll.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Poll
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/polls/${poll.id}/results`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Results
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeletePoll(poll)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Poll
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Link href={`/admin/polls/${poll.id}/results`}>
                          <Button>
                            Results
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No active polls found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Polls</CardTitle>
              <CardDescription>Polls for upcoming matches</CardDescription>
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
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-60 mb-1" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPolls.length > 0 ? (
                <div className="space-y-4">
                  {filteredPolls.map((poll) => (
                    <div
                      key={poll.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex flex-col mb-4 md:mb-0">
                        <div className="font-medium">
                          {poll.team1} vs {poll.team2}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(poll.date).toLocaleDateString()}
                          <span className="mx-2">•</span>
                          <Clock className="mr-1 h-4 w-4" />
                          {new Date(poll.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="mt-1">
                          <Badge variant="secondary">Upcoming</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDeletePoll(poll)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                        <Link href={`/admin/polls/${poll.id}/edit`}>
                          <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming polls found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Polls</CardTitle>
              <CardDescription>Polls for completed matches</CardDescription>
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
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-60 mb-1" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPolls.length > 0 ? (
                <div className="space-y-4">
                  {filteredPolls.map((poll) => (
                    <div
                      key={poll.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex flex-col mb-4 md:mb-0">
                        <div className="font-medium">
                          {poll.team1} vs {poll.team2}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(poll.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{poll.totalVotes} votes</Badge>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                        <div className="text-sm font-medium mt-1">Result: {poll.team1} won</div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/admin/polls/${poll.id}/results`}>
                          <Button variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View Results
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No completed polls found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Poll Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Poll</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this poll? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPoll && (
            <div className="py-2">
              <p className="font-medium">
                {selectedPoll.team1} vs {selectedPoll.team2}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(selectedPoll.date).toLocaleDateString()} • {selectedPoll.venue}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeletePoll}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

