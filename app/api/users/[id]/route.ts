import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { getServerSession, hashPassword } from "@/lib/auth"

// Input validation schema for updating a user
const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["user", "admin"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  avatar: z.string().optional(),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get the authenticated user from the session
    const session = await getServerSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is requesting their own profile or is an admin
    if (session.user.id !== id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get user by ID
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        status: true,
        predictions: true,
        points: true,
        avatar: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get the authenticated user from the session
    const session = await getServerSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is updating their own profile or is an admin
    const isAdmin = session.user.role === "admin"
    if (session.user.id !== id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Validate input
    const result = updateUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 })
    }

    const { name, email, username, password, role, status, avatar } = result.data

    // Check if email is being changed and already exists
    if (email) {
      const existingEmail = await db.user.findFirst({
        where: {
          email,
          id: { not: id },
        },
      })

      if (existingEmail) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
      }
    }

    // Check if username is being changed and already exists
    if (username) {
      const existingUsername = await db.user.findFirst({
        where: {
          username,
          id: { not: id },
        },
      })

      if (existingUsername) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {}

    if (name) updateData.name = name
    if (email) updateData.email = email
    if (username) updateData.username = username
    if (avatar) updateData.avatar = avatar

    // Only allow admins to change role and status
    if (isAdmin) {
      if (role) updateData.role = role
      if (status) updateData.status = status
    }

    // Hash password if provided
    if (password) {
      updateData.password = await hashPassword(password)
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        status: true,
        predictions: true,
        points: true,
        avatar: true,
        createdAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get the authenticated user from the session
    const session = await getServerSession()

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user exists
    const user = await db.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user settings
    await db.userSettings.delete({
      where: { userId: id },
    })

    // Delete user votes
    await db.vote.deleteMany({
      where: { userId: id },
    })

    // Delete user notifications
    await db.notification.deleteMany({
      where: { userId: id },
    })

    // Delete user
    await db.user.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

