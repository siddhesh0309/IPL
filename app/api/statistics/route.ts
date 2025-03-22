import { type NextRequest, NextResponse } from "next/server"
import { getOverallStatistics } from "@/lib/db"
import { authenticate, authError } from "@/lib/auth"

export async function GET(request: NextRequest) {


  try {

    console.log('request', request)
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    // Only admins can access overall statistics
    if (user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "all"

    const stats = await getOverallStatistics(period)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch statistics" }, { status: 500 })
  }
}

