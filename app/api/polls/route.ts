import { type NextRequest, NextResponse } from "next/server"
import { getPollsByStatus, createPoll } from "@/lib/db"
import { authenticate, authError } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
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
    const { matchId, type, question, options, startTime, endTime } = data

    if (!matchId || !type || !question || !options || !options.length) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const poll = await createPoll({
      matchId,
      type,
      question,
      options,
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : undefined,
      createdBy: user.id,
    })

    return NextResponse.json(
      {
        success: true,
        data: poll,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating poll:", error)
    return NextResponse.json({ success: false, error: "Failed to create poll" }, { status: 500 })
  }
}

