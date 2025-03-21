import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { authenticate, authError } from "@/lib/auth"

// Input validation schema for updating profile
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    // Authenticate the user
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    const body = await request.json()

    // Validate input
    const result = updateProfileSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 })
    }

    const { name, username, email, bio } = result.data

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await db.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 400 })
      }
    }

    // Check if username is already taken by another user
    if (username !== user.username) {
      const existingUser = await db.user.findUnique({
        where: { username },
      })

      if (existingUser) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 })
      }
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name,
        username,
        email,
        bio,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        role: true,
        points: true,
        rank: true,
        image: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

