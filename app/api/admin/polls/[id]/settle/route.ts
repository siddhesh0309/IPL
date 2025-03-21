import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const id = params.id
    const { correctOptionId, pointsPerCorrectVote = 10 } = await request.json()

    if (!correctOptionId) {
      return NextResponse.json({ error: "Correct option ID is required" }, { status: 400 })
    }

    // Get poll
    const poll = await db.poll.findUnique({
      where: { id },
      include: {
        options: true,
      },
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Check if option exists
    const option = poll.options.find((opt) => opt.id === correctOptionId)
    if (!option) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 })
    }

    // Start a transaction
    await db.$transaction(async (tx) => {
      // Mark the correct option
      await tx.option.update({
        where: { id: correctOptionId },
        data: { isCorrect: true },
      })

      // Update poll status to SETTLED
      await tx.poll.update({
        where: { id },
        data: { status: "SETTLED" },
      })

      // Get all votes for this poll
      const votes = await tx.vote.findMany({
        where: { pollId: id },
      })

      // Award points to users who voted for the correct option
      for (const vote of votes) {
        if (vote.optionId === correctOptionId) {
          // Update vote with points
          await tx.vote.update({
            where: { id: vote.id },
            data: { points: pointsPerCorrectVote },
          })

          // Update user points
          await tx.user.update({
            where: { id: vote.userId },
            data: {
              points: {
                increment: pointsPerCorrectVote,
              },
            },
          })
        }
      }

      // Create notifications for users who voted
      const userIds = [...new Set(votes.map((vote) => vote.userId))]
      await tx.notification.createMany({
        data: userIds.map((userId) => ({
          userId,
          type: "POLL_SETTLED",
          message: `Poll settled: ${poll.question}`,
          pollId: poll.id,
        })),
      })
    })

    // Update user ranks
    await updateUserRanks()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin settle poll error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to update user ranks
async function updateUserRanks() {
  const users = await db.user.findMany({
    select: {
      id: true,
      points: true,
    },
    orderBy: {
      points: "desc",
    },
  })

  // Update ranks
  for (let i = 0; i < users.length; i++) {
    await db.user.update({
      where: { id: users[i].id },
      data: { rank: i + 1 },
    })
  }
}

