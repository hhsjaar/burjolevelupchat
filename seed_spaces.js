const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Seeding default spaces...')

    const spaces = [
        { name: 'Table 1', capacity: 4, description: 'Near Window' },
        { name: 'Table 2', capacity: 4, description: 'Center' },
        { name: 'Table 3', capacity: 2, description: 'Corner' },
        { name: 'VIP Room', capacity: 10, description: 'Private Room with AC' }
    ]

    for (const s of spaces) {
        await prisma.space.create({ data: s })
    }

    console.log('Seeding complete.')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
