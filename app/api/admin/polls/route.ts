import { NextRequest, NextResponse } from "next/server"
import { db, getPollsByStatus } from "@/lib/db"
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
    const status = searchParams.get("status") || "all"
    const teamId = searchParams.get("teamId")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const polls = await getPollsByStatus(status, teamId, limit, offset)


    return NextResponse.json({
      success: true,
      data: polls,
    })
  } catch (error) {
    console.error("Error fetching polls:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch polls" }, { status: 500 })
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
    const { matchId, question, pollType, options, pollEndTime } = data

    if (!matchId || !question || !pollType || !options || !pollEndTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get match details
    const match = await db.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    // Create poll
    const poll = await db.poll.create({
      data: {
        matchId,
        question,
        pollType,
        homeTeamId: match.homeTeam.id,
        awayTeamId: match.awayTeam.id,
        date: match.date,
        venue: match.venue,
        pollEndTime: new Date(pollEndTime),
        status: "ACTIVE",
        options: {
          create: options.map((option: string) => ({
            text: option,
          })),
        },
      },
      include: {
        options: true,
      },
    })

    // Create notifications for all users
    await db.notification.createMany({
      data: (await db.user.findMany({ select: { id: true } })).map((user) => ({
        userId: user.id,
        type: "POLL_CREATED",
        message: `New poll: ${question}`,
        pollId: poll.id,
      })),
    })

    return NextResponse.json(poll)
  } catch (error) {
    console.error("Admin create poll error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

