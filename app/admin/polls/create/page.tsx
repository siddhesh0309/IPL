"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

// Mock components for date and time pickers since they're not in the default shadcn/ui
function DatePicker({ value, onChange }: { value?: Date; onChange: (date: Date) => void }) {
  return (
    <Input
      type="date"
      value={value ? value.toISOString().split("T")[0] : ""}
      onChange={(e) => onChange(new Date(e.target.value))}
    />
  )
}

function TimePicker({ value, onChange }: { value?: string; onChange: (time: string) => void }) {
  return <Input type="time" value={value || ""} onChange={(e) => onChange(e.target.value)} />
}

export default function CreatePollPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchParam = searchParams.get("match")
  const { toast } = useToast()

  // Parse match parameter if available
  const initialTeams = matchParam
    ? matchParam.split("-vs-").map((team) =>
      team
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    )
    : ["Mumbai Indians", "Chennai Super Kings"]

  const [team1, setTeam1] = useState(initialTeams[0])
  const [team2, setTeam2] = useState(initialTeams[1])
  const [matchDate, setMatchDate] = useState<Date | undefined>(undefined)
  const [matchTime, setMatchTime] = useState<string | undefined>(undefined)
  const [venue, setVenue] = useState("")
  const [pollEndDate, setPollEndDate] = useState<Date | undefined>(undefined)
  const [pollEndTime, setPollEndTime] = useState<string | undefined>(undefined)
  const [players, setPlayers] = useState<Array<{ name: string; team: string }>>([
    { name: "", team: initialTeams[0] },
    { name: "", team: initialTeams[0] },
    { name: "", team: initialTeams[1] },
    { name: "", team: initialTeams[1] },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addPlayer = () => {
    setPlayers([...players, { name: "", team: team1 }])
  }

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index))
  }

  const updatePlayer = (index: number, field: "name" | "team", value: string) => {
    const updatedPlayers = [...players]
    updatedPlayers[index][field] = value
    setPlayers(updatedPlayers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!team1 || !team2 || !matchDate || !matchTime || !venue || !pollEndDate || !pollEndTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate players
    const validPlayers = players.filter((player) => player.name.trim() !== "")
    if (validPlayers.length < 4) {
      toast({
        title: "Not enough players",
        description: "Please add at least 4 players for Man of the Match selection",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Combine date and time for match and poll end
      const matchDateTime = new Date(matchDate!)
      const [hours, minutes] = matchTime!.split(":").map(Number)
      matchDateTime.setHours(hours, minutes)

      const pollEndDateTime = new Date(pollEndDate!)
      const [pollHours, pollMinutes] = pollEndTime!.split(":").map(Number)
      pollEndDateTime.setHours(pollHours, pollMinutes)

      // Create match first
      const matchResponse = await fetch("/api/admin/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team1,
          team2,
          venue,
          startTime: matchDateTime.toISOString(),
          status: "upcoming",
        }),
      })

      if (!matchResponse.ok) {
        const error = await matchResponse.json()
        throw new Error(error.message || "Failed to create match")
      }

      const matchData = await matchResponse.json()
      const matchId = matchData.id

      // Create winner poll
      const winnerPollResponse = await fetch("/api/admin/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId,
          type: "winner",
          question: `Who will win the match between ${team1} and ${team2}?`,
          options: [{ text: team1 }, { text: team2 }],
          expiresAt: pollEndDateTime.toISOString(),
          pointValue: 30,
        }),
      })

      if (!winnerPollResponse.ok) {
        const error = await winnerPollResponse.json()
        throw new Error(error.message || "Failed to create winner poll")
      }

      // Create man of the match poll
      const motmPollResponse = await fetch("/api/admin/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId,
          type: "motm",
          question: `Who will be the Man of the Match for ${team1} vs ${team2}?`,
          options: validPlayers.map((player) => ({ text: player.name })),
          expiresAt: pollEndDateTime.toISOString(),
          pointValue: 50,
        }),
      })

      if (!motmPollResponse.ok) {
        const error = await motmPollResponse.json()
        throw new Error(error.message || "Failed to create MOTM poll")
      }

      toast({
        title: "Poll created successfully",
        description: `Poll for ${team1} vs ${team2} has been created`,
      })

      router.push("/admin/polls")
    } catch (error) {
      console.error("Error creating poll:", error)
      toast({
        title: "Failed to create poll",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create New Poll</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
            <CardDescription>Enter the details of the IPL match for this poll</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="team1">Team 1</Label>
                <Input
                  id="team1"
                  value={team1}
                  onChange={(e) => setTeam1(e.target.value)}
                  placeholder="Mumbai Indians"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team2">Team 2</Label>
                <Input
                  id="team2"
                  value={team2}
                  onChange={(e) => setTeam2(e.target.value)}
                  placeholder="Chennai Super Kings"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="matchDate">Match Date</Label>
                <DatePicker value={matchDate} onChange={setMatchDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matchTime">Match Time</Label>
                <TimePicker value={matchTime} onChange={setMatchTime} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Wankhede Stadium, Mumbai"
                required
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Poll Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pollEndDate">Poll End Date</Label>
                  <DatePicker value={pollEndDate} onChange={setPollEndDate} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pollEndTime">Poll End Time</Label>
                  <TimePicker value={pollEndTime} onChange={setPollEndTime} />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Man of the Match Candidates</h3>
                <Button type="button" variant="outline" size="sm" onClick={addPlayer}>
                  <Plus className="h-4 w-4 mr-2" /> Add Player
                </Button>
              </div>

              <div className="space-y-4">
                {players.map((player, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`player-${index}`}>Player Name</Label>
                      <Input
                        id={`player-${index}`}
                        value={player.name}
                        onChange={(e) => updatePlayer(index, "name", e.target.value)}
                        placeholder="Player name"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`team-${index}`}>Team</Label>
                      <Select value={player.team} onValueChange={(value) => updatePlayer(index, "team", value)}>
                        <SelectTrigger id={`team-${index}`}>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={team1}>{team1}</SelectItem>
                          <SelectItem value={team2}>{team2}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-8"
                      onClick={() => removePlayer(index)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Poll"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

