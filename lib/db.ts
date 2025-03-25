import { PrismaClient } from "@prisma/client"

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db

// Helper functions for common database operations

const prisma = db;

// User functions
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,

      // username: true,
      role: true,
      bio: true,
      image: true,
      createdAt: true,
      settings: true,
      _count: {
        select: {
          votes: true,
        },
      },
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      settings: true,
    },
  })
}

export async function createUser(data: any) {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      username: data.username || data.email.split("@")[0],
      password: data.password,
      role: data.role || "user",
      settings: {
        create: {
          darkMode: false,
          emailNotifications: true,
          pushNotifications: true,
        },
      },
    },
    include: {
      settings: true,
    },
  })
}

export async function updateUser(id: string, data: any) {
  return prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      bio: data.bio,
      image: data.avatar,
      settings: data.settings
        ? {
          update: data.settings,
        }
        : undefined,
    },
    include: {
      settings: true,
    },
  })
}

export async function updateUserPassword(id: string, password: string) {
  return prisma.user.update({
    where: { id },
    data: { password },
  })
}

export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  })
}

export async function getUsers(search?: string, role?: string, limit = 50, offset = 0) {
  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
    ]
  }

  if (role) {
    where.role = role
  }

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      role: true,
      bio: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          votes: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
  })
}

// Team functions
export async function getTeams() {
  return prisma.team.findMany({
    orderBy: { name: "asc" },
  })
}

export async function getTeamById(id: string) {
  return prisma.team.findUnique({
    where: { id },
    include: {
      homeMatches: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
        orderBy: { date: "desc" },
        take: 5,
      },
      awayMatches: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
        orderBy: { date: "desc" },
        take: 5,
      },
    },
  })
}

export async function createTeam(data: any) {
  return prisma.team.create({
    data: {
      name: data.name,
      shortName: data.shortName,
      logo: data.logo,
      primaryColor: data.primaryColor,
    },
  })
}

export async function updateTeam(id: string, data: any) {
  return prisma.team.update({
    where: { id },
    data: {
      name: data.name,
      shortName: data.shortName,
      logo: data.logo,
      primaryColor: data.primaryColor,
    },
  })
}

export async function deleteTeam(id: string) {
  return prisma.team.delete({
    where: { id },
  })
}

// Match functions
export async function getMatches(status = "all", teamId?: string | null, limit = 50, offset = 0) {
  const where: any = {}

  if (status !== "all") {
    where.status = status.toUpperCase()
  }

  if (teamId) {
    where.OR = [{ team1Id: teamId }, { team2Id: teamId }]
  }

  return prisma.match.findMany({
    where,
    include: {
      homeTeam: true,
      awayTeam: true,
      polls: {
        select: {
          id: true,
          pollType: true,
          status: true,
          _count: {
            select: {
              votes: true,
            },
          },
        },
      },
    },
    orderBy: { date: "asc" },
    skip: offset,
    take: limit,
  })
}

export async function getMatchById(id: string) {
  return prisma.match.findUnique({
    where: { id },
    include: {
      homeTeam: true,
      awayTeam: true,
      polls: {
        include: {
          options: true,
          _count: {
            select: {
              votes: true,
            },
          },
        },
      },
    },
  })
}

export async function createMatch(data: any) {
  return prisma.match.create({
    data: {
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      date: data.date,
      venue: data.venue,
      status: data.status || "UPCOMING",
    },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  })
}

export async function updateMatch(id: string, data: any) {
  return prisma.match.update({
    where: { id },
    data: {
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      date: data.date,
      venue: data.venue,
      status: data.status,
      result: data.result,
      // resultDetails: data.resultDetails,
    },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  })
}

export async function deleteMatch(id: string) {
  return prisma.match.delete({
    where: { id },
  })
}

// Poll functions
export async function getPollsByStatus(status = "all", teamId?: string | null, limit = 100, offset = 0) {
  const where: any = {}

  if (status !== "all") {
    where.status = status.toUpperCase()
  }

  if (teamId) {
    where.match = {
      OR: [{ team1Id: teamId }, { team2Id: teamId }],
    }
  }

  return prisma.poll.findMany({
    where,
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
      options: true,
      _count: {
        select: {
          votes: true,
        },
      },
    },
    orderBy: [{ match: { date: "asc" } }, { createdAt: "desc" }],
    skip: offset,
    take: limit,
  })
}

// Polls
// export async function getPollById(id: string) {
//   return db.poll.findUnique({
//     where: { id },
//     include: {
//       options: true,
//     },
//   })
// }

export async function getPollById(id: string) {
  return prisma.poll.findUnique({
    where: { id },
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
      options: {
        include: {
          _count: {
            select: {
              votes: true,
            },
          },
        },
      },
      _count: {
        select: {
          votes: true,
        },
      },
    },
  })
}

export async function createPoll(data: any) {
  return prisma.poll.create({
    data: data,
    // data: {
    //   pollType: data.pollType,
    //   question: data.question,
    //   status: "ACTIVE",
    //   startTime: data.startTime || new Date(),
    //   endTime: data.endTime,
    //   homeTeamId: data.homeTeamId,
    //   awayTeamId: data.awayTeamId,
    //   date: data.date,
    //   pollEndTime: data.pollEndTime,
    //   // matchId: data.matchId,
    //   // createdById: data.createdBy,
    //   options: {
    //     create: data.options.map((option: any) => ({
    //       text: option.text,
    //       isCorrect: option.isCorrect || false,
    //     })),
    //   },
    // },
    // include: {
    //   match: {
    //     include: {
    //       homeTeam: true,
    //       awayTeam: true,
    //     },
    //   },
    //   options: true,
    // },
  })
}

export async function updatePoll(id: string, data: any) {
  const updateData: any = {}

  if (data.question) updateData.question = data.question
  if (data.status) updateData.status = data.status
  if (data.startTime) updateData.startTime = data.startTime
  if (data.endTime) updateData.endTime = data.endTime

  // Handle options update if provided
  if (data.options) {
    // First delete existing options
    await prisma.option.deleteMany({
      where: { pollId: id },
    })

    // Then create new options
    updateData.options = {
      create: data.options.map((option: any) => ({
        text: option.text,
        isCorrect: option.isCorrect || false,
      })),
    }
  }

  return prisma.poll.update({
    where: { id },
    data: updateData,
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
      options: true,
    },
  })
}

export async function deletePoll(id: string) {
  return prisma.poll.delete({
    where: { id },
  })
}

export async function settlePoll(id: string, correctOptionIds: string[]) {
  // First update poll status
  const updatedPoll = await prisma.poll.update({
    where: { id },
    data: {
      status: "SETTLED",
    },
    include: {
      options: true,
    },
  })

  // Then mark correct options
  for (const option of updatedPoll.options) {
    await prisma.option.update({
      where: { id: option.id },
      data: {
        isCorrect: correctOptionIds.includes(option.id),
      },
    })
  }

  // Award points to users who voted correctly
  const votes = await prisma.vote.findMany({
    where: {
      pollId: id,
      option: {
        id: {
          in: correctOptionIds,
        },
      },
    },
    include: {
      poll: true,
    },
  })

  // Calculate points based on poll type
  const pointsMap: any = {
    WINNER: 30,
    MOTM: 50,
    SCORE: 100,
    WICKETS: 80,
    CUSTOM: 40,
  }

  // Update votes with points
  for (const vote of votes) {
    const points = pointsMap[vote.poll.pollType] || 30

    await prisma.vote.update({
      where: { id: vote.id },
      data: { points },
    })
  }

  return getPollById(id)
}

// Votes
// export async function getUserVotes(userId: string) {
//   return db.vote.findMany({
//     where: { userId },
//     include: {
//       poll: true,
//       option: true,
//     },
//     orderBy: { createdAt: "desc" },
//   })
// }

// Vote functions
export async function getUserVotes(userId: string, pollId?: string | null) {
  const where: any = { userId }

  if (pollId) {
    where.pollId = pollId
  }

  return prisma.vote.findMany({
    where,
    include: {
      poll: {
        include: {
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
            },
          },
        },
      },
      option: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function createVote(data: any) {
  // Check if user has already voted on this poll
  const existingVote = await prisma.vote.findFirst({
    where: {
      userId: data.userId,
      pollId: data.pollId,
    },
  })

  if (existingVote) {
    throw new Error("User has already voted on this poll")
  }

  return prisma.vote.create({
    data: {
      userId: data.userId,
      pollId: data.pollId,
      optionId: data.optionId,
      points: 0, // Points are awarded when poll is settled
    },
    include: {
      poll: true,
      option: true,
    },
  })
}

// Teams
// export async function getAllTeams() {
//   return db.team.findMany({
//     orderBy: { name: "asc" },
//   })
// }

// export async function getTeamById(id: string) {
//   return db.team.findUnique({
//     where: { id },
//   })
// }

// Matches
// export async function getUpcomingMatches() {
//   return db.match.findMany({
//     where: {
//       date: {
//         gte: new Date(),
//       },
//     },
//     orderBy: { date: "asc" },
//     include: {
//       homeTeam: true,
//       awayTeam: true,
//     },
//   })
// }

// export async function getRecentMatches() {
//   return db.match.findMany({
//     where: {
//       date: {
//         lt: new Date(),
//       },
//     },
//     orderBy: { date: "desc" },
//     take: 5,
//     include: {
//       homeTeam: true,
//       awayTeam: true,
//     },
//   })
// }

// Comments
// export async function getMatchComments(matchId: string, page = 1, limit = 20) {
//   const skip = (page - 1) * limit

//   const [comments, total] = await Promise.all([
//     db.comment.findMany({
//       where: { matchId },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             image: true,
//           },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//       skip,
//       take: limit,
//     }),
//     db.comment.count({ where: { matchId } }),
//   ])

//   return {
//     comments,
//     meta: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   }
// }

// Comment functions
export async function getMatchComments(matchId: string, limit = 50, offset = 0) {
  return prisma.comment.findMany({
    where: { matchId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
  })
}

export async function createComment(data: any) {
  return prisma.comment.create({
    data: {
      matchId: data.matchId,
      userId: data.userId,
      text: data.text,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })
}

export async function updateComment(id: string, text: string) {
  return prisma.comment.update({
    where: { id },
    data: { text },
  })
}

export async function deleteComment(id: string) {
  return prisma.comment.delete({
    where: { id },
  })
}

// User predictions
// export async function getUserPredictions(userId: string, page = 1, limit = 10, status = "") {
//   const skip = (page - 1) * limit

//   const where: any = { userId }

//   if (status) {
//     where.poll = { status }
//   }

//   const [votes, total] = await Promise.all([
//     db.vote.findMany({
//       where,
//       include: {
//         poll: {
//           select: {
//             id: true,
//             question: true,
//             status: true,
//             pollEndTime: true,
//             team1: true,
//             team2: true,
//             matchId: true,
//           },
//         },
//         option: {
//           select: {
//             id: true,
//             text: true,
//             isCorrect: true,
//           },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//       skip,
//       take: limit,
//     }),
//     db.vote.count({ where }),
//   ])

//   // Format votes to include additional information
//   const predictions = votes.map((vote) => ({
//     id: vote.id,
//     pollId: vote.pollId,
//     question: vote.poll.question,
//     status: vote.poll.status,
//     pollEndTime: vote.poll.pollEndTime,
//     team1: vote.poll.team1,
//     team2: vote.poll.team2,
//     matchId: vote.poll.matchId,
//     option: vote.option.text,
//     isCorrect: vote.option.isCorrect,
//     points: vote.points,
//     createdAt: vote.createdAt,
//   }))

//   return {
//     predictions,
//     meta: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   }
// }

// Notifications
// export async function getUserNotifications(userId: string) {
//   return db.notification.findMany({
//     where: { userId },
//     orderBy: { createdAt: "desc" },
//   })
// }

// User Predictions
export async function getUserPredictions(userId: string) {
  return await prisma.vote.findMany({
    where: {
      userId: userId,
    },
    include: {
      poll: {
        include: {
          options: true,
          match: {
            include: {
              homeTeam: true,
              awayTeam: true,
            }
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

// Notification functions
export async function getUserNotifications(userId: string, unreadOnly = false, limit = 50, offset = 0) {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
  })
}

export async function getNotificationById(id: string) {
  return prisma.notification.findUnique({
    where: { id },
  })
}

export async function createNotification(data: any) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      message: data.message,
    },
  })
}

export async function markNotificationAsRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { read: true },
  })
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: { read: true },
  })
}

export async function deleteNotification(id: string) {
  return prisma.notification.delete({
    where: { id },
  })
}

// Leaderboard
// export async function getLeaderboard() {
//   return db.user.findMany({
//     select: {
//       id: true,
//       name: true,
//       image: true,
//       points: true,
//       rank: true,
//     },
//     orderBy: [{ points: "desc" }, { name: "asc" }],
//     take: 100,
//   })
// }

// Statistics functions
export async function getUserStatistics(userId: string) {
  // Get user's votes
  const votes = await prisma.vote.findMany({
    where: { userId },
    include: {
      poll: true,
      option: true,
    },
  })

  // Calculate statistics
  const totalPredictions = votes.length
  const correctPredictions = votes.filter((vote) => vote.option.isCorrect).length
  const accuracy = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0
  const points = votes.reduce((sum, vote) => sum + vote.points, 0)

  // Get user's rank
  const usersWithMorePoints = await prisma.user.count({
    where: {
      votes: {
        some: {},
      },
      id: {
        not: userId,
      },
    },
  })

  const rank = usersWithMorePoints + 1

  return {
    totalPredictions,
    correctPredictions,
    accuracy: Math.round(accuracy * 10) / 10, // Round to 1 decimal place
    points,
    rank,
  }
}

export async function getLeaderboard(limit = 100, offset = 0) {
  // Get all users with their votes
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      votes: {
        select: {
          points: true,
          option: {
            select: {
              isCorrect: true,
            },
          },
        },
      },
    },
    orderBy: {
      votes: {
        _count: "desc",
      },
    },
  })

  // Calculate points and correct predictions for each user
  const leaderboard = users.map((user) => {
    const points = user.votes.reduce((sum, vote) => sum + vote.points, 0)
    const predictions = user.votes.length
    const correctPredictions = user.votes.filter((vote) => vote.option.isCorrect).length

    return {
      id: user.id,
      name: user.name,
      username: user.username || user.name.toLowerCase().replace(/\s+/g, ""),
      image: user.image,
      points,
      predictions,
      correctPredictions,
    }
  })

  // Sort by points (descending)
  leaderboard.sort((a, b) => b.points - a.points)

  // Add rank
  const rankedLeaderboard = leaderboard.map((user, index) => ({
    ...user,
    rank: index + 1,
  }))

  // Apply pagination
  return rankedLeaderboard.slice(offset, offset + limit)
}

export async function getOverallStatistics(period = "all") {
  // Define date range based on period
  const dateFilter: any = {}
  const now = new Date()

  if (period === "day") {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    dateFilter.gte = yesterday
  } else if (period === "week") {
    const lastWeek = new Date(now)
    lastWeek.setDate(lastWeek.getDate() - 7)
    dateFilter.gte = lastWeek
  } else if (period === "month") {
    const lastMonth = new Date(now)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    dateFilter.gte = lastMonth
  }

  // Get counts with date filter
  const userCount = await prisma.user.count({
    where: period !== "all" ? { createdAt: dateFilter } : {},
  })

  const activeUserCount = await prisma.user.count({
    where: {
      votes: {
        some: period !== "all" ? { createdAt: dateFilter } : {},
      },
    },
  })

  const pollCount = await prisma.poll.count({
    where: period !== "all" ? { createdAt: dateFilter } : {},
  })

  const voteCount = await prisma.vote.count({
    where: period !== "all" ? { createdAt: dateFilter } : {},
  })

  const completedPollCount = await prisma.poll.count({
    where: {
      status: "SETTLED",
      ...(period !== "all" ? { createdAt: dateFilter } : {}),
    },
  })

  // Get poll type distribution
  const pollTypes = await prisma.poll.groupBy({
    by: ["pollType"],
    _count: true,
    where: period !== "all" ? { createdAt: dateFilter } : {},
  })

  // Get most popular poll
  const mostPopularPoll = await prisma.poll.findFirst({
    where: period !== "all" ? { createdAt: dateFilter } : {},
    select: {
      id: true,
      question: true,
      match: {
        select: {
          homeTeam: true,
          awayTeam: true,
        },
      },
      _count: {
        select: {
          votes: true,
        },
      },
    },
    orderBy: {
      votes: {
        _count: "desc",
      },
    },
  })

  // Calculate overall prediction accuracy
  const votes = await prisma.vote.findMany({
    where: period !== "all" ? { createdAt: dateFilter } : {},
    include: {
      option: true,
      poll: true,
    },
  })

  const totalVotes = votes.length
  const correctVotes = votes.filter((vote) => vote.option.isCorrect).length
  const overallAccuracy = totalVotes > 0 ? (correctVotes / totalVotes) * 100 : 0

  // Calculate accuracy by poll type
  const accuracyByType: any = {}

  for (const vote of votes) {
    const type = vote.poll.pollType

    if (!accuracyByType[type]) {
      accuracyByType[type] = {
        total: 0,
        correct: 0,
      }
    }

    accuracyByType[type].total++

    if (vote.option.isCorrect) {
      accuracyByType[type].correct++
    }
  }

  for (const type in accuracyByType) {
    const { total, correct } = accuracyByType[type]
    accuracyByType[type] = total > 0 ? Math.round((correct / total) * 100 * 10) / 10 : 0
  }

  return {
    users: {
      total: userCount,
      active: activeUserCount,
      growth: {
        daily: await getUserGrowth("day"),
        weekly: await getUserGrowth("week"),
        monthly: await getUserGrowth("month"),
      },
    },
    polls: {
      total: pollCount,
      completed: completedPollCount,
      byType: pollTypes,
      mostPopular: mostPopularPoll
        ? {
          id: mostPopularPoll.id,
          question: mostPopularPoll.question,
          teams: `${mostPopularPoll.match.homeTeam.name} vs ${mostPopularPoll.match.awayTeam.name}`,
          votes: mostPopularPoll._count.votes,
        }
        : null,
    },
    votes: {
      total: voteCount,
      accuracy: {
        overall: Math.round(overallAccuracy * 10) / 10,
        byType: accuracyByType,
      },
    },
  }
}

// Helper function to calculate user growth
async function getUserGrowth(period: "day" | "week" | "month") {
  const now = new Date()
  let startDate: Date

  if (period === "day") {
    startDate = new Date(now)
    startDate.setDate(startDate.getDate() - 1)
  } else if (period === "week") {
    startDate = new Date(now)
    startDate.setDate(startDate.getDate() - 7)
  } else {
    startDate = new Date(now)
    startDate.setMonth(startDate.getMonth() - 1)
  }

  const newUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
  })

  return newUsers
}

// Add the getAllPolls function
// export async function getAllPolls(page = 1, limit = 10, search = "", status = "", matchId = "") {
//   const skip = (page - 1) * limit

//   const where: any = {}

//   if (search) {
//     where.OR = [{ question: { contains: search } }, { team1: { contains: search } }, { team2: { contains: search } }]
//   }

//   if (status) {
//     where.status = status
//   }

//   if (matchId) {
//     where.matchId = matchId
//   }

//   const [polls, total] = await Promise.all([
//     db.poll.findMany({
//       where,
//       skip,
//       take: limit,
//       orderBy: { createdAt: "desc" },
//       include: {
//         options: {
//           select: {
//             id: true,
//             text: true,
//             isCorrect: true,
//             _count: {
//               select: {
//                 votes: true,
//               },
//             },
//           },
//         },
//         _count: {
//           select: {
//             votes: true,
//           },
//         },
//       },
//     }),
//     db.poll.count({ where }),
//   ])

//   // Format polls to include vote counts
//   const formattedPolls = polls.map((poll) => {
//     const options = poll.options.map((option) => ({
//       id: option.id,
//       text: option.text,
//       votes: option._count.votes,
//       isCorrect: option.isCorrect,
//     }))

//     return {
//       id: poll.id,
//       matchId: poll.matchId,
//       team1: poll.team1,
//       team2: poll.team2,
//       date: poll.date,
//       venue: poll.venue,
//       pollEndTime: poll.pollEndTime,
//       status: poll.status,
//       pollType: poll.pollType,
//       question: poll.question,
//       options,
//       totalVotes: poll._count.votes,
//     }
//   })

//   return {
//     polls: formattedPolls,
//     meta: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   }
// }

// Search
// export async function searchAll(query: string, limit = 5) {
//   const [users, teams, matches, polls] = await Promise.all([
//     db.user.findMany({
//       where: {
//         OR: [
//           { name: { contains: query, mode: "insensitive" } },
//           { username: { contains: query, mode: "insensitive" } },
//         ],
//       },
//       select: {
//         id: true,
//         name: true,
//   //         image: true,
//         points: true,
//         rank: true,
//       },
//       take: limit,
//     }),
//     db.team.findMany({
//       where: {
//         OR: [
//           { name: { contains: query, mode: "insensitive" } },
//           { shortName: { contains: query, mode: "insensitive" } },
//         ],
//       },
//       take: limit,
//     }),
//     db.match.findMany({
//       where: {
//         OR: [
//           { venue: { contains: query, mode: "insensitive" } },
//           { homeTeam: { name: { contains: query, mode: "insensitive" } } },
//           { awayTeam: { name: { contains: query, mode: "insensitive" } } },
//         ],
//       },
//       include: {
//         homeTeam: true,
//         awayTeam: true,
//       },
//       take: limit,
//     }),
//     db.poll.findMany({
//       where: {
//         OR: [
//           { question: { contains: query, mode: "insensitive" } },
//           { team1: { contains: query, mode: "insensitive" } },
//           { team2: { contains: query, mode: "insensitive" } },
//         ],
//       },
//       select: {
//         id: true,
//         question: true,
//         team1: true,
//         team2: true,
//         status: true,
//         pollType: true,
//       },
//       take: limit,
//     }),
//   ])

//   const formattedMatches = matches.map((match) => ({
//     id: match.id,
//     homeTeam: match.homeTeam.name,
//     awayTeam: match.awayTeam.name,
//     date: match.date,
//     venue: match.venue,
//     status: match.status,
//   }))

//   return {
//     users,
//     teams,
//     matches: formattedMatches,
//     polls,
//   }
// }

// Search function
export async function search(query: string, limit = 20) {
  if (!query || query.trim() === "") {
    return {
      users: [],
      teams: [],
      matches: [],
      polls: [],
    }
  }

  const searchTerm = query.trim()

  // Search users
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm } },
        { username: { contains: searchTerm } },
        { email: { contains: searchTerm } },
      ],
    },
    select: {
      id: true,
      name: true,
      image: true,
      role: true,
    },
    take: limit,
  })

  // Search teams
  const teams = await prisma.team.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm } },
        { shortName: { contains: searchTerm } },
      ],
    },
    take: limit,
  })

  // Search matches
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { venue: { contains: searchTerm } },
        { homeTeam: { name: { contains: searchTerm } } },
        { awayTeam: { name: { contains: searchTerm } } },
      ],
    },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
    take: limit,
  })

  // Search polls
  const polls = await prisma.poll.findMany({
    where: {
      OR: [
        { question: { contains: searchTerm } },
        { options: { some: { text: { contains: searchTerm } } } },
      ],
    },
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
    },
    take: limit,
  })

  return {
    users,
    teams,
    matches,
    polls,
  }
}

// User Predictions
// export async function getUserPredictions(userId: string) {
//   return await prisma.vote.findMany({
//     where: {
//       userId: userId
//     },
//     include: {
//       poll: {
//         include: {
//           match: true
//         }
//       }
//     },
//     orderBy: {
//       createdAt: 'desc'
//     }
//   });
// }

// Notifications
// export async function getUserNotifications(userId: string) {
//   return await prisma.notification.findMany({
//     where: {
//       userId: userId
//     },
//     orderBy: {
//       createdAt: 'desc'
//     }
//   });
// }

// export async function getNotification(id: string) {
//   return await prisma.notification.findUnique({
//     where: {
//       id: id
//     }
//   });
// }

// export async function markNotificationAsRead(id: string, isRead: boolean) {
//   return await prisma.notification.update({
//     where: {
//       id: id
//     },
//     data: {
//       isRead: isRead
//     }
//   });
// }

// User Settings
export async function getUserSettings(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      settings: true,
    },
  })

  return (
    user?.settings || {
      notifications: {
        emailNotifications: true,
        pollReminders: true,
        resultNotifications: false,
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
    }
  )
}

export async function updateUserSettings(userId: string, settings: any) {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      settings: settings,
    },
  })
}

// Matches
export async function getAllMatches({
  status,
  team,
  venue,
}: {
  status?: "upcoming" | "live" | "completed"
  team?: string
  venue?: string
} = {}) {
  const where: any = {}

  if (status) {
    where.status = status.toUpperCase()
  }

  if (team) {
    where.OR = [{ team1: { contains: team, mode: "insensitive" } }, { team2: { contains: team, mode: "insensitive" } }]
  }

  if (venue) {
    where.venue = { contains: venue, mode: "insensitive" }
  }

  return await prisma.match.findMany({
    where,
    include: {
      polls: true,
      awayTeam: true,
      homeTeam: true,
    },
    orderBy: {
      date: "asc",
    },
  })
}

