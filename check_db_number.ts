
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking database for old number...')
    const oldNumberShort = '0895421753555'
    const oldNumberIntl = '62895421753555'

    const contacts = await prisma.contact.findMany({
        where: {
            OR: [
                { wa_id: { contains: '895421753555' } },
                { wa_id: { contains: '53555' } } // Broader search
            ]
        }
    })

    console.log(`Found ${contacts.length} contacts matching the old number pattern:`)
    contacts.forEach(c => {
        console.log(`- ID: ${c.id}, WA_ID: ${c.wa_id}, Name: ${c.name}, PushName: ${c.push_name}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
