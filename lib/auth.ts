import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import type { User } from "./types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function signJwtToken(payload: any) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d") // Token expires in 1 day
      .sign(new TextEncoder().encode(JWT_SECRET))

    return token
  } catch (error) {
    console.error("Error signing JWT token:", error)
    throw error
  }
}

export async function verifyJwtToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return payload
  } catch (error) {
    console.error("Error verifying JWT token:", error)
    return null
  }
}

export async function getAuthUser(req?: NextRequest): Promise<User | null> {
  try {
    // Get token from cookies or authorization header
    let token: string | undefined

    if (req) {
      // For API routes
      const authHeader = req.headers.get("authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      }
    } else {
      // For server components
      const cookieStore = cookies()
      token = cookieStore.get("token")?.value
    }

    if (!token) {
      return null
    }

    // Verify token
    const payload = await verifyJwtToken(token)
    if (!payload || !payload.id) {
      return null
    }

    // Return user data from payload
    return payload as unknown as User
  } catch (error) {
    console.error("Error getting auth user:", error)
    return null
  }
}

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  })

  return res
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })

  return res
}

export function withAuth(handler: Function) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return handler(req, user)
  }
}

export function withAdminAuth(handler: Function) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return handler(req, user)
  }
}

