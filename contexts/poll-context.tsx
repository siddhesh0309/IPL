"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import type { Poll, Vote } from "@/lib/types"

interface PollContextType {
  polls: Poll[]
  isLoading: boolean
  error: string | null
  fetchPolls: (status?: string) => Promise<Poll[]>
  fetchPoll: (id: string) => Promise<Poll>
  createPoll: (pollData: Partial<Poll>) => Promise<Poll>
  updatePoll: (id: string, pollData: Partial<Poll>) => Promise<Poll>
  deletePoll: (id: string) => Promise<void>
  submitVote: (userId: string, pollId: string, optionId: string) => Promise<Vote>
  clearError: () => void
}

const PollContext = createContext<PollContextType | undefined>(undefined)

export function PollProvider({ children }: { children: React.ReactNode }) {
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Use useCallback to memoize the function and prevent it from being recreated on every render
  const fetchPolls = useCallback(async (status?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const url = status ? `/api/polls?status=${status}` : "/api/polls"
      const response = await fetch(url)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch polls")
      }

      const data = await response.json()
      setPolls(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchPoll = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/polls/${id}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch poll")
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createPoll = useCallback(async (pollData: Partial<Poll>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pollData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create poll")
      }

      const data = await response.json()
      setPolls((prevPolls) => [...prevPolls, data])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updatePoll = useCallback(async (id: string, pollData: Partial<Poll>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/polls/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pollData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update poll")
      }

      const data = await response.json()
      setPolls((prevPolls) => prevPolls.map((poll) => (poll.id === id ? data : poll)))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deletePoll = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/polls/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete poll")
      }

      setPolls((prevPolls) => prevPolls.filter((poll) => poll.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const submitVote = useCallback(async (userId: string, pollId: string, optionId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, pollId, optionId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit vote")
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value = {
    polls,
    isLoading,
    error,
    fetchPolls,
    fetchPoll,
    createPoll,
    updatePoll,
    deletePoll,
    submitVote,
    clearError,
  }

  return <PollContext.Provider value={value}>{children}</PollContext.Provider>
}

export function usePolls() {
  const context = useContext(PollContext)
  if (context === undefined) {
    throw new Error("usePolls must be used within a PollProvider")
  }
  return context
}

