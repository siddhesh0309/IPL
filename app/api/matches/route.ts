import { type NextRequest, NextResponse } from "next/server"
import { getAllMatches } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || undefined
    const team = searchParams.get("team") || undefined
    const venue = searchParams.get("venue") || undefined

    const matches = await getAllMatches({
      status: status as "upcoming" | "live" | "completed" | undefined,
      team,
      venue,
    })

    // Format matches for the frontend and check if they have active polls
    const formattedMatches = await Promise.all(
      matches.map(async (match) => {
        const hasPolls = match.polls.some((poll) => poll.status === "ACTIVE")

        return {
          id: match.id,
          team1: match.homeTeam.name,
          team1ShortName: match.homeTeam.shortName,
          team2: match.awayTeam.name,
          team2ShortName: match.awayTeam.shortName,
          date: match.date,
          venue: match.venue,
          status: match.status.toLowerCase(),
          result: match.result || undefined,
          hasPolls,
        }
      }),
    )

    return NextResponse.json({ matches: formattedMatches })
  } catch (error) {
    console.error("Error fetching matches:", error)
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 })
  }
}

