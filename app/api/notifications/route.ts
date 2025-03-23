import { type NextRequest, NextResponse } from "next/server"
import { authenticate, authError } from "@/lib/auth"
import { getUserNotifications, markAllNotificationsAsRead } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {


    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    const userId = user.id
    const notifications = await getUserNotifications(userId)

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    const userId = user.id
    const { markAllAsRead } = await request.json()

    if (markAllAsRead) {
      await markAllNotificationsAsRead(userId)
      return NextResponse.json({ success: true, message: "All notifications marked as read" })
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}

