import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { authenticate, authError } from "@/lib/auth"
import { hashPassword } from "@/lib/auth"

// Input validation schema for creating a user
const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  status: z.enum(["active", "inactive"]).default("active"),
})

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build the where clause
    const where: any = {}

    if (role) {
      where.role = role
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ]
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,

        role: true,
        status: true,
        // predictions: true,
        points: true,
        image: true,
        createdAt: true,
        votes: {
          select: {
            id: true,
            pollId: true,
            userId: true,
            optionId: true,
            createdAt: true,
          },

        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })
    /******  a8c99b30-cc8c-4cce-a204-ff38aa1f0abe  *******/

    // Get total count
    const total = await db.user.count({ where })

    return NextResponse.json({
      data: users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    let { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    const body = await request.json()

    // Validate input
    const result = createUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 })
    }

    const { name, role, status } = result.data

    // Check if email already exists
    const existingEmail = await db.user.findUnique({
      where: { name },
    })

    if (existingEmail) {
      return NextResponse.json({ error: "Name already in use" }, { status: 400 })
    }

    // Create user
    const user1 = await db.user.create({
      data: {
        name,
        role,
        // predictions: 0,
        points: 0,
        image: "",
      },
      select: {
        id: true,
        name: true,

        role: true,
        status: true,
        createdAt: true,
      },
    })

    // Create default settings for the user
    // await db.userSettings.create({
    //   data: {
    //     userId: user.id,
    //     notifications: {
    //       emailNotifications: true,
    //       pollReminders: true,
    //       resultNotifications: true,
    //       leaderboardUpdates: true,
    //       newPollNotifications: true,
    //       predictionResults: true,
    //       systemAnnouncements: true,
    //     },
    //     privacy: {
    //       showProfilePublicly: true,
    //       showPredictionsPublicly: true,
    //       showPointsPublicly: true,
    //       allowTagging: true,
    //     },
    //     theme: {
    //       darkMode: false,
    //       highContrast: false,
    //       reducedMotion: false,
    //     },
    //   },
    // })

    return NextResponse.json(user1)
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

