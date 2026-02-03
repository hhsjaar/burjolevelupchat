import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppMessage } from '@/lib/waha'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY || '',
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        // console.log('WA Webhook Payload:', JSON.stringify(body, null, 2))

        const { event, payload } = body

        if (event === 'message') {
            const { from, body: messageBody, id, pushName, _data } = payload
            if (payload.fromMe) return NextResponse.json({ success: true, ignored: true })

            // 1. Upsert Contact
            const contact = await prisma.contact.upsert({
                where: { wa_id: from },
                create: {
                    wa_id: from,
                    push_name: pushName || _data?.notifyName || from,
                    name: pushName || _data?.notifyName || from,
                },
                update: {
                    push_name: pushName || _data?.notifyName,
                }
            })

            // 2. Get or Create Conversation
            let conversation = await prisma.conversation.findFirst({
                where: { contact_id: contact.id }
            })

            if (!conversation) {
                conversation = await prisma.conversation.create({
                    data: {
                        contact_id: contact.id,
                        last_message_at: new Date(),
                        unread_count: 1,
                        status: 'active',
                        ai_mode: true
                    }
                })
            } else {
                conversation = await prisma.conversation.update({
                    where: { id: conversation.id },
                    data: {
                        last_message_at: new Date(),
                        unread_count: { increment: 1 }
                    }
                })
            }

            // 3. Save User Message
            await prisma.message.create({
                data: {
                    conversation_id: conversation.id,
                    sender: 'user',
                    content: messageBody,
                    wa_message_id: id,
                    status: 'delivered'
                }
            })

            // 4. AI Logic
            if (conversation.ai_mode && messageBody) {
                const { getSystemPrompt } = await import('@/lib/ai-prompt')
                const systemPrompt = await getSystemPrompt()

                // Generate response
                const { text } = await generateText({
                    model: groq('llama-3.3-70b-versatile'),
                    system: systemPrompt,
                    prompt: messageBody
                })

                if (text) {
                    // Send to WhatsApp
                    await sendWhatsAppMessage(from, text)

                    // Save AI Message
                    await prisma.message.create({
                        data: {
                            conversation_id: conversation.id,
                            sender: 'ai',
                            content: text,
                            status: 'sent'
                        }
                    })
                }
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
}
