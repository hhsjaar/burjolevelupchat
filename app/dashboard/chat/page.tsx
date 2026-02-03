'use client'

import React, { useState, useEffect } from 'react'
import { ChatList } from '@/components/dashboard/chat-list'
import { ChatWindow } from '@/components/dashboard/chat-window'
import { getConversations, getMessages, sendMessage } from './actions'
import { Conversation, Message } from '@/types'

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [selectedId, setSelectedId] = useState<string | undefined>()
    const [loading, setLoading] = useState(true)

    // Fetch conversations on mount
    useEffect(() => {
        async function loadConversations() {
            try {
                const data = await getConversations()
                setConversations(data)
                // Optionally select the first one if none selected
                if (data.length > 0 && !selectedId) {
                    setSelectedId(data[0].id)
                }
            } catch (error) {
                console.error('Failed to load conversations', error)
            } finally {
                setLoading(false)
            }
        }
        loadConversations()
    }, []) // Run once

    // Fetch messages when conversation selected
    useEffect(() => {
        if (!selectedId) {
            setMessages([])
            return
        }

        async function loadMessages() {
            try {
                const data = await getMessages(selectedId!)
                setMessages(data)
            } catch (error) {
                console.error('Failed to load messages', error)
            }
        }
        loadMessages()

        // Polling interval for new messages (simple implementation for real-time feel)
        const interval = setInterval(loadMessages, 3000)
        return () => clearInterval(interval)
    }, [selectedId])

    const handleSendMessage = async (content: string) => {
        if (!selectedId) return

        try {
            // Optimistic update
            const tempId = Math.random().toString()
            const optimisticMessage: Message = {
                id: tempId,
                conversation_id: selectedId,
                sender: 'admin',
                content,
                media_url: null,
                media_type: null,
                status: 'sent',
                created_at: new Date().toISOString()
            }
            setMessages(prev => [...prev, optimisticMessage])

            const newMessage = await sendMessage(selectedId, content)

            // Replace optimistic message
            setMessages(prev => prev.map(m => m.id === tempId ? newMessage : m))

            // Update conversation list order (move to top)
            setConversations(prev => {
                const updated = [...prev]
                const index = updated.findIndex(c => c.id === selectedId)
                if (index !== -1) {
                    const conv = updated[index]
                    updated.splice(index, 1)
                    updated.unshift({ ...conv, last_message_at: new Date().toISOString() })
                }
                return updated
            })

        } catch (error) {
            console.error('Failed to send message', error)
            // Revert on failure (could improve this)
        }
    }

    const selectedConversation = conversations.find(c => c.id === selectedId)

    if (loading && conversations.length === 0) {
        return <div className="flex items-center justify-center h-full text-muted-foreground">Loading conversations...</div>
    }

    return (
        <div className="flex h-full w-full overflow-hidden min-h-0">
            <ChatList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={setSelectedId}
            />
            <ChatWindow
                conversation={selectedConversation}
                messages={messages}
                onSendMessage={handleSendMessage}
                onBack={() => setSelectedId(undefined)}
            />
        </div>
    )
}

