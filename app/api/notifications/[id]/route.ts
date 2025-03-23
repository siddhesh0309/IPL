import { type NextRequest, NextResponse } from "next/server"
import { authenticate, authError, authOptions } from "@/lib/auth"
import { markNotificationAsRead, getNotificationById } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }
    const userId = user.id
    const notificationId = params.id

    // Verify the notification belongs to the user
    const notification = await getNotificationById(notificationId)

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    if (notification.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { isRead } = await request.json()

    if (isRead === undefined) {
      return NextResponse.json({ error: "isRead field is required" }, { status: 400 })
    }

    await markNotificationAsRead(notificationId)

    return NextResponse.json({
      success: true,
      message: `Notification marked as ${isRead ? "read" : "unread"}`,
    })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}

