import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const teamId = searchParams.get("teamId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build the where clause
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (teamId) {
      where.OR = [{ homeTeamId: teamId }, { awayTeamId: teamId }]
    }

    // Get matches with pagination
    const matches = await db.match.findMany({
      where,
      include: {
        homeTeam: true,
        awayTeam: true,
        _count: {
          select: {
            polls: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { date: "asc" },
    })

    // Get total count
    const total = await db.match.count({ where })

    return NextResponse.json({
      data: matches.map((match) => ({
        ...match,
        pollCount: match._count.polls,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin get matches error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await request.json()
    const { homeTeamId, awayTeamId, date, venue } = data

    if (!homeTeamId || !awayTeamId || !date || !venue) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if teams exist
    const homeTeam = await db.team.findUnique({
      where: { id: homeTeamId },
    })

    const awayTeam = await db.team.findUnique({
      where: { id: awayTeamId },
    })

    if (!homeTeam || !awayTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Create match
    const match = await db.match.create({
      data: {
        homeTeamId,
        awayTeamId,
        date: new Date(date),
        venue,
        status: "UPCOMING",
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })

    return NextResponse.json(match)
  } catch (error) {
    console.error("Admin create match error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

