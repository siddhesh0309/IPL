import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db, getUserVotes } from "@/lib/db"
import { authenticate, authError } from "@/lib/auth"

// Input validation schema for creating a vote
const createVoteSchema = z.object({
  pollId: z.string(),
  optionId: z.string(),
})

// Update the GET function to use the db helper functions
export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const pollId = searchParams.get("pollId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get user votes using the db helper
    const votes = await getUserVotes(user.id, pollId)

    // Filter by pollId if provided
    const filteredVotes = pollId ? votes.filter((vote) => vote.pollId === pollId) : votes

    return NextResponse.json(filteredVotes)
  } catch (error) {
    console.error("Get votes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    const body = await request.json()

    // Validate input
    const result = createVoteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 })
    }

    const { pollId, optionId } = result.data

    // Check if poll exists and is active
    const poll = await db.poll.findUnique({
      where: { id: pollId },
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    if (poll.status !== "ACTIVE") {
      return NextResponse.json({ error: "Poll is no longer active" }, { status: 400 })
    }

    if (new Date(poll.pollEndTime) < new Date()) {
      return NextResponse.json({ error: "Poll has ended" }, { status: 400 })
    }

    // Check if option exists and belongs to the poll
    const option = await db.option.findFirst({
      where: {
        id: optionId,
        pollId,
      },
    })

    if (!option) {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 })
    }

    // Check if user has already voted on this poll
    const existingVote = await db.vote.findUnique({
      where: {
        userId_pollId: {
          userId: user.id,
          pollId,
        },
      },
    })

    if (existingVote) {
      // Update existing vote
      const updatedVote = await db.vote.update({
        where: {
          id: existingVote.id,
        },
        data: {
          optionId,
        },
        include: {
          poll: true,
          option: true,
        },
      })

      return NextResponse.json(updatedVote)
    }

    // Create new vote
    const vote = await db.vote.create({
      data: {
        userId: user.id,
        pollId,
        optionId,
      },
      include: {
        poll: true,
        option: true,
      },
    })

    return NextResponse.json(vote)
  } catch (error) {
    console.error("Create vote error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

