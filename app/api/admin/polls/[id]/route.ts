import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const id = params.id
    const data = await request.json()
    const { question, pollEndTime, status } = data

    // Get poll
    const poll = await db.poll.findUnique({
      where: { id },
      include: {
        options: true,
      },
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Update poll
    const updatedPoll = await db.poll.update({
      where: { id },
      data: {
        question: question || poll.question,
        pollEndTime: pollEndTime ? new Date(pollEndTime) : poll.pollEndTime,
        status: status || poll.status,
      },
      include: {
        options: true,
      },
    })

    // If status changed to CLOSED, create notifications
    if (status === "CLOSED" && poll.status !== "CLOSED") {
      await db.notification.createMany({
        data: (await db.user.findMany({ select: { id: true } })).map((user) => ({
          userId: user.id,
          type: "POLL_CLOSED",
          message: `Poll closed: ${poll.question}`,
          pollId: poll.id,
        })),
      })
    }

    // If status changed to SETTLED, create notifications
    if (status === "SETTLED" && poll.status !== "SETTLED") {
      await db.notification.createMany({
        data: (await db.user.findMany({ select: { id: true } })).map((user) => ({
          userId: user.id,
          type: "POLL_SETTLED",
          message: `Poll settled: ${poll.question}`,
          pollId: poll.id,
        })),
      })
    }

    return NextResponse.json(updatedPoll)
  } catch (error) {
    console.error("Admin update poll error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const id = params.id

    // Check if poll exists
    const poll = await db.poll.findUnique({
      where: { id },
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Delete poll options
    await db.option.deleteMany({
      where: { pollId: id },
    })

    // Delete votes for this poll
    await db.vote.deleteMany({
      where: { pollId: id },
    })

    // Delete notifications for this poll
    await db.notification.deleteMany({
      where: { pollId: id },
    })

    // Delete poll
    await db.poll.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete poll error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

