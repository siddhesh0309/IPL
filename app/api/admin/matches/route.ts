import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authenticate, authError } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 403 })
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

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    const data = await request.json()
    const { homeTeam: homeTeamId, awayTeam: awayTeamId, date, venue } = data

    console.log("Admin create match data:", data)

    if (!homeTeamId || !awayTeamId || !date || !venue) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if teams exist
    const homeTeam = await db.team.findUnique({
      where: { name: homeTeamId },
    })

    const awayTeam = await db.team.findUnique({
      where: { name: awayTeamId },
    })

    if (!homeTeam || !awayTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    console.log("Admin create match teams:", homeTeam, awayTeam)

    // Create match
    const match = await db.match.create({
      data: {
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
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

