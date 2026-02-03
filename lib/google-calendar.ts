import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/calendar']

// Initialize JWT Client
const getAuthClient = () => {
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL

    if (!privateKey || !clientEmail) {
        console.warn('Google Credentials missing')
        return null
    }

    return new JWT({
        email: clientEmail,
        key: privateKey,
        scopes: SCOPES,
    })
}

export async function checkAvailability(startTime: string, endTime: string) {
    const auth = getAuthClient()
    if (!auth) return { available: true, message: 'Mock availability (No Creds)' }

    const calendar = google.calendar({ version: 'v3', auth })
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

    try {
        const response = await calendar.events.list({
            calendarId,
            timeMin: startTime,
            timeMax: endTime,
            singleEvents: true,
            orderBy: 'startTime',
        })

        const events = response.data.items || []
        if (events.length > 0) {
            return { available: false, events }
        }
        return { available: true }
    } catch (error) {
        console.error('Error fetching calendar:', error)
        return { available: false, error }
    }
}

export async function createReservationEvent(summary: string, description: string, startTime: string, endTime: string) {
    const auth = getAuthClient()
    if (!auth) return { success: false, message: 'Mock reservation (No Creds)' }

    const calendar = google.calendar({ version: 'v3', auth })
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

    try {
        const event = await calendar.events.insert({
            calendarId,
            requestBody: {
                summary,
                description,
                start: { dateTime: startTime },
                end: { dateTime: endTime },
            },
        })

        return { success: true, eventId: event.data.id, link: event.data.htmlLink }
    } catch (error) {
        console.error('Error creating event:', error)
        return { success: false, error }
    }
}
