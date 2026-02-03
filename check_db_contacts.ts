
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Fetching recent contacts from database...')

    const count = await prisma.contact.count()
    console.log(`Total Contacts: ${count}`)

    const contacts = await prisma.contact.findMany({
        take: 10,
        orderBy: { created_at: 'desc' }
    })

    if (contacts.length === 0) {
        console.log('No contacts found.')
    } else {
        console.log('Recent 10 Contacts:')
        contacts.forEach(c => {
            console.log(`- [${c.id}] Name: ${c.name || 'Unknown'}, PushName: ${c.push_name}, WA_ID: ${c.wa_id}`)
        })
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
