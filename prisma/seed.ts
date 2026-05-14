import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create an initial admin user
  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'password123', // In a real app, this should be hashed!
    },
  })

  // Create a default category
  const category = await prisma.category.create({
    data: {
      name: '特色餐饮',
      sortOrder: 1
    }
  })

  console.log({ admin, category })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
