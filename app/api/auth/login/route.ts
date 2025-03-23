import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sign } from "jsonwebtoken"
import { z } from "zod"
import { db } from "@/lib/db"
import { comparePassword } from "@/lib/auth"

// Input validation schema
const loginSchema = z.object({
  name: z.string(),
  // email: z.string().email("Invalid email address"),
  // password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 })
    }

    const { name, rememberMe } = result.data

    // Find user by email
    const user = await db.user.findUnique({
      where: { name },
      select: {
        id: true,
        name: true,
        role: true,
        image: true,
        // avatar: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "No user found with the name" }, { status: 401 })
    }

    // Verify password
    // const passwordMatch = await comparePassword(password, user.password)
    // if (!passwordMatch) {
    // return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    // }

    // Create JWT token
    const token = sign(
      {
        id: user.id,
        // email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback_secret",
      {
        expiresIn: rememberMe ? "30d" : "24h",
      },
    )

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 24 hours
      path: "/",
    })

    // Return user data without password
    const { ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

