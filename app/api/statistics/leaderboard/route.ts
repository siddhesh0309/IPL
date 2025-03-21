import { NextResponse } from "next/server"

// Mock leaderboard data
const leaderboard = [
  {
    id: "1",
    name: "John Doe",
    username: "johndoe",
    points: 850,
    correctPredictions: 42,
    rank: 1,
    avatar: null,
  },
  {
    id: "2",
    name: "Jane Smith",
    username: "janesmith",
    points: 780,
    correctPredictions: 39,
    rank: 2,
    avatar: null,
  },
  {
    id: "3",
    name: "Robert Johnson",
    username: "rjohnson",
    points: 720,
    correctPredictions: 36,
    rank: 3,
    avatar: null,
  },
  {
    id: "4",
    name: "Emily Davis",
    username: "emilyd",
    points: 690,
    correctPredictions: 35,
    rank: 4,
    avatar: null,
  },
  {
    id: "5",
    name: "Michael Wilson",
    username: "mwilson",
    points: 650,
    correctPredictions: 33,
    rank: 5,
    avatar: null,
  },
  {
    id: "6",
    name: "Sarah Brown",
    username: "sarahb",
    points: 620,
    correctPredictions: 31,
    rank: 6,
    avatar: null,
  },
  {
    id: "7",
    name: "David Miller",
    username: "dmiller",
    points: 590,
    correctPredictions: 30,
    rank: 7,
    avatar: null,
  },
  {
    id: "8",
    name: "Jennifer Taylor",
    username: "jtaylor",
    points: 560,
    correctPredictions: 28,
    rank: 8,
    avatar: null,
  },
  {
    id: "9",
    name: "James Anderson",
    username: "janderson",
    points: 530,
    correctPredictions: 27,
    rank: 9,
    avatar: null,
  },
  {
    id: "10",
    name: "Lisa Thomas",
    username: "lthomas",
    points: 500,
    correctPredictions: 25,
    rank: 10,
    avatar: null,
  },
]

export async function GET(request: Request) {
  // Get query parameters
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
  const page = Number.parseInt(searchParams.get("page") || "1", 10)
  const search = searchParams.get("search")

  // Filter leaderboard based on search
  let filteredLeaderboard = [...leaderboard]

  if (search) {
    const searchLower = search.toLowerCase()
    filteredLeaderboard = filteredLeaderboard.filter(
      (user) => user.name.toLowerCase().includes(searchLower) || user.username.toLowerCase().includes(searchLower),
    )
  }

  // Paginate results
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedLeaderboard = filteredLeaderboard.slice(startIndex, endIndex)

  return NextResponse.json({
    data: paginatedLeaderboard,
    pagination: {
      total: filteredLeaderboard.length,
      page,
      limit,
      pages: Math.ceil(filteredLeaderboard.length / limit),
    },
  })
}

