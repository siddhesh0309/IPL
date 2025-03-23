import { type NextRequest, NextResponse } from "next/server"
import { getUserStatistics } from "@/lib/db"
import { authenticate, authError } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || user.id

    // Check if requesting other user's stats
    if (userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized to view other user's statistics" },
        { status: 403 },
      )
    }

    const stats = await getUserStatistics(userId)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching user statistics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch user statistics" }, { status: 500 })
  }
}

