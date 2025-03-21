import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Resetting database...")

  // Delete all data in reverse order of dependencies
  await prisma.vote.deleteMany({})
  console.log("Deleted all votes")

  await prisma.notification.deleteMany({})
  console.log("Deleted all notifications")

  await prisma.option.deleteMany({})
  console.log("Deleted all poll options")

  await prisma.poll.deleteMany({})
  console.log("Deleted all polls")

  await prisma.match.deleteMany({})
  console.log("Deleted all matches")

  await prisma.team.deleteMany({})
  console.log("Deleted all teams")

  await prisma.user.deleteMany({})
  console.log("Deleted all users")

  console.log("Database reset completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

