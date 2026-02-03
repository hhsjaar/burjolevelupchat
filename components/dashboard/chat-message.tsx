'use client'

import React from 'react'
import { Message } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
    message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.sender === 'user'
    const isSystem = message.sender === 'system'

    if (isSystem) {
        return (
            <div className="flex justify-center my-4">
                <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        )
    }

    return (
        <div className={cn("flex w-full mb-4", isUser ? "justify-start" : "justify-end")}>
            <div className={cn("flex max-w-[70%] gap-2", isUser ? "flex-row" : "flex-row-reverse")}>
                {/* Avatar Icon */}
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    isUser ? "bg-muted" : "bg-primary"
                )}>
                    {isUser ? <User className="w-4 h-4 text-muted-foreground" /> : <Bot className="w-4 h-4 text-primary-foreground" />}
                </div>

                {/* Bubble */}
                <div className={cn(
                    "p-3 rounded-2xl text-sm shadow-sm relative group",
                    isUser
                        ? "bg-white border text-foreground rounded-tl-sm"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                )}>
                    <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                    </p>
                    <div className={cn(
                        "text-[10px] mt-1 opacity-50 flex items-center gap-1",
                        isUser ? "justify-start" : "justify-end"
                    )}>
                        <span>{format(new Date(message.created_at), 'HH:mm')}</span>
                        {!isUser && <span>• {message.status}</span>}
                    </div>
                </div>
            </div>
        </div>
    )
}
