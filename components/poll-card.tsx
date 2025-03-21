"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type PollOption = {
  id: number
  text: string
  votes: number
}

type Poll = {
  id: number
  matchId: number
  type: "winner" | "motm"
  question: string
  options: PollOption[]
  totalVotes: number
  userVote: number | null
  expiresAt: string
}

export function PollCard({ poll }: { poll: Poll }) {
  const [selectedOption, setSelectedOption] = useState<number | null>(poll.userVote)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(poll.userVote !== null)
  const { toast } = useToast()

  const isExpired = new Date(poll.expiresAt) < new Date()

  const handleVote = async () => {
    if (!selectedOption) {
      toast({
        title: "No option selected",
        description: "Please select an option to vote.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pollId: poll.id,
          optionId: selectedOption,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to submit vote")
      }

      setHasVoted(true)
      toast({
        title: "Vote submitted",
        description: "Your vote has been recorded successfully.",
      })
    } catch (error) {
      console.error("Error submitting vote:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "There was an error submitting your vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTimeRemaining = () => {
    const now = new Date()
    const expiry = new Date(poll.expiresAt)

    if (now > expiry) return "Voting closed"

    const diffMs = expiry.getTime() - now.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${diffHrs}h ${diffMins}m remaining`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{poll.question}</CardTitle>
        <CardDescription className="flex items-center">
          <Clock className="mr-1 h-4 w-4" />
          {getTimeRemaining()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasVoted && !isExpired ? (
          <RadioGroup
            value={selectedOption?.toString()}
            onValueChange={(value) => setSelectedOption(Number.parseInt(value))}
          >
            <div className="space-y-3">
              {poll.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                  <Label htmlFor={`option-${option.id}`} className="flex-grow">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        ) : (
          <div className="space-y-4">
            {poll.options.map((option) => {
              const percentage = Math.round((option.votes / poll.totalVotes) * 100) || 0
              const isUserVote = option.id === poll.userVote

              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between">
                    <span className={isUserVote ? "font-medium" : ""}>
                      {option.text} {isUserVote && "(Your vote)"}
                    </span>
                    <span>{percentage}%</span>
                  </div>
                  <Progress value={percentage} className={`h-2 ${isUserVote ? "bg-blue-100" : ""}`} />
                  <p className="text-xs text-muted-foreground">{option.votes} votes</p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
      {!hasVoted && !isExpired && (
        <CardFooter>
          <Button onClick={handleVote} disabled={isSubmitting || !selectedOption} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Vote"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

