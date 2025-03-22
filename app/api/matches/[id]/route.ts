import { type NextRequest, NextResponse } from "next/server"
import { getMatchById, updateMatch, deleteMatch } from "@/lib/db"
import { authenticate, authError } from "@/lib/auth"


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const match = await getMatchById(params.id)

    if (!match) {
      return NextResponse.json({ success: false, error: "Match not found" }, { status: 404 })
    }

    return NextResponse.json(match)
  } catch (error) {
    console.error("Error fetching match:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch match" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    const data = await request.json()
    const { team1Id, team2Id, date, venue, status, result, resultDetails } = data

    const updatedMatch = await updateMatch(params.id, {
      team1Id,
      team2Id,
      date: date ? new Date(date) : undefined,
      venue,
      status,
      result,
      resultDetails,
    })

    if (!updatedMatch) {
      return NextResponse.json({ success: false, error: "Match not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedMatch,
    })
  } catch (error) {
    console.error("Error updating match:", error)
    return NextResponse.json({ success: false, error: "Failed to update match" }, { status: 500 })
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

    const result = await deleteMatch(params.id)

    if (!result) {
      return NextResponse.json({ success: false, error: "Match not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Match deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting match:", error)
    return NextResponse.json({ success: false, error: "Failed to delete match" }, { status: 500 })
  }
}

