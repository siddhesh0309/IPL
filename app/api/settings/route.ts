import { type NextRequest, NextResponse } from "next/server"
import { authenticate, authError, authOptions } from "@/lib/auth"
import { updateUserSettings, getUserSettings } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    const userId = user.id
    const settings = await getUserSettings(userId)

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    const userId = user.id
    const { notifications, privacy, theme } = await request.json()

    // Validate the settings data
    if (!notifications && !privacy && !theme) {
      return NextResponse.json({ error: "No settings provided" }, { status: 400 })
    }

    // Update the settings
    await updateUserSettings(userId, {
      notifications,
      privacy,
      theme,
    })

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Error updating user settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

