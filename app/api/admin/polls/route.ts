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
    const matchId = searchParams.get("matchId")
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Use the getAllPolls helper function
    const result = await db.getAllPolls(page, limit, search, status || "", matchId || "")

    return NextResponse.json(result)
  } catch (error) {
    console.error("Admin get polls error:", error)
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
        team1: match.homeTeam.name,
        team2: match.awayTeam.name,
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

