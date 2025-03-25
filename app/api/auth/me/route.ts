import { NextRequest, NextResponse } from "next/server"
import { authenticate, authError } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    // Get the user from the database
    const user1 = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,

        role: true,
        status: true,
        // predictions: true,
        points: true,
        image: true,
        createdAt: true,
      },
    })

    if (!user1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user1)
  } catch (error) {
    console.error("Get current user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

