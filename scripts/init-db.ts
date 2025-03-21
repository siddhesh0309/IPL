import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Initializing database...")

  // Create admin user
  const adminPassword = await hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@iplprediction.com" },
    update: {},
    create: {
      email: "admin@iplprediction.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      points: 0,
    },
  })
  console.log("Created admin user:", admin.email)

  console.log("Database initialization completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

