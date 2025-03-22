import { type NextRequest, NextResponse } from "next/server"
import { getMatchComments, createComment } from "@/lib/db"
import { authenticate, authError } from "@/lib/auth"


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const comments = await getMatchComments(params.id, limit, offset)

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    const data = await request.json()
    const { text } = data

    if (!text || text.trim() === "") {
      return NextResponse.json({ success: false, error: "Comment text is required" }, { status: 400 })
    }

    const comment = await createComment({
      matchId: params.id,
      userId: user.id,
      text,
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ success: false, error: "Failed to create comment" }, { status: 500 })
  }
}

