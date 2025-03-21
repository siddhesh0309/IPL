import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@iplprediction.com" },
    update: {},
    create: {
      email: "admin@iplprediction.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      points: 0,
    },  
  });

  // Create regular user
  const userPassword = await hash("user123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Test User",
      password: userPassword,
      role: "USER",
      points: 100,
    },
  });

  // Create IPL teams
  const teams = [
    { name: "Mumbai Indians", shortName: "MI", logo: "/teams/mi.png", primaryColor: "#004BA0" },
    { name: "Chennai Super Kings", shortName: "CSK", logo: "/teams/csk.png", primaryColor: "#FFFF00" },
    { name: "Royal Challengers Bangalore", shortName: "RCB", logo: "/teams/rcb.png", primaryColor: "#EC1C24" },
    { name: "Kolkata Knight Riders", shortName: "KKR", logo: "/teams/kkr.png", primaryColor: "#3A225D" },
    { name: "Delhi Capitals", shortName: "DC", logo: "/teams/dc.png", primaryColor: "#0078BC" },
    { name: "Punjab Kings", shortName: "PBKS", logo: "/teams/pbks.png", primaryColor: "#ED1B24" },
    { name: "Rajasthan Royals", shortName: "RR", logo: "/teams/rr.png", primaryColor: "#254AA5" },
    { name: "Sunrisers Hyderabad", shortName: "SRH", logo: "/teams/srh.png", primaryColor: "#FF822A" },
    { name: "Gujarat Titans", shortName: "GT", logo: "/teams/gt.png", primaryColor: "#1C1C1C" },
    { name: "Lucknow Super Giants", shortName: "LSG", logo: "/teams/lsg.png", primaryColor: "#A72056" },
  ];

  for (const team of teams) {
    await prisma.team.upsert({
      where: { name: team.name },
      update: team,
      create: team,
    });
  }

  console.log(`Created ${teams.length} IPL teams`);

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
