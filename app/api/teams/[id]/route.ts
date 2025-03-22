import { type NextRequest, NextResponse } from "next/server"
import { getTeamById, updateTeam, deleteTeam } from "@/lib/db"
import { authenticate, authError } from "@/lib/auth"


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const team = await getTeamById(params.id)

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: team,
    })
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch team" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const updatedTeam = await updateTeam(params.id, {
      name,
      shortName,
      logo,
      primaryColor,
    })

    if (!updatedTeam) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedTeam,
    })
  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json({ success: false, error: "Failed to update team" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await authenticate(request)

    if (error || !user) {
      return authError()
    }

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 403 })
    }

    const result = await deleteTeam(params.id)

    if (!result) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Team deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting team:", error)
    return NextResponse.json({ success: false, error: "Failed to delete team" }, { status: 500 })
  }
}

