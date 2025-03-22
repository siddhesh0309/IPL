import { type NextRequest, NextResponse } from "next/server"
import { getPollById, updatePoll, deletePoll } from "@/lib/db"
import { authenticate, authError } from "@/lib/auth"


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const poll = await getPollById(params.id)

    if (!poll) {
      return NextResponse.json({ success: false, error: "Poll not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: poll,
    })
  } catch (error) {
    console.error("Error fetching poll:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch poll" }, { status: 500 })
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
    const { question, options, status, startTime, endTime } = data

    const updatedPoll = await updatePoll(params.id, {
      question,
      options,
      status,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
    })

    if (!updatedPoll) {
      return NextResponse.json({ success: false, error: "Poll not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedPoll,
    })
  } catch (error) {
    console.error("Error updating poll:", error)
    return NextResponse.json({ success: false, error: "Failed to update poll" }, { status: 500 })
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

    const result = await deletePoll(params.id)

    if (!result) {
      return NextResponse.json({ success: false, error: "Poll not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Poll deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting poll:", error)
    return NextResponse.json({ success: false, error: "Failed to delete poll" }, { status: 500 })
  }
}

