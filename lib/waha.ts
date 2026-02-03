const WAHA_URL = process.env.WAHA_URL || 'http://localhost:3000'
const SESSION_ID = process.env.WAHA_SESSION_ID || 'default'
const WAHA_API_KEY = process.env.WAHA_API_KEY

export async function sendWhatsAppMessage(to: string, text: string) {
    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (WAHA_API_KEY) headers['X-Api-Key'] = WAHA_API_KEY

        const body = {
            session: SESSION_ID,
            chatId: to.includes('@c.us') ? to : `${to}@c.us`,
            text: text,
        }
        console.log('[WAHA] Sending message:', JSON.stringify(body))

        const res = await fetch(`${WAHA_URL}/api/sendText`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        })

        const data = await res.json()
        console.log('[WAHA] Response:', JSON.stringify(data))
        return data
    } catch (err) {
        console.error('Error sending WA message:', err)
        return null
    }
}

export async function sendWhatsAppImage(to: string, imageUrl: string, caption: string) {
    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (WAHA_API_KEY) headers['X-Api-Key'] = WAHA_API_KEY

        const res = await fetch(`${WAHA_URL}/api/sendImage`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                session: SESSION_ID,
                chatId: to.includes('@c.us') ? to : `${to}@c.us`,
                file: {
                    url: imageUrl
                },
                caption: caption,
            }),
        })
        return res.json()
    } catch (err) {
        console.error('Error sending WA image:', err)
        return null
    }
}
