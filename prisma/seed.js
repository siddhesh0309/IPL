import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.notification.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.vote.deleteMany({});
  await prisma.option.deleteMany({});
  await prisma.poll.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.user.deleteMany({});

  // Create admin user
  const adminPassword = await hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@iplprediction.com",
      name: "Admin User",
      username: "admin",
      password: adminPassword,
      role: "ADMIN",
      points: 0,
      image:
        "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
      settings: undefined,
      // settings: {
      //   notifications: {
      //     emailNotifications: true,
      //     pushNotifications: true,
      //     newPollNotifications: true,
      //     resultNotifications: true,
      //     matchReminders: true,
      //     leaderboardUpdates: true,
      //     predictionResults: true,
      //     systemAnnouncements: true,
      //   },
      //   privacy: {
      //     showProfilePublicly: true,
      //     showPredictionsPublicly: true,
      //     showPointsPublicly: true,
      //     allowTagging: true,
      //   },
      //   theme: {
      //     darkMode: false,
      //     highContrast: false,
      //     reducedMotion: false,
      //   },
      //   language: "en",
      // },
    },
  });
  console.log("Created admin user:", admin.email);

  // Create regular users with realistic names
  const userNames = [
    "Virat Kohli",
    "Rohit Sharma",
    "MS Dhoni",
    "KL Rahul",
    "Rishabh Pant",
    "Hardik Pandya",
    "Ravindra Jadeja",
    "Jasprit Bumrah",
    "Shikhar Dhawan",
    "Shreyas Iyer",
    "Suryakumar Yadav",
    "Yuzvendra Chahal",
    "Bhuvneshwar Kumar",
    "Ravichandran Ashwin",
    "Mohammed Shami",
    "Ishan Kishan",
    "Deepak Chahar",
    "Shardul Thakur",
    "Axar Patel",
    "Washington Sundar",
    "Prithvi Shaw",
    "Sanju Samson",
    "Mayank Agarwal",
    "Krunal Pandya",
    "T Natarajan",
  ];

  const users = [];
  for (let i = 0; i < userNames.length; i++) {
    const name = userNames[i];
    const username = name.toLowerCase().replace(/\s+/g, "");
    const email = username + "@example.com";
    const userPassword = await hash(`user${i + 1}pass`, 10);

    const user = await prisma.user.create({
      data: {
        email: email,
        name: name,
        username: username,
        password: userPassword,
        role: "USER",
        points: Math.floor(Math.random() * 1000),
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name
        )}&background=0D8ABC&color=fff`,
        settings: undefined,
        // settings: {
        //   notifications: {
        //     emailNotifications: Math.random() > 0.2,
        //     pushNotifications: Math.random() > 0.3,
        //     newPollNotifications: Math.random() > 0.2,
        //     resultNotifications: Math.random() > 0.1,
        //     matchReminders: Math.random() > 0.3,
        //     leaderboardUpdates: Math.random() > 0.4,
        //     predictionResults: Math.random() > 0.1,
        //     systemAnnouncements: Math.random() > 0.2,
        //   },
        //   privacy: {
        //     showProfilePublicly: Math.random() > 0.1,
        //     showPredictionsPublicly: Math.random() > 0.2,
        //     showPointsPublicly: Math.random() > 0.1,
        //     allowTagging: Math.random() > 0.3,
        //   },
        //   theme: {
        //     darkMode: Math.random() > 0.5,
        //     highContrast: Math.random() > 0.8,
        //     reducedMotion: Math.random() > 0.7,
        //   },
        //   language: "en",
        // },
      },
    });
    users.push(user);
    console.log(`Created user ${i + 1}:`, user.email);
  }

  // Create IPL teams with accurate data
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
  ];

  const createdTeams = [];
  for (const team of teams) {
    const createdTeam = await prisma.team.create({
      data: team,
    });
    createdTeams.push(createdTeam);
  }
  console.log(`Created ${teams.length} IPL teams`);

  // IPL venues with accurate details
  const venues = [
    { name: "Wankhede Stadium", city: "Mumbai", capacity: 33000 },
    { name: "M. A. Chidambaram Stadium", city: "Chennai", capacity: 50000 },
    { name: "M. Chinnaswamy Stadium", city: "Bangalore", capacity: 40000 },
    { name: "Eden Gardens", city: "Kolkata", capacity: 68000 },
    { name: "Arun Jaitley Stadium", city: "Delhi", capacity: 41000 },
    {
      name: "Punjab Cricket Association Stadium",
      city: "Mohali",
      capacity: 26000,
    },
    { name: "Sawai Mansingh Stadium", city: "Jaipur", capacity: 30000 },
    {
      name: "Rajiv Gandhi International Stadium",
      city: "Hyderabad",
      capacity: 39000,
    },
    { name: "Narendra Modi Stadium", city: "Ahmedabad", capacity: 132000 },
    { name: "BRSABV Ekana Cricket Stadium", city: "Lucknow", capacity: 50000 },
    { name: "Brabourne Stadium", city: "Mumbai", capacity: 20000 },
    { name: "DY Patil Stadium", city: "Navi Mumbai", capacity: 55000 },
  ];

  // Get all teams for creating matches
  const allTeams = await prisma.team.findMany();
  const teamMap = new Map(allTeams.map((team) => [team.shortName, team]));

  // Create upcoming matches (next 15 days)
  const today = new Date();
  const upcomingMatches = [];

  // Generate 20 upcoming matches over the next 15 days
  for (let i = 1; i <= 20; i++) {
    const randomDayOffset = Math.floor(Math.random() * 15) + 1;
    const matchDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + randomDayOffset
    );

    // Set match time to either 3:30 PM or 7:30 PM
    matchDate.setHours(Math.random() > 0.5 ? 15 : 19, 30, 0, 0);

    // Select two random teams
    const teamIndices = getRandomPair(0, teams.length - 1);
    const homeTeam = createdTeams[teamIndices[0]];
    const awayTeam = createdTeams[teamIndices[1]];

    // Select a random venue
    const venue = venues[Math.floor(Math.random() * venues.length)];
    const venueString = `${venue.name}, ${venue.city}`;

    upcomingMatches.push({
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      date: matchDate,
      venue: venueString,
      status: "UPCOMING",
    });
  }

  const createdUpcomingMatches = [];
  for (const match of upcomingMatches) {
    const createdMatch = await prisma.match.create({
      data: {
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        date: match.date,
        venue: match.venue,
        status: match.status,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
    createdUpcomingMatches.push(createdMatch);
  }
  console.log(`Created ${upcomingMatches.length} upcoming matches`);

  // Create live matches (1-2 matches)
  const liveMatches = [];
  for (let i = 0; i < 2; i++) {
    const matchDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Set match time to current time minus 1-2 hours
    matchDate.setHours(today.getHours() - (1 + Math.floor(Math.random() * 2)));

    // Select two random teams
    const teamIndices = getRandomPair(0, teams.length - 1);
    const homeTeam = createdTeams[teamIndices[0]];
    const awayTeam = createdTeams[teamIndices[1]];

    // Select a random venue
    const venue = venues[Math.floor(Math.random() * venues.length)];
    const venueString = `${venue.name}, ${venue.city}`;

    // Generate random scores (in progress)
    const homeScore = Math.floor(Math.random() * 180) + 20;
    const awayScore = Math.floor(Math.random() * 100);

    liveMatches.push({
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      date: matchDate,
      venue: venueString,
      status: "LIVE",
      homeScore: homeScore,
      awayScore: awayScore,
    });
  }

  const createdLiveMatches = [];
  for (const match of liveMatches) {
    const createdMatch = await prisma.match.create({
      data: {
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        date: match.date,
        venue: match.venue,
        status: match.status,
        homeTeamScore: match.homeScore,
        awayTeamScore: match.awayScore,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
    createdLiveMatches.push(createdMatch);
  }
  console.log(`Created ${liveMatches.length} live matches`);

  // Create completed matches (past 30 days)
  const completedMatches = [];

  // Generate 30 completed matches over the past 30 days
  for (let i = 1; i <= 30; i++) {
    const randomDayOffset = Math.floor(Math.random() * 30) + 1;
    const matchDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - randomDayOffset
    );

    // Set match time to either 3:30 PM or 7:30 PM
    matchDate.setHours(Math.random() > 0.5 ? 15 : 19, 30, 0, 0);

    // Select two random teams
    const teamIndices = getRandomPair(0, teams.length - 1);
    const homeTeam = createdTeams[teamIndices[0]];
    const awayTeam = createdTeams[teamIndices[1]];

    // Select a random venue
    const venue = venues[Math.floor(Math.random() * venues.length)];
    const venueString = `${venue.name}, ${venue.city}`;

    // Generate random scores
    const homeScore = Math.floor(Math.random() * 100) + 100;
    const awayScore = Math.floor(Math.random() * 100) + 100;

    // Determine match result
    const homeTeamWon = homeScore > awayScore;
    const result = homeTeamWon
      ? `${homeTeam.name} won by ${Math.floor(Math.random() * 9) + 1} wickets`
      : `${awayTeam.name} won by ${Math.floor(Math.random() * 50) + 1} runs`;

    completedMatches.push({
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      date: matchDate,
      venue: venueString,
      status: "COMPLETED",
      homeScore: homeScore,
      awayScore: awayScore,
      result: result,
    });
  }

  const createdCompletedMatches = [];
  for (const match of completedMatches) {
    const createdMatch = await prisma.match.create({
      data: {
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        date: match.date,
        venue: match.venue,
        status: match.status,
        homeTeamScore: match.homeScore,
        awayTeamScore: match.awayScore,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });
    createdCompletedMatches.push(createdMatch);

    // Add comments for completed matches
    const numComments = Math.floor(Math.random() * 10) + 5;
    for (let i = 0; i < numComments; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const commentDate = new Date(match.date);
      commentDate.setHours(
        commentDate.getHours() + Math.floor(Math.random() * 5)
      );

      await prisma.comment.create({
        data: {
          matchId: createdMatch.id,
          userId: randomUser.id,
          text: getRandomComment(
            createdMatch.homeTeam.name,
            createdMatch.awayTeam.name
          ),
          createdAt: commentDate,
        },
      });
    }
  }
  console.log(
    `Created ${completedMatches.length} completed matches with comments`
  );

  // Create polls for upcoming matches
  const pollTypes = ["WINNER", "MOTM", "SCORE", "WICKETS", "CUSTOM"];
  const pollQuestions = {
    WINNER: (homeTeam, awayTeam) =>
      `Who will win the match between ${homeTeam} and ${awayTeam}?`,
    MOTM: (homeTeam, awayTeam) =>
      `Who will be the Man of the Match in ${homeTeam} vs ${awayTeam}?`,
    SCORE: (homeTeam, awayTeam) =>
      `What will be the total score in the match between ${homeTeam} and ${awayTeam}?`,
    WICKETS: (homeTeam, awayTeam) =>
      `How many wickets will fall in the match between ${homeTeam} and ${awayTeam}?`,
    CUSTOM: (homeTeam, awayTeam) =>
      `Which team will score more boundaries in ${homeTeam} vs ${awayTeam}?`,
  };

  // Create polls for upcoming matches
  for (const match of createdUpcomingMatches) {
    // Create 2-3 polls for each match
    const numPolls = Math.floor(Math.random() * 2) + 2;
    const usedPollTypes = new Set();

    for (let i = 0; i < numPolls; i++) {
      // Select a random poll type that hasn't been used for this match
      let pollType;
      do {
        pollType = pollTypes[Math.floor(Math.random() * pollTypes.length)];
      } while (usedPollTypes.has(pollType));
      usedPollTypes.add(pollType);

      // Create poll
      const pollEndTime = new Date(match.date.getTime() - 30 * 60 * 1000); // 30 minutes before match

      const pollData = {
        matchId: match.id,
        type: pollType,
        question: pollQuestions[pollType](
          match.homeTeam.name,
          match.awayTeam.name
        ),
        status: "ACTIVE",
        startTime: new Date(),
        endTime: pollEndTime,
      };

      // Create options based on poll type
      let options = [];

      switch (pollType) {
        case "WINNER":
          options = [
            { text: match.homeTeam.name },
            { text: match.awayTeam.name },
          ];
          break;
        case "MOTM":
          options = [
            { text: `Player from ${match.homeTeam.name}` },
            { text: `Player from ${match.awayTeam.name}` },
          ];
          break;
        case "SCORE":
          options = [
            { text: "Under 300 runs" },
            { text: "300-350 runs" },
            { text: "351-400 runs" },
            { text: "Above 400 runs" },
          ];
          break;
        case "WICKETS":
          options = [
            { text: "0-5 wickets" },
            { text: "6-10 wickets" },
            { text: "11-15 wickets" },
            { text: "16-20 wickets" },
          ];
          break;
        case "CUSTOM":
          options = [
            { text: match.homeTeam.name },
            { text: match.awayTeam.name },
            { text: "Equal number of boundaries" },
          ];
          break;
      }

      // Create poll with options
      const poll = await prisma.poll.create({
        data: {
          ...pollData,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          pollType: pollType,
          pollEndTime: pollEndTime,
          options: {
            create: options,
          },
          date: match.date,
          venue: match.venue,
          // homeTeamScore: match.homeTeamScore,
          // awayTeamScore: match.awayTeamScore,
          result: match.result,
          // status: match.status,
        },
        include: {
          options: true,
        },
      });

      // Create votes for this poll (30-70% of users vote)
      const votingUsers = users.filter(() => Math.random() < 0.5);

      for (const user of votingUsers) {
        // Select a random option
        const randomOption =
          poll.options[Math.floor(Math.random() * poll.options.length)];

        // Create vote
        await prisma.vote.create({
          data: {
            userId: user.id,
            pollId: poll.id,
            optionId: randomOption.id,
            points: 0, // No points yet since match hasn't happened
          },
        });
      }

      // Create notifications for this poll
      for (const user of users) {
        if (Math.random() < 0.3) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: "POLL_CREATED",
              message: `New poll: ${poll.question}`,
              read: Math.random() < 0.5,
              pollId: poll.id,
              matchId: match.id,
            },
          });
        }
      }
    }
  }
  console.log(`Created polls for upcoming matches`);

  // Create polls for live matches
  for (const match of createdLiveMatches) {
    // Create 2-3 polls for each match
    const numPolls = Math.floor(Math.random() * 2) + 2;
    const usedPollTypes = new Set();

    for (let i = 0; i < numPolls; i++) {
      // Select a random poll type that hasn't been used for this match
      let pollType;
      do {
        pollType = pollTypes[Math.floor(Math.random() * pollTypes.length)];
      } while (usedPollTypes.has(pollType));
      usedPollTypes.add(pollType);

      // Create poll
      const pollEndTime = new Date(match.date.getTime() - 30 * 60 * 1000); // 30 minutes before match

      const pollData = {
        matchId: match.id,
        type: pollType,
        question: pollQuestions[pollType](
          match.homeTeam.name,
          match.awayTeam.name
        ),
        status: "CLOSED", // Polls for live matches are closed
        startTime: new Date(match.date.getTime() - 24 * 60 * 60 * 1000), // 1 day before match
        endTime: pollEndTime,
      };

      // Create options based on poll type
      let options = [];

      switch (pollType) {
        case "WINNER":
          options = [
            { text: match.homeTeam.name },
            { text: match.awayTeam.name },
          ];
          break;
        case "MOTM":
          options = [
            { text: `Player from ${match.homeTeam.name}` },
            { text: `Player from ${match.awayTeam.name}` },
          ];
          break;
        case "SCORE":
          options = [
            { text: "Under 300 runs" },
            { text: "300-350 runs" },
            { text: "351-400 runs" },
            { text: "Above 400 runs" },
          ];
          break;
        case "WICKETS":
          options = [
            { text: "0-5 wickets" },
            { text: "6-10 wickets" },
            { text: "11-15 wickets" },
            { text: "16-20 wickets" },
          ];
          break;
        case "CUSTOM":
          options = [
            { text: match.homeTeam.name },
            { text: match.awayTeam.name },
            { text: "Equal number of boundaries" },
          ];
          break;
      }

      // Create poll with options
      const poll = await prisma.poll.create({
        data: {
          ...pollData,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          pollEndTime: pollEndTime,
          pollType: pollType,
          options: {
            create: options,
          },
          date: match.date,
          venue: match.venue,
          // homeTeamScore: match.homeTeamScore,
          // awayTeamScore: match.awayTeamScore,
          result: match.result,
          // status: match.status,
        },
        include: {
          options: true,
        },
      });

      // Create votes for this poll (50-90% of users vote)
      const votingUsers = users.filter(() => Math.random() < 0.7);

      for (const user of votingUsers) {
        // Select a random option
        const randomOption =
          poll.options[Math.floor(Math.random() * poll.options.length)];

        // Create vote
        await prisma.vote.create({
          data: {
            userId: user.id,
            pollId: poll.id,
            optionId: randomOption.id,
            points: 0, // No points yet since match hasn't been settled
          },
        });
      }

      // Create notifications for this poll
      for (const user of users) {
        if (Math.random() < 0.3) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: "POLL_CLOSED",
              message: `Poll closed: ${poll.question}`,
              read: Math.random() < 0.5,
              pollId: poll.id,
              matchId: match.id,
            },
          });
        }
      }
    }
  }
  console.log(`Created polls for live matches`);

  // Create polls for completed matches
  for (const match of createdCompletedMatches) {
    // Create 2-3 polls for each match
    const numPolls = Math.floor(Math.random() * 2) + 2;
    const usedPollTypes = new Set();

    for (let i = 0; i < numPolls; i++) {
      // Select a random poll type that hasn't been used for this match
      let pollType;
      do {
        pollType = pollTypes[Math.floor(Math.random() * pollTypes.length)];
      } while (usedPollTypes.has(pollType));
      usedPollTypes.add(pollType);

      // Create poll
      const pollEndTime = new Date(match.date.getTime() - 30 * 60 * 1000); // 30 minutes before match

      const pollData = {
        matchId: match.id,
        type: pollType,
        question: pollQuestions[pollType](
          match.homeTeam.name,
          match.awayTeam.name
        ),
        status: "SETTLED", // Polls for completed matches are settled
        startTime: new Date(match.date.getTime() - 24 * 60 * 60 * 1000), // 1 day before match
        endTime: pollEndTime,
      };

      // Create options based on poll type
      let options = [];

      // Determine correct option based on match result
      const homeTeamWon =
        (match.homeTeamScore || 0) > (match.awayTeamScore || 0);
      const totalScore =
        (match.homeTeamScore || 0) + (match.awayTeamScore || 0);

      switch (pollType) {
        case "WINNER":
          options = [
            { text: match.homeTeam.name, isCorrect: homeTeamWon },
            { text: match.awayTeam.name, isCorrect: !homeTeamWon },
          ];
          break;
        case "MOTM":
          // Randomly select a team for MOTM
          const motmFromHomeTeam =
            Math.random() < 0.6 ? homeTeamWon : !homeTeamWon;
          options = [
            {
              text: `Player from ${match.homeTeam.name}`,
              isCorrect: motmFromHomeTeam,
            },
            {
              text: `Player from ${match.awayTeam.name}`,
              isCorrect: !motmFromHomeTeam,
            },
          ];
          break;
        case "SCORE":
          let correctScoreOption;
          if (totalScore < 300) correctScoreOption = "Under 300 runs";
          else if (totalScore <= 350) correctScoreOption = "300-350 runs";
          else if (totalScore <= 400) correctScoreOption = "351-400 runs";
          else correctScoreOption = "Above 400 runs";

          options = [
            {
              text: "Under 300 runs",
              isCorrect: correctScoreOption === "Under 300 runs",
            },
            {
              text: "300-350 runs",
              isCorrect: correctScoreOption === "300-350 runs",
            },
            {
              text: "351-400 runs",
              isCorrect: correctScoreOption === "351-400 runs",
            },
            {
              text: "Above 400 runs",
              isCorrect: correctScoreOption === "Above 400 runs",
            },
          ];
          break;
        case "WICKETS":
          // Randomly determine number of wickets
          const totalWickets = Math.floor(Math.random() * 20);
          let correctWicketsOption;

          if (totalWickets <= 5) correctWicketsOption = "0-5 wickets";
          else if (totalWickets <= 10) correctWicketsOption = "6-10 wickets";
          else if (totalWickets <= 15) correctWicketsOption = "11-15 wickets";
          else correctWicketsOption = "16-20 wickets";

          options = [
            {
              text: "0-5 wickets",
              isCorrect: correctWicketsOption === "0-5 wickets",
            },
            {
              text: "6-10 wickets",
              isCorrect: correctWicketsOption === "6-10 wickets",
            },
            {
              text: "11-15 wickets",
              isCorrect: correctWicketsOption === "11-15 wickets",
            },
            {
              text: "16-20 wickets",
              isCorrect: correctWicketsOption === "16-20 wickets",
            },
          ];
          break;
        case "CUSTOM":
          // Randomly determine which team scored more boundaries
          const randomValue = Math.random();
          let correctBoundariesOption;

          if (randomValue < 0.4) correctBoundariesOption = match.homeTeam.name;
          else if (randomValue < 0.8)
            correctBoundariesOption = match.awayTeam.name;
          else correctBoundariesOption = "Equal number of boundaries";

          options = [
            {
              text: match.homeTeam.name,
              isCorrect: correctBoundariesOption === match.homeTeam.name,
            },
            {
              text: match.awayTeam.name,
              isCorrect: correctBoundariesOption === match.awayTeam.name,
            },
            {
              text: "Equal number of boundaries",
              isCorrect:
                correctBoundariesOption === "Equal number of boundaries",
            },
          ];
          break;
      }

      // Create poll with options
      const poll = await prisma.poll.create({
        data: {
          ...pollData,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          pollEndTime: pollEndTime,
          pollType: pollType,
          options: {
            create: options,
          },
          date: match.date,
          venue: match.venue,
          // homeTeamScore: match.homeTeamScore,
          // awayTeamScore: match.awayTeamScore,
          result: match.result,
          // status: match.status,
        },
        include: {
          options: true,
        },
      });

      // Create votes for this poll (70-100% of users vote)
      const votingUsers = users.filter(() => Math.random() < 0.85);

      for (const user of votingUsers) {
        // Select a random option
        const randomOption =
          poll.options[Math.floor(Math.random() * poll.options.length)];

        // Determine points (30-100 if correct, 0 if incorrect)
        const points = randomOption.isCorrect
          ? Math.floor(Math.random() * 70) + 30
          : 0;

        // Create vote
        await prisma.vote.create({
          data: {
            userId: user.id,
            pollId: poll.id,
            optionId: randomOption.id,
            points: points,
          },
        });

        // Create notification for points earned
        if (randomOption.isCorrect && Math.random() < 0.5) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: "POINTS_AWARDED",
              message: `You earned ${points} points for your correct prediction in "${poll.question}"`,
              read: Math.random() < 0.5,
              pollId: poll.id,
              matchId: match.id,
            },
          });
        }
      }

      // Create notifications for this poll
      for (const user of users) {
        if (Math.random() < 0.2) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: "POLL_SETTLED",
              message: `Results are in for: ${poll.question}`,
              read: Math.random() < 0.5,
              pollId: poll.id,
              matchId: match.id,
            },
          });
        }
      }
    }
  }
  console.log(`Created polls for completed matches`);

  // Update user points based on votes
  for (const user of users) {
    const userVotes = await prisma.vote.findMany({
      where: { userId: user.id },
    });

    const totalPoints = userVotes.reduce((sum, vote) => sum + vote.points, 0);

    await prisma.user.update({
      where: { id: user.id },
      data: { points: totalPoints },
    });
  }
  console.log(`Updated user points based on votes`);

  // Update user ranks based on points
  const rankedUsers = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { points: "desc" },
  });

  for (let i = 0; i < rankedUsers.length; i++) {
    await prisma.user.update({
      where: { id: rankedUsers[i].id },
      data: { rank: i + 1 },
    });
  }
  console.log(`Updated user ranks based on points`);

  // Create system notifications
  const systemNotifications = [
    "Welcome to IPL Prediction Portal! Start predicting and earning points.",
    "IPL season is here! Make your predictions and climb the leaderboard.",
    "New feature alert: You can now view detailed match statistics.",
    "Don't forget to check the leaderboard to see your ranking.",
    "Tip: The more accurate your predictions, the more points you earn!",
  ];

  for (const user of users) {
    // Create 1-3 system notifications for each user
    const numNotifications = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numNotifications; i++) {
      const message =
        systemNotifications[
          Math.floor(Math.random() * systemNotifications.length)
        ];
      const createdAt = new Date(today);
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "SYSTEM",
          message: message,
          read: Math.random() < 0.5,
          createdAt: createdAt,
        },
      });
    }
  }
  console.log(`Created system notifications for users`);

  console.log("Database seeding completed!");
}

// Helper function to get a random pair of unique indices
function getRandomPair(min, max) {
  const first = Math.floor(Math.random() * (max - min + 1)) + min;
  let second;
  do {
    second = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (second === first);

  return [first, second];
}

// Helper function to generate random comments
function getRandomComment(team1, team2) {
  const comments = [
    `Great match between ${team1} and ${team2}!`,
    `${team1} played really well today.`,
    `${team2} needs to improve their bowling.`,
    `What an exciting finish to the game!`,
    `The pitch favored batsmen today.`,
    `That was a spectacular catch by the fielder!`,
    `The captain's decision to bowl first paid off.`,
    `${team1} vs ${team2} is always a thrilling contest.`,
    `The umpiring was questionable in this match.`,
    `That six in the last over was massive!`,
    `${team1}'s batting lineup looks strong this season.`,
    `${team2}'s bowlers need to be more consistent.`,
    `This match had everything - drama, skill, and excitement!`,
    `The strategic timeout changed the momentum of the game.`,
    `Both teams fought hard till the end.`,
    `The crowd at the stadium was amazing today!`,
    `That was a masterclass in T20 batting.`,
    `The fielding standards have really improved this season.`,
    `Can't wait for the next match between these two teams!`,
    `This IPL season is getting more exciting with each match.`,
  ];

  return comments[Math.floor(Math.random() * comments.length)];
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
