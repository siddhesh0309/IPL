import { type NextRequest, NextResponse } from "next/server"
import { getUserPredictions } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is requesting their own predictions or is an admin
    if (session.user.id !== params.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const userId = params.id
    const predictions = await getUserPredictions(userId)

    // Format predictions for the frontend
    const formattedPredictions = predictions.map((prediction) => {
      const match = prediction.poll.match
      return {
        id: prediction.id,
        teams: `${match.team1} vs ${match.team2}`,
        date: match.date,
        prediction: prediction.option,
        actual: prediction.poll.correctOption || "Pending",
        isCorrect: prediction.poll.correctOption === prediction.option,
        type: prediction.poll.type,
        points: prediction.poll.correctOption === prediction.option ? prediction.poll.points : 0,
      }
    })

    return NextResponse.json({ predictions: formattedPredictions })
  } catch (error) {
    console.error("Error fetching user predictions:", error)
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 })
  }
}

