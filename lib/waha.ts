const WAHA_URL = process.env.WAHA_URL || 'http://localhost:3000'
const SESSION_ID = process.env.WAHA_SESSION_ID || 'default'
const WAHA_API_KEY = process.env.WAHA_API_KEY

export async function sendWhatsAppMessage(to: string, text: string) {
    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (WAHA_API_KEY) headers['X-Api-Key'] = WAHA_API_KEY

        // Ensure proper URL formatting (remove trailing slash)
        const baseUrl = WAHA_URL.replace(/\/$/, '')

        // Smart chatId handling: Only append @c.us if no suffix exists
        const chatId = to.includes('@') ? to : `${to}@c.us`

        const body = {
            session: SESSION_ID,
            chatId,
            text,
        }
        console.log('[WAHA] Request:', `${baseUrl}/api/sendText`, JSON.stringify(body))

        const res = await fetch(`${baseUrl}/api/sendText`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        })

        const responseText = await res.text()
        console.log('[WAHA] Response Status:', res.status)
        console.log('[WAHA] Response Body:', responseText)

        if (!res.ok) {
            throw new Error(`WAHA Server Error: ${res.status} ${responseText}`)
        }

        return JSON.parse(responseText)
    } catch (err) {
        console.error('[WAHA] Error sending message:', err)
        return null
    }
}

export async function sendWhatsAppImage(to: string, imageUrl: string, caption: string) {
    try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (WAHA_API_KEY) headers['X-Api-Key'] = WAHA_API_KEY

        const baseUrl = WAHA_URL.replace(/\/$/, '')
        const chatId = to.includes('@') ? to : `${to}@c.us`

        const res = await fetch(`${baseUrl}/api/sendImage`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                session: SESSION_ID,
                chatId,
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
