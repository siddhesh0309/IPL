import { type NextRequest, NextResponse } from "next/server"
import { getUserStatistics } from "@/lib/db"
import { authMiddleware } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || authResult.user.id

    // Check if requesting other user's stats
    if (userId !== authResult.user.id && authResult.user.role !== "admin") {
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

