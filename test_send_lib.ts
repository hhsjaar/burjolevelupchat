
import { sendWhatsAppMessage } from './lib/waha'

async function main() {
    console.log('Testing sendWhatsAppMessage...')
    // Use the contact ID we saw earlier in the database check that looked like a real number
    const target = '62895421753555'
    const result = await sendWhatsAppMessage(target, 'DEBUG: Local script test message')
    console.log('Result:', result)
}

main()
