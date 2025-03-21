"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Match = {
  id: number
  team1: string
  team2: string
  date: string
  venue: string
  status: string
}

type AdminPollFormProps = {
  matches: Match[]
  onSubmit: () => void
}

export function AdminPollForm({ matches, onSubmit }: AdminPollFormProps) {
  const [pollType, setPollType] = useState<string>("")
  const [matchId, setMatchId] = useState<string>("")
  const [question, setQuestion] = useState<string>("")
  const [options, setOptions] = useState<string[]>(["", ""])
  const [expiryDate, setExpiryDate] = useState<string>("")
  const [expiryTime, setExpiryTime] = useState<string>("")
  const { toast } = useToast()

  const addOption = () => {
    setOptions([...options, ""])
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
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!pollType) {
      toast({
        title: "Poll type required",
        description: "Please select a poll type.",
        variant: "destructive",
      })
      return
    }

    if (!matchId) {
      toast({
        title: "Match required",
        description: "Please select a match for this poll.",
        variant: "destructive",
      })
      return
    }

    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a question for the poll.",
        variant: "destructive",
      })
      return
    }

    if (!expiryDate || !expiryTime) {
      toast({
        title: "Expiry time required",
        description: "Please set when the poll should expire.",
        variant: "destructive",
      })
      return
    }

    // Check if all options have values
    if (options.some((option) => !option.trim())) {
      toast({
        title: "Empty options",
        description: "All poll options must have a value.",
        variant: "destructive",
      })
      return
    }

    // In a real app, you would call your API here
    // await createPoll({ pollType, matchId, question, options, expiryDate, expiryTime });

    toast({
      title: "Poll created",
      description: "The poll has been created successfully.",
    })

    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pollType">Poll Type</Label>
            <Select value={pollType} onValueChange={setPollType}>
              <SelectTrigger id="pollType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="winner">Match Winner</SelectItem>
                <SelectItem value="motm">Man of the Match</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="match">Match</Label>
            <Select value={matchId} onValueChange={setMatchId}>
              <SelectTrigger id="match">
                <SelectValue placeholder="Select match" />
              </SelectTrigger>
              <SelectContent>
                {matches.map((match) => (
                  <SelectItem key={match.id} value={match.id.toString()}>
                    {match.team1} vs {match.team2} ({new Date(match.date).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="question">Poll Question</Label>
          <Input
            id="question"
            placeholder="Enter poll question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiryTime">Expiry Time</Label>
            <Input id="expiryTime" type="time" value={expiryTime} onChange={(e) => setExpiryTime(e.target.value)} />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Poll Options</Label>
            <Button type="button" variant="outline" size="sm" onClick={addOption}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </div>

          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove option</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancel
        </Button>
        <Button type="submit">Create Poll</Button>
      </DialogFooter>
    </form>
  )
}

