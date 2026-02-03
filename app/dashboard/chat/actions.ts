'use server'

import { prisma } from '@/lib/prisma'
import { Conversation, Message } from '@/types'

export async function getConversations(): Promise<Conversation[]> {
    try {
        const data = await prisma.conversation.findMany({
            include: {
                contact: true
            },
            orderBy: {
                last_message_at: 'desc'
            }
        })

        return data.map(c => ({
            id: c.id,
            contact_id: c.contact_id,
            status: c.status as 'active' | 'resolved' | 'blocked',
            last_message_at: c.last_message_at?.toISOString() || new Date().toISOString(),
            unread_count: c.unread_count || 0,
            ai_mode: c.ai_mode || false,
            pinned: c.pinned || false,
            tags: c.tags,
            contact: c.contact ? {
                id: c.contact.id,
                wa_id: c.contact.wa_id,
                name: c.contact.name,
                push_name: c.contact.push_name,
                profile_pic_url: c.contact.profile_pic_url,
                created_at: c.contact.created_at?.toISOString() || '',
            } : undefined
        }))
    } catch (error) {
        console.error('Error fetching conversations:', error)
        return []
    }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
    try {
        const data = await prisma.message.findMany({
            where: { conversation_id: conversationId },
            orderBy: { created_at: 'asc' }
        })

        return data.map(m => ({
            id: m.id,
            conversation_id: m.conversation_id,
            sender: m.sender as 'user' | 'ai' | 'admin' | 'system',
            content: m.content || '',
            media_url: m.media_url,
            media_type: m.media_type as 'image' | 'video' | 'document' | null,
            status: m.status as 'sent' | 'delivered' | 'read' | 'failed',
            created_at: m.created_at?.toISOString() || new Date().toISOString()
        }))
    } catch (error) {
        console.error('Error fetching messages:', error)
        return []
    }
}

export async function sendMessage(conversationId: string, content: string, sender: 'admin' | 'ai' = 'admin') {
    try {
        // 1. Create message in DB
        const message = await prisma.message.create({
            data: {
                conversation_id: conversationId,
                sender,
                content,
                status: 'sent',
                created_at: new Date()
            }
        })

        // 2. Update conversation last_message_at
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { last_message_at: new Date() }
        })

        // 3. Send via WAHA
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { contact: true }
        })

        if (conversation?.contact?.wa_id) {
            const { sendWhatsAppMessage } = await import('@/lib/waha')
            await sendWhatsAppMessage(conversation.contact.wa_id, content)
        }

        return {
            id: message.id,
            conversation_id: message.conversation_id,
            sender: message.sender as 'user' | 'ai' | 'admin' | 'system',
            content: message.content || '',
            media_url: message.media_url,
            media_type: message.media_type as 'image' | 'video' | 'document' | null,
            status: message.status as 'sent' | 'delivered' | 'read' | 'failed',
            created_at: message.created_at?.toISOString() || new Date().toISOString()
        }
    } catch (error) {
        console.error('Error sending message:', error)
        throw error
    }
}

export async function toggleAI(conversationId: string, enabled: boolean) {
    try {
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { ai_mode: enabled }
        })
        return { success: true }
    } catch (error) {
        console.error('Error toggling AI:', error)
        return { success: false }
    }
}
