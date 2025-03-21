import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Clear existing data
  await prisma.notification.deleteMany({})
  await prisma.vote.deleteMany({})
  await prisma.option.deleteMany({})
  await prisma.poll.deleteMany({})
  await prisma.match.deleteMany({})
  await prisma.team.deleteMany({})
  await prisma.user.deleteMany({})

  // Create admin user
  const adminPassword = await hash("admin123", 10)
  const admin = await prisma.user.create({
    data: {
      email: "admin@iplprediction.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      points: 0,
      image: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
    },
  })
  console.log("Created admin user:", admin.email)

  // Create regular users
  const users = []
  for (let i = 1; i <= 20; i++) {
    const userPassword = await hash(`user${i}pass`, 10)
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        name: `Test User ${i}`,
        password: userPassword,
        role: "USER",
        points: Math.floor(Math.random() * 500),
        image: `https://ui-avatars.com/api/?name=Test+User+${i}&background=0D8ABC&color=fff`,
        settings: {
          notifications: {
            newPollNotifications: true,
            resultNotifications: true,
            matchReminders: true,
          },
          theme: "system",
          language: "en",
        },
      },
    })
    users.push(user)
    console.log(`Created user ${i}:`, user.email)
  }

  // Create IPL teams
  const teams = [
    {
      name: "Mumbai Indians",
      shortName: "MI",
      logo: "/teams/mi.png",
      primaryColor: "#004BA0",
    },
    {
      name: "Chennai Super Kings",
      shortName: "CSK",
      logo: "/teams/csk.png",
      primaryColor: "#FFFF00",
    },
    {
      name: "Royal Challengers Bangalore",
      shortName: "RCB",
      logo: "/teams/rcb.png",
      primaryColor: "#EC1C24",
    },
    {
      name: "Kolkata Knight Riders",
      shortName: "KKR",
      logo: "/teams/kkr.png",
      primaryColor: "#3A225D",
    },
    {
      name: "Delhi Capitals",
      shortName: "DC",
      logo: "/teams/dc.png",
      primaryColor: "#0078BC",
    },
    {
      name: "Punjab Kings",
      shortName: "PBKS",
      logo: "/teams/pbks.png",
      primaryColor: "#ED1B24",
    },
    {
      name: "Rajasthan Royals",
      shortName: "RR",
      logo: "/teams/rr.png",
      primaryColor: "#254AA5",
    },
    {
      name: "Sunrisers Hyderabad",
      shortName: "SRH",
      logo: "/teams/srh.png",
      primaryColor: "#FF822A",
    },
    {
      name: "Gujarat Titans",
      shortName: "GT",
      logo: "/teams/gt.png",
      primaryColor: "#1C1C1C",
    },
    {
      name: "Lucknow Super Giants",
      shortName: "LSG",
      logo: "/teams/lsg.png",
      primaryColor: "#A72056",
    },
  ]

  const createdTeams = []
  for (const team of teams) {
    const createdTeam = await prisma.team.create({
      data: team,
    })
    createdTeams.push(createdTeam)
  }
  console.log(`Created ${teams.length} IPL teams`)

  // Get all teams for creating matches
  const allTeams = await prisma.team.findMany()
  const teamMap = new Map(allTeams.map((team) => [team.shortName, team]))

  // Create upcoming matches (next 15 days)
  const today = new Date()
  const upcomingMatches = []

  // Generate 20 upcoming matches over the next 15 days
  for (let i = 1; i <= 20; i++) {
    const randomDayOffset = Math.floor(Math.random() * 15) + 1
    const matchDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + randomDayOffset)

    // Set match time to either 3:30 PM or 7:30 PM
    matchDate.setHours(Math.random() > 0.5 ? 15 : 19, 30, 0, 0)

    // Select two random teams
    const teamIndices = getRandomPair(0, teams.length - 1)
    const homeTeam = createdTeams[teamIndices[0]]
    const awayTeam = createdTeams[teamIndices[1]]

    // Select a random venue
    const venues = [
      `${homeTeam.name} Stadium`,
      "Wankhede Stadium, Mumbai",
      "M. Chinnaswamy Stadium, Bangalore",
      "Eden Gardens, Kolkata",
      "Arun Jaitley Stadium, Delhi",
      "M. A. Chidambaram Stadium, Chennai",
      "Punjab Cricket Association Stadium, Mohali",
      "Rajiv Gandhi International Stadium, Hyderabad",
      "Narendra Modi Stadium, Ahmedabad",
      "BRSABV Ekana Cricket Stadium, Lucknow",
    ]
    const venue = venues[Math.floor(Math.random() * venues.length)]

    upcomingMatches.push({
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      date: matchDate,
      venue: venue,
      status: "UPCOMING",
    })
  }

  const createdUpcomingMatches = []
  for (const match of upcomingMatches) {
    const createdMatch = await prisma.match.create({
      data: {
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        date: match.date,
        venue: match.venue,
        // status: match.status,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })
    createdUpcomingMatches.push(createdMatch)
  }
  console.log(`Created ${upcomingMatches.length} upcoming matches`)

  // Create live matches (1-2 matches)
  const liveMatches = []
  for (let i = 0; i < 2; i++) {
    const matchDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // Set match time to current time minus 1-2 hours
    matchDate.setHours(today.getHours() - (1 + Math.floor(Math.random() * 2)))

    // Select two random teams
    const teamIndices = getRandomPair(0, teams.length - 1)
    const homeTeam = createdTeams[teamIndices[0]]
    const awayTeam = createdTeams[teamIndices[1]]

    // Select a random venue
    const venues = [`${homeTeam.name} Stadium`, "Wankhede Stadium, Mumbai", "M. Chinnaswamy Stadium, Bangalore"]
    const venue = venues[Math.floor(Math.random() * venues.length)]

    // Generate random scores (in progress)
    const homeScore = Math.floor(Math.random() * 180) + 20
    const awayScore = Math.floor(Math.random() * 100)

    liveMatches.push({
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      date: matchDate,
      venue: venue,
      status: "LIVE",
      homeScore: homeScore,
      awayScore: awayScore,
    })
  }

  const createdLiveMatches = []
  for (const match of liveMatches) {
    const createdMatch = await prisma.match.create({
      data: {
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        date: match.date,
        venue: match.venue,
        // status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })
    createdLiveMatches.push(createdMatch)
  }
  console.log(`Created ${liveMatches.length} live matches`)

  // Create completed matches (past 30 days)
  const completedMatches = []

  // Generate 30 completed matches over the past 30 days
  for (let i = 1; i <= 30; i++) {
    const randomDayOffset = Math.floor(Math.random() * 30) + 1
    const matchDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - randomDayOffset)

    // Set match time to either 3:30 PM or 7:30 PM
    matchDate.setHours(Math.random() > 0.5 ? 15 : 19, 30, 0, 0)

    // Select two random teams
    const teamIndices = getRandomPair(0, teams.length - 1)
    const homeTeam = createdTeams[teamIndices[0]]
    const awayTeam = createdTeams[teamIndices[1]]

    // Select a random venue
    const venues = [
      `${homeTeam.name} Stadium`,
      "Wankhede Stadium, Mumbai",
      "M. Chinnaswamy Stadium, Bangalore",
      "Eden Gardens, Kolkata",
      "Arun Jaitley Stadium, Delhi",
      "M. A. Chidambaram Stadium, Chennai",
      "Punjab Cricket Association Stadium, Mohali",
      "Rajiv Gandhi International Stadium, Hyderabad",
      "Narendra Modi Stadium, Ahmedabad",
      "BRSABV Ekana Cricket Stadium, Lucknow",
    ]
    const venue = venues[Math.floor(Math.random() * venues.length)]

    // Generate random scores
    const homeScore = Math.floor(Math.random() * 100) + 100
    const awayScore = Math.floor(Math.random() * 100) + 100

    completedMatches.push({
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      date: matchDate,
      venue: venue,
      status: "COMPLETED",
      homeScore: homeScore,
      awayScore: awayScore,
    })
  }

  const createdCompletedMatches = []
  for (const match of completedMatches) {
    const createdMatch = await prisma.match.create({
      data: {
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        date: match.date,
        venue: match.venue,
        // status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    })
    createdCompletedMatches.push(createdMatch)
  }
  console.log(`Created ${completedMatches.length} completed matches`)

  // Create polls for upcoming matches
  const pollTypes = ["WINNER", "MOTM", "SCORE", "WICKETS", "CUSTOM"]
  const pollQuestions = {
    WINNER: (homeTeam, awayTeam) => `Who will win the match between ${homeTeam} and ${awayTeam}?`,
    MOTM: (homeTeam, awayTeam) => `Who will be the Man of the Match in ${homeTeam} vs ${awayTeam}?`,
    SCORE: (homeTeam, awayTeam) =>
      `What will be the total score in the match between ${homeTeam} and ${awayTeam}?`,
    WICKETS: (homeTeam, awayTeam) =>
      `How many wickets will fall in the match between ${homeTeam} and ${awayTeam}?`,
    CUSTOM: (homeTeam, awayTeam) =>
      `Which team will score more boundaries in ${homeTeam} vs ${awayTeam}?`,
  }

  // Create polls for upcoming matches
  for (const match of createdUpcomingMatches) {
    // Create 2-3 polls for each match
    const numPolls = Math.floor(Math.random() * 2) + 2
    const usedPollTypes = new Set()

    for (let i = 0; i < numPolls; i++) {
      // Select a random poll type that hasn't been used for this match
      let pollType;
      do {
        pollType = pollTypes[Math.floor(Math.random() * pollTypes.length)]
      } while (usedPollTypes.has(pollType))
      usedPollTypes.add(pollType)

      // Create poll
      const pollEndTime = new Date(match.date.getTime() - 30 * 60 * 1000) // 30 minutes before match

      const pollData = {
        matchId: match.id,
        team1: match.homeTeamId,
        team2: match.awayTeamId,
        date: match.date,
        venue: match.venue,
        pollEndTime: pollEndTime,
        status: "ACTIVE",
        pollType: pollType,
        question: pollQuestions[pollType](match.homeTeamId, match.awayTeamId),
      }

      // Create options based on poll type
      let options = []

      switch (pollType) {
        case "WINNER":
          options = [{ text: match.homeTeamId }, { text: match.awayTeamId }]
          break
        case "MOTM":
          options = [{ text: `Player from ${match.homeTeamId}` }, { text: `Player from ${match.awayTeamId}` }]
          break
        case "SCORE":
          options = [
            { text: "Under 300 runs" },
            { text: "300-350 runs" },
            { text: "351-400 runs" },
            { text: "Above 400 runs" },
          ]
          break
        case "WICKETS":
          options = [
            { text: "0-5 wickets" },
            { text: "6-10 wickets" },
            { text: "11-15 wickets" },
            { text: "16-20 wickets" },
          ]
          break
        case "CUSTOM":
          options = [
            { text: match.homeTeamId },
            { text: match.awayTeamId },
            { text: "Equal number of boundaries" },
          ]
          break
      }

      // Create poll with options
      const poll = await prisma.poll.create({
        data: {
          ...pollData,
          options: {
            create: options,
          },
        },
        include: {
          options: true,
        },
      })

      // Create votes for this poll (30-70% of users vote)
      const votingUsers = users.filter(() => Math.random() < 0.5)

      for (const user of votingUsers) {
        // Select a random option
        const randomOption = poll.options[Math.floor(Math.random() * poll.options.length)]

        // Create vote
        await prisma.vote.create({
          data: {
            userId: user.id,
            pollId: poll.id,
            optionId: randomOption.id,
            points: 0, // No points yet since match hasn't happened
          },
        })
      }
    }
  }
  console.log(`Created polls for upcoming matches`)

  // Create polls for live matches
  for (const match of createdLiveMatches) {
    // Create 2-3 polls for each match
    const numPolls = Math.floor(Math.random() * 2) + 2
    const usedPollTypes = new Set()

    for (let i = 0; i < numPolls; i++) {
      // Select a random poll type that hasn't been used for this match
      let pollType
      do {
        pollType = pollTypes[Math.floor(Math.random() * pollTypes.length)]
      } while (usedPollTypes.has(pollType))
      usedPollTypes.add(pollType)

      // Create poll
      const pollEndTime = new Date(match.date.getTime() - 30 * 60 * 1000) // 30 minutes before match

      const pollData = {
        matchId: match.id,
        team1: match.homeTeamId,
        team2: match.awayTeamId,
        date: match.date,
        venue: match.venue,
        pollEndTime: pollEndTime,
        status: "CLOSED", // Polls for live matches are closed
        pollType: pollType,
        question: pollQuestions[pollType](match.homeTeamId, match.awayTeamId),
      }

      // Create options based on poll type
      let options = []

      switch (pollType) {
        case "WINNER":
          options = [{ text: match.homeTeamId }, { text: match.awayTeamId }]
          break
        case "MOTM":
          options = [{ text: `Player from ${match.homeTeamId}` }, { text: `Player from ${match.awayTeamId}` }]
          break
        case "SCORE":
          options = [
            { text: "Under 300 runs" },
            { text: "300-350 runs" },
            { text: "351-400 runs" },
            { text: "Above 400 runs" },
          ]
          break
        case "WICKETS":
          options = [
            { text: "0-5 wickets" },
            { text: "6-10 wickets" },
            { text: "11-15 wickets" },
            { text: "16-20 wickets" },
          ]
          break
        case "CUSTOM":
          options = [
            { text: match.homeTeamId },
            { text: match.awayTeamId },
            { text: "Equal number of boundaries" },
          ]
          break
      }

      // Create poll with options
      const poll = await prisma.poll.create({
        data: {
          ...pollData,
          options: {
            create: options,
          },
        },
        include: {
          options: true,
        },
      })

      // Create votes for this poll (50-90% of users vote)
      const votingUsers = users.filter(() => Math.random() < 0.7)

      for (const user of votingUsers) {
        // Select a random option
        const randomOption = poll.options[Math.floor(Math.random() * poll.options.length)]

        // Create vote
        await prisma.vote.create({
          data: {
            userId: user.id,
            pollId: poll.id,
            optionId: randomOption.id,
            points: 0, // No points yet since match hasn't been settled
          },
        })
      }
    }
  }
  console.log(`Created polls for live matches`)

  // Create polls for completed matches
  for (const match of createdCompletedMatches) {
    // Create 2-3 polls for each match
    const numPolls = Math.floor(Math.random() * 2) + 2
    const usedPollTypes = new Set()

    for (let i = 0; i < numPolls; i++) {
      // Select a random poll type that hasn't been used for this match
      let pollType
      do {
        pollType = pollTypes[Math.floor(Math.random() * pollTypes.length)]
      } while (usedPollTypes.has(pollType))
      usedPollTypes.add(pollType)

      // Create poll
      const pollEndTime = new Date(match.date.getTime() - 30 * 60 * 1000) // 30 minutes before match

      const pollData = {
        matchId: match.id,
        team1: match.homeTeamId,
        team2: match.awayTeamId,
        date: match.date,
        venue: match.venue,
        pollEndTime: pollEndTime,
        status: "SETTLED", // Polls for completed matches are settled
        pollType: pollType,
        question: pollQuestions[pollType](match.homeTeamId, match.awayTeamId),
      }

      // Create options based on poll type
      let options = []

      // Determine correct option based on match result
      const homeTeamWon = (match.homeScore || 0) > (match.awayScore || 0)
      const totalScore = (match.homeScore || 0) + (match.awayScore || 0)

      switch (pollType) {
        case "WINNER":
          options = [
            { text: match.homeTeamId, isCorrect: homeTeamWon },
            { text: match.awayTeamId, isCorrect: !homeTeamWon },
          ]
          break
        case "MOTM":
          // Randomly select a team for MOTM
          const motmFromHomeTeam = Math.random() < 0.6 ? homeTeamWon : !homeTeamWon
          options = [
            { text: `Player from ${match.homeTeamId}`, isCorrect: motmFromHomeTeam },
            { text: `Player from ${match.awayTeamId}`, isCorrect: !motmFromHomeTeam },
          ]
          break
        case "SCORE":
          let correctScoreOption
          if (totalScore < 300) correctScoreOption = "Under 300 runs"
          else if (totalScore <= 350) correctScoreOption = "300-350 runs"
          else if (totalScore <= 400) correctScoreOption = "351-400 runs"
          else correctScoreOption = "Above 400 runs"

          options = [
            { text: "Under 300 runs", isCorrect: correctScoreOption === "Under 300 runs" },
            { text: "300-350 runs", isCorrect: correctScoreOption === "300-350 runs" },
            { text: "351-400 runs", isCorrect: correctScoreOption === "351-400 runs" },
            { text: "Above 400 runs", isCorrect: correctScoreOption === "Above 400 runs" },
          ]
          break
        case "WICKETS":
          // Randomly determine number of wickets
          const totalWickets = Math.floor(Math.random() * 20) + 1
          let correctWicketsOption

          if (totalWickets <= 5) correctWicketsOption = "0-5 wickets"
          else if (totalWickets <= 10) correctWicketsOption = "6-10 wickets"
          else if (totalWickets <= 15) correctWicketsOption = "11-15 wickets"
          else correctWicketsOption = "16-20 wickets"

          options = [
            { text: "0-5 wickets", isCorrect: correctWicketsOption === "0-5 wickets" },
            { text: "6-10 wickets", isCorrect: correctWicketsOption === "6-10 wickets" },
            { text: "11-15 wickets", isCorrect: correctWicketsOption === "11-15 wickets" },
            { text: "16-20 wickets", isCorrect: correctWicketsOption === "16-20 wickets" },
          ]
          break
        case "CUSTOM":
          // Randomly determine which team scored more boundaries
          const randomValue = Math.random()
          let correctBoundariesOption

          if (randomValue < 0.4) correctBoundariesOption = match.homeTeamId
          else if (randomValue < 0.8) correctBoundariesOption = match.awayTeamId
          else correctBoundariesOption = "Equal number of boundaries"

          options = [
            { text: match.homeTeamId, isCorrect: correctBoundariesOption === match.homeTeamId },
            { text: match.awayTeamId, isCorrect: correctBoundariesOption === match.awayTeamId },
            { text: "Equal number of boundaries", isCorrect: correctBoundariesOption === "Equal number of boundaries" },
          ]
          break
      }

      // Create poll with options
      const poll = await prisma.poll.create({
        data: {
          ...pollData,
          options: {
            create: options,
          },
        },
        include: {
          options: true,
        },
      })

      // Create votes for this poll (70-100% of users vote)
      const votingUsers = users.filter(() => Math.random() < 0.85)

      for (const user of votingUsers) {
        // Select a random option
        const randomOption = poll.options[Math.floor(Math.random() * poll.options.length)]

        // Determine points (10 points if correct, 0 if incorrect)
        const points = randomOption.isCorrect ? 10 : 0

        // Create vote
        await prisma.vote.create({
          data: {
            userId: user.id,
            pollId: poll.id,
            optionId: randomOption.id,
            points: points,
          },
        })
      }
    }
  }
  console.log(`Created polls for completed matches`)

  // Update user points based on votes
  for (const user of users) {
    const userVotes = await prisma.vote.findMany({
      where: { userId: user.id },
    })

    const totalPoints = userVotes.reduce((sum, vote) => sum + vote.points, 0)

    await prisma.user.update({
      where: { id: user.id },
      data: { points: totalPoints },
    })
  }
  console.log(`Updated user points based on votes`)

  // Update user ranks based on points
  const rankedUsers = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { points: "desc" },
  })

  for (let i = 0; i < rankedUsers.length; i++) {
    await prisma.user.update({
      where: { id: rankedUsers[i].id },
      data: { rank: i + 1 },
    })
  }
  console.log(`Updated user ranks based on points`)

  // Create notifications for users
  const notificationTypes = [
    "POLL_CREATED",
    "POLL_CLOSED",
    "POLL_SETTLED",
    "MATCH_REMINDER",
    "POINTS_AWARDED",
    "SYSTEM",
  ]

  const notificationMessages = {
    POLL_CREATED: "New polls have been created for upcoming matches!",
    POLL_CLOSED: "Polls for today's match have been closed. Results will be announced after the match.",
    POLL_SETTLED: "Results are in! Check how many points you earned.",
    MATCH_REMINDER: "Don't forget! Match starts in 1 hour.",
    POINTS_AWARDED: "Congratulations! You earned points for your correct predictions.",
    SYSTEM: "Welcome to IPL Prediction Portal! Start predicting and earning points.",
  }

  for (const user of users) {
    // Create 3-7 notifications for each user
    const numNotifications = Math.floor(Math.random() * 5) + 3

    for (let i = 0; i < numNotifications; i++) {
      const notificationType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
      const isRead = Math.random() < 0.5

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: notificationType,
          message: notificationMessages[notificationType],
          isRead: isRead,
        },
      })
    }
  }
  console.log(`Created notifications for users`)

  console.log("Database seeding completed!")
}

// Helper function to get a random pair of unique indices
function getRandomPair(min, max) {
  const first = Math.floor(Math.random() * (max - min + 1)) + min
  let second
  do {
    second = Math.floor(Math.random() * (max - min + 1)) + min
  } while (second === first)

  return [first, second]
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

