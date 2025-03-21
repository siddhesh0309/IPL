import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get poll by ID
    const poll = await db.poll.findUnique({
      where: { id },
      include: {
        options: {
          select: {
            id: true,
            text: true,
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Format poll to include vote counts and percentages
    const totalVotes = poll._count.votes

    const options = poll.options.map((option) => {
      const votes = option._count.votes
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0

      return {
        id: option.id,
        text: option.text,
        votes,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      }
    })

    // Sort options by votes (descending)
    options.sort((a, b) => b.votes - a.votes)

    // Get top voters
    const topVoters = await db.vote.findMany({
      where: { pollId: id },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        option: {
          select: {
            text: true,
          },
        },
        points: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    // Return poll results
    return NextResponse.json({
      id: poll.id,
      matchId: poll.matchId,
      team1: poll.team1,
      team2: poll.team2,
      date: poll.date,
      venue: poll.venue,
      pollEndTime: poll.pollEndTime,
      status: poll.status,
      pollType: poll.pollType,
      question: poll.question,
      options,
      totalVotes,
      topVoters: topVoters.map((vote) => ({
        user: vote.user,
        option: vote.option.text,
        points: vote.points,
      })),
    })
  } catch (error) {
    console.error("Get poll results error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

