import { createOpenAI } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { checkAvailability, createReservationEvent } from '@/lib/google-calendar'

// Setup Groq Provider
const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY || '',
})

export const maxDuration = 30

export async function POST(req: Request) {
    const { messages } = await req.json()

    const { getSystemPrompt } = await import('@/lib/ai-prompt')
    const systemPrompt = await getSystemPrompt()

    const result = streamText({
        model: groq('llama-3.3-70b-versatile'),
        system: systemPrompt,
        messages,
        tools: {
            checkAvailability: tool({
                description: 'Check if a time slot is available for reservation considering party size',
                parameters: z.object({
                    startTime: z.string().describe('ISO 8601 start time'),
                    endTime: z.string().describe('ISO 8601 end time'),
                    partySize: z.number().describe('Number of people'),
                }),
                execute: async ({ startTime, endTime, partySize }: { startTime: string; endTime: string; partySize: number }): Promise<any> => {
                    console.log(`[DEBUG] checkAvailability called: start=${startTime}, end=${endTime}, pax=${partySize}`)
                    const start = new Date(startTime)
                    const end = new Date(endTime)
                    const { prisma } = await import('@/lib/prisma')

                    // 1. Find suitable spaces
                    const suitableSpaces = await prisma.space.findMany({
                        where: {
                            capacity: { gte: partySize },
                            is_reservable: true
                        }
                    })
                    console.log(`[DEBUG] Suitable spaces found: ${suitableSpaces.length}`)

                    if (suitableSpaces.length === 0) return { available: false, reason: "No table large enough." }

                    // 2. Check collisions for these spaces
                    const collisions = await prisma.reservation.findMany({
                        where: {
                            space_id: { in: suitableSpaces.map(s => s.id) },
                            OR: [
                                { start_time: { lt: end }, end_time: { gt: start } }
                            ]
                        }
                    })

                    const availableSpaces = suitableSpaces.filter(space =>
                        !collisions.some(r => r.space_id === space.id)
                    )

                    if (availableSpaces.length > 0) {
                        return { available: true, spaces: availableSpaces.map(s => s.name) }
                    }

                    return { available: false, reason: "All suitable tables are booked." }
                },
            } as any),
            createReservation: tool({
                description: 'Create a new reservation for a specific space',
                parameters: z.object({
                    customerName: z.string(),
                    customerPhone: z.string(),
                    startTime: z.string(),
                    partySize: z.number(),
                }),
                execute: async ({ customerName, customerPhone, startTime, partySize }: { customerName: string; customerPhone: string; startTime: string; partySize: number }): Promise<any> => {
                    console.log(`[DEBUG] createReservation called: name=${customerName}, time=${startTime}, pax=${partySize}`)
                    const start = new Date(startTime)
                    const end = new Date(start.getTime() + 60 * 60 * 1000)
                    const { prisma } = await import('@/lib/prisma')
                    const { createReservationEvent } = await import('@/lib/google-calendar')

                    // Re-check availability logic inside execution to be safe (simplified here to just picking first available)
                    const suitableSpaces = await prisma.space.findMany({
                        where: { capacity: { gte: partySize }, is_reservable: true }
                    })
                    console.log(`[DEBUG] Suitable spaces for booking: ${suitableSpaces.length}`)

                    // Simple collision check
                    const collisions = await prisma.reservation.findMany({
                        where: {
                            space_id: { in: suitableSpaces.map(s => s.id) },
                            OR: [{ start_time: { lt: end }, end_time: { gt: start } }]
                        }
                    })

                    const space = suitableSpaces.find(s => !collisions.some(r => r.space_id === s.id))

                    if (!space) return { success: false, error: "No space available anymore." }

                    // Create DB Reservation
                    const res = await prisma.reservation.create({
                        data: {
                            start_time: start,
                            end_time: end,
                            space_id: space.id,
                            status: 'confirmed',
                            details: { customerName, customerPhone, partySize } as any
                        }
                    })

                    // Create Google Calendar Event
                    const summary = `RESERVATION: ${customerName} (${partySize} pax) - ${space.name}`
                    const description = `Phone: ${customerPhone}\nSpace: ${space.name}`
                    await createReservationEvent(summary, description, start.toISOString(), end.toISOString())

                    return { success: true, reservationId: res.id, spaceName: space.name }
                },
            } as any),
        },
    })

    return (result as any).toDataStreamResponse()
}
