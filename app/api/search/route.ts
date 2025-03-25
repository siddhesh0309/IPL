import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "5")

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const results: any = {}

    // Search users
    if (type === "all" || type === "users") {
      results.users = await db.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          image: true,
          points: true,
          rank: true,
        },
        take: limit,
      })
    }

    // Search teams
    if (type === "all" || type === "teams") {
      results.teams = await db.team.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { shortName: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
      })
    }

    // Search matches
    if (type === "all" || type === "matches") {
      const matches = await db.match.findMany({
        where: {
          OR: [
            { venue: { contains: query, mode: "insensitive" } },
            { homeTeam: { name: { contains: query, mode: "insensitive" } } },
            { awayTeam: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
        take: limit,
      })

      results.matches = matches.map((match) => ({
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        date: match.date,
        venue: match.venue,
        status: match.status,
      }))
    }

    // Search polls
    if (type === "all" || type === "polls") {
      results.polls = await db.poll.findMany({
        where: {
          OR: [
            { question: { contains: query, mode: "insensitive" } },
            { team1: { contains: query, mode: "insensitive" } },
            { team2: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          question: true,
          team1: true,
          team2: true,
          status: true,
          pollType: true,
        },
        take: limit,
      })
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

