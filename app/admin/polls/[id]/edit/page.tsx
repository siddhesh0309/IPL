"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { usePolls } from "@/contexts/poll-context"
import type { Poll } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

export default function EditPollPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { fetchPoll, updatePoll, isLoading, error } = usePolls()

  const [poll, setPoll] = useState<Poll | null>(null)
  const [team1, setTeam1] = useState("")
  const [team2, setTeam2] = useState("")
  const [matchDate, setMatchDate] = useState<Date | undefined>(undefined)
  const [matchTime, setMatchTime] = useState<string | undefined>(undefined)
  const [venue, setVenue] = useState("")
  const [pollEndDate, setPollEndDate] = useState<Date | undefined>(undefined)
  const [pollEndTime, setPollEndTime] = useState<string | undefined>(undefined)
  const [options, setOptions] = useState<Array<{ id: string; text: string; votes: number }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)

  useEffect(() => {
    const loadPoll = async () => {
      try {
        const pollData = await fetchPoll(params.id)
        setPoll(pollData)

        // Set form values
        setTeam1(pollData.team1)
        setTeam2(pollData.team2)
        setMatchDate(new Date(pollData.date))
        setMatchTime(new Date(pollData.date).toTimeString().slice(0, 5))
        setVenue(pollData.venue)
        setPollEndDate(new Date(pollData.pollEndTime))
        setPollEndTime(new Date(pollData.pollEndTime).toTimeString().slice(0, 5))
        setOptions(pollData.options)
      } catch (error) {
        console.error("Error loading poll:", error)
        setLoadingError("Failed to load poll details. Please try again.")
      }
    }

    loadPoll()
  }, [fetchPoll, params.id])

  const addOption = () => {
    setOptions([...options, { id: `new-${options.length}`, text: "", votes: 0 }])
  }

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "A poll must have at least two options.",
        variant: "destructive",
      })
      return
    }

    const newOptions = [...options]
    newOptions.splice(index, 1)
    setOptions(newOptions)
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index].text = value
    setOptions(newOptions)
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

    // Validate options
    const validOptions = options.filter((option) => option.text.trim() !== "")
    if (validOptions.length < 2) {
      toast({
        title: "Not enough options",
        description: "Please add at least 2 valid options",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Combine date and time
      const matchDateTime = new Date(matchDate)
      const [hours, minutes] = matchTime.split(":").map(Number)
      matchDateTime.setHours(hours, minutes)

      const pollEndDateTime = new Date(pollEndDate)
      const [endHours, endMinutes] = pollEndTime.split(":").map(Number)
      pollEndDateTime.setHours(endHours, endMinutes)

      // Update poll
      await updatePoll(params.id, {
        team1,
        team2,
        date: matchDateTime.toISOString(),
        venue,
        pollEndTime: pollEndDateTime.toISOString(),
        options,
      })

      toast({
        title: "Poll updated successfully",
        description: `Poll for ${team1} vs ${team2} has been updated`,
      })

      router.push("/admin/polls")
    } catch (error) {
      toast({
        title: "Failed to update poll",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24 mr-2" />
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Poll</h1>
      </div>

      {loadingError && (
        <Alert variant="destructive">
          <AlertDescription>{loadingError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
            <CardDescription>Edit the details of the IPL match for this poll</CardDescription>
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
                <h3 className="text-lg font-medium">Poll Options</h3>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-2" /> Add Option
                </Button>
              </div>

              <div className="space-y-4">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
                      <Input
                        id={`option-${index}`}
                        value={option.text}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder="Option text"
                      />
                    </div>
                    <div className="flex-none mt-8">
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
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
              {isSubmitting ? "Updating..." : "Update Poll"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

