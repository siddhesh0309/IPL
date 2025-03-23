import { type NextRequest, NextResponse } from "next/server"
import { getUserPredictions } from "@/lib/db"
import { authenticate, authError } from "@/lib/auth"
import { addISOWeekYears } from "date-fns"


export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }


    const { id } = await params
    if (user?.id !== id) {
      return NextResponse.json({ success: false, error: "Unauthorized. Cannot view the predictions of other user." }, { status: 403 })
    }
    const predictions = await getUserPredictions(id)

    // Format predictions for the frontend
    const formattedPredictions = predictions.map((prediction) => {
      const match = prediction.poll.match
      return {
        id: prediction.id,
        teams: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
        date: match.date,
        prediction: prediction.poll.options.filter((option) => option.id === prediction.optionId)[0].text,
        actual: prediction.poll.options.filter((option) => option.isCorrect == true)[0]?.text || "PENDING",
        isCorrect: prediction.poll.options.filter((option) => option.isCorrect == true)[0]?.id === prediction.optionId,
        type: prediction.poll.type,
        points: prediction.poll.options.filter((option) => option.isCorrect == true)[0]?.id === prediction.optionId ? (prediction.poll.points ?? 10) : 0,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        homeTeamLogo: match.homeTeam.logo,
        team2Logo: match.awayTeam.logo,
        matchId: match.id,
        pollId: prediction.poll.id,
      }
    })

    return NextResponse.json({ predictions: formattedPredictions })
  } catch (error) {
    console.error("Error fetching user predictions:", error)
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 })
  }
}

