import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

// Input validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 })
    }

    const { name, email, username, password } = result.data

    // Check if email already exists
    const existingEmail = await db.user.findUnique({
      where: { email },
    })

    if (existingEmail) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    // Check if username already exists
    const existingUsername = await db.user.findUnique({
      where: { username },
    })

    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        role: "USER",
        status: "active",
        predictions: 0,
        points: 0,
        avatar: "",
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    // Create default settings for the user
    await db.userSettings.create({
      data: {
        userId: user.id,
        notifications: {
          emailNotifications: true,
          pollReminders: true,
          resultNotifications: true,
          leaderboardUpdates: true,
          newPollNotifications: true,
          predictionResults: true,
          systemAnnouncements: true,
        },
        privacy: {
          showProfilePublicly: true,
          showPredictionsPublicly: true,
          showPointsPublicly: true,
          allowTagging: true,
        },
        theme: {
          darkMode: false,
          highContrast: false,
          reducedMotion: false,
        },
      },
    })

    return NextResponse.json({
      message: "Registration successful",
      user,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

