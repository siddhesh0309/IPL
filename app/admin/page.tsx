"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, Users, BarChart3, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminPollForm } from "@/components/admin-poll-form"

// Mock data
const polls = [
  {
    id: 1,
    matchId: 1,
    type: "winner",
    question: "Who will win the match?",
    options: [
      { id: 1, text: "Mumbai Indians", votes: 245 },
      { id: 2, text: "Chennai Super Kings", votes: 312 },
    ],
    totalVotes: 557,
    status: "ACTIVE",
    expiresAt: "2025-04-10T17:30:00",
  },
  {
    id: 2,
    matchId: 1,
    type: "motm",
    question: "Who will be the Man of the Match?",
    options: [
      { id: 1, text: "Rohit Sharma", votes: 156 },
      { id: 2, text: "Jasprit Bumrah", votes: 98 },
      { id: 3, text: "MS Dhoni", votes: 203 },
      { id: 4, text: "Ravindra Jadeja", votes: 87 },
    ],
    totalVotes: 544,
    status: "ACTIVE",
    expiresAt: "2025-04-10T17:30:00",
  },
  {
    id: 3,
    matchId: 2,
    type: "winner",
    question: "Who will win the match?",
    options: [
      { id: 1, text: "Royal Challengers Bangalore", votes: 189 },
      { id: 2, text: "Kolkata Knight Riders", votes: 167 },
    ],
    totalVotes: 356,
    status: "closed",
    expiresAt: "2025-04-05T17:30:00",
  },
]

const matches = [
  {
    id: 1,
    team1: "Mumbai Indians",
    team2: "Chennai Super Kings",
    date: "2025-04-10T18:30:00",
    venue: "Wankhede Stadium, Mumbai",
    status: "upcoming",
  },
  {
    id: 2,
    team1: "Royal Challengers Bangalore",
    team2: "Kolkata Knight Riders",
    date: "2025-04-12T14:00:00",
    venue: "M. Chinnaswamy Stadium, Bangalore",
    status: "upcoming",
  },
  {
    id: 3,
    team1: "Delhi Capitals",
    team2: "Rajasthan Royals",
    date: "2025-04-15T18:30:00",
    venue: "Arun Jaitley Stadium, Delhi",
    status: "upcoming",
  },
  {
    id: 4,
    team1: "Sunrisers Hyderabad",
    team2: "Punjab Kings",
    date: "2025-04-05T18:30:00",
    venue: "Rajiv Gandhi Stadium, Hyderabad",
    status: "completed",
    result: "Sunrisers Hyderabad won by 7 wickets",
  },
]

const users = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "user", predictions: 24, points: 350 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user", predictions: 32, points: 480 },
  { id: 3, name: "Admin User", email: "admin@example.com", role: "admin", predictions: 28, points: 420 },
  { id: 4, name: "Bob Johnson", email: "bob@example.com", role: "user", predictions: 18, points: 270 },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("polls")
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false)
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          {activeTab === "polls" && (
            <Button onClick={() => setIsCreatePollOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Poll
            </Button>
          )}
          {activeTab === "matches" && (
            <Button onClick={() => setIsCreateMatchOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Match
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="polls" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 md:grid-cols-3 h-auto">
          <TabsTrigger value="polls">
            <BarChart3 className="mr-2 h-4 w-4" />
            Polls
          </TabsTrigger>
          <TabsTrigger value="matches">
            <Calendar className="mr-2 h-4 w-4" />
            Matches
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="polls" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Polls</CardTitle>
              <CardDescription>Create, edit, and manage polls for IPL matches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {polls.map((poll) => (
                  <div
                    key={poll.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex flex-col mb-4 md:mb-0">
                      <div className="font-medium">{poll.question}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {poll.totalVotes} votes • Expires: {new Date(poll.expiresAt).toLocaleString()}
                      </div>
                      <div className="flex items-center mt-2">
                        <Badge variant={poll.status === "ACTIVE" ? "default" : "secondary"}>
                          {poll.status === "ACTIVE" ? "Active" : "Closed"}
                        </Badge>
                        <Badge variant="outline" className="ml-2">
                          {poll.type === "winner" ? "Match Winner" : "Man of the Match"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Matches</CardTitle>
              <CardDescription>Add and edit IPL match details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex flex-col mb-4 md:mb-0">
                      <div className="font-medium">
                        {match.team1} vs {match.team2}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {new Date(match.date).toLocaleString()} • {match.venue}
                      </div>
                      <div className="mt-2">
                        <Badge variant={match.status === "upcoming" ? "default" : "secondary"}>
                          {match.status === "upcoming" ? "Upcoming" : "Completed"}
                        </Badge>
                        {match.result && <div className="text-sm mt-1">{match.result}</div>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Predictions
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
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.predictions}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.points}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Poll Dialog */}
      <Dialog open={isCreatePollOpen} onOpenChange={setIsCreatePollOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Poll</DialogTitle>
            <DialogDescription>Create a new poll for an upcoming IPL match</DialogDescription>
          </DialogHeader>
          <AdminPollForm
            matches={matches.filter((m) => m.status === "upcoming")}
            onSubmit={() => setIsCreatePollOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Create Match Dialog */}
      <Dialog open={isCreateMatchOpen} onOpenChange={setIsCreateMatchOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Match</DialogTitle>
            <DialogDescription>Add details for an upcoming IPL match</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team1">Team 1</Label>
                <Select>
                  <SelectTrigger id="team1">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mi">Mumbai Indians</SelectItem>
                    <SelectItem value="csk">Chennai Super Kings</SelectItem>
                    <SelectItem value="rcb">Royal Challengers Bangalore</SelectItem>
                    <SelectItem value="kkr">Kolkata Knight Riders</SelectItem>
                    <SelectItem value="dc">Delhi Capitals</SelectItem>
                    <SelectItem value="rr">Rajasthan Royals</SelectItem>
                    <SelectItem value="srh">Sunrisers Hyderabad</SelectItem>
                    <SelectItem value="pbks">Punjab Kings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team2">Team 2</Label>
                <Select>
                  <SelectTrigger id="team2">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mi">Mumbai Indians</SelectItem>
                    <SelectItem value="csk">Chennai Super Kings</SelectItem>
                    <SelectItem value="rcb">Royal Challengers Bangalore</SelectItem>
                    <SelectItem value="kkr">Kolkata Knight Riders</SelectItem>
                    <SelectItem value="dc">Delhi Capitals</SelectItem>
                    <SelectItem value="rr">Rajasthan Royals</SelectItem>
                    <SelectItem value="srh">Sunrisers Hyderabad</SelectItem>
                    <SelectItem value="pbks">Punjab Kings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" placeholder="Enter match venue" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateMatchOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setIsCreateMatchOpen(false)}>
              Add Match
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

