import { type NextRequest, NextResponse } from "next/server"
import { getTeams, createTeam } from "@/lib/db"
import { authenticate, authError } from "@/lib/auth"


export async function GET(request: NextRequest) {
  try {
    const teams = await getTeams()

    return NextResponse.json({
      success: true,
      data: teams,
    })
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch teams" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    const data = await request.json()
    const { name, shortName, logo, primaryColor } = data

    if (!name || !shortName) {
      return NextResponse.json({ success: false, error: "Name and shortName are required" }, { status: 400 })
    }

    const team = await createTeam({
      name,
      shortName,
      logo,
      primaryColor,
    })

    return NextResponse.json(
      {
        success: true,
        data: team,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ success: false, error: "Failed to create team" }, { status: 500 })
  }
}

