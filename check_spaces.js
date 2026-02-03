const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const count = await prisma.space.count()
    console.log('Total Spaces:', count)
    const spaces = await prisma.space.findMany()
    console.log('Spaces:', spaces)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
