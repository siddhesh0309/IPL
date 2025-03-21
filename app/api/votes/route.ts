import { type NextRequest, NextResponse } from "next/server"
import { getUserVotes, createVote } from "@/lib/db"
import { authMiddleware } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || authResult.user.id
    const pollId = searchParams.get("pollId")

    // Check if requesting other user's votes
    if (userId !== authResult.user.id && authResult.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized to view other user's votes" }, { status: 403 })
    }

    const votes = await getUserVotes(userId, pollId)

    return NextResponse.json(votes)
  } catch (error) {
    console.error("Error fetching votes:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch votes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    const data = await request.json()
    const { pollId, optionId } = data

    if (!pollId || !optionId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const vote = await createVote({
      userId: authResult.user.id,
      pollId,
      optionId,
    })

    return NextResponse.json(
      {
        success: true,
        data: vote,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating vote:", error)

    // Handle duplicate vote error
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "You have already voted on this poll" }, { status: 409 })
    }

    return NextResponse.json({ success: false, error: "Failed to create vote" }, { status: 500 })
  }
}

