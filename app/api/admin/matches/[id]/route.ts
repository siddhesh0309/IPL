import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authenticate, authError } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    const id = params.id
    const data = await request.json()
    const { date, venue, status, homeTeamScore, awayTeamScore, result } = data

    // Get match
    const match = await db.match.findUnique({
      where: { id },
    })

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    // Update match
    const updatedMatch = await db.match.update({
      where: { id },
      data: {
        date: date ? new Date(date) : match.date,
        venue: venue || match.venue,
        status: status || match.status,
        homeTeamScore: homeTeamScore !== undefined ? homeTeamScore : match.homeTeamScore,
        awayTeamScore: awayTeamScore !== undefined ? awayTeamScore : match.awayTeamScore,
        result: result || match.result,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })

    // If status changed to COMPLETED, create notifications
    if (status === "COMPLETED" && match.status !== "COMPLETED") {
      await db.notification.createMany({
        data: (await db.user.findMany({ select: { id: true } })).map((user) => ({
          userId: user.id,
          type: "MATCH_COMPLETED",
          message: `Match completed: ${updatedMatch.homeTeam.name} vs ${updatedMatch.awayTeam.name}`,
          matchId: match.id,
        })),
      })
    }

    return NextResponse.json(updatedMatch)
  } catch (error) {
    console.error("Admin update match error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    const id = params.id

    // Check if match exists
    const match = await db.match.findUnique({
      where: { id },
    })

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    // Check if match has polls
    const pollCount = await db.poll.count({
      where: { matchId: id },
    })

    if (pollCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete match with associated polls. Delete the polls first.",
        },
        { status: 400 },
      )
    }

    // Delete match
    await db.match.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete match error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

