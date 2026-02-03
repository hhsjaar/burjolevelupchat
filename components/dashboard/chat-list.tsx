'use client'

import React from 'react'
import { Conversation } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface ChatListProps {
    conversations: Conversation[]
    selectedId?: string
    onSelect: (id: string) => void
}

export function ChatList({ conversations, selectedId, onSelect }: ChatListProps) {
    return (
        <div className="w-80 border-r flex flex-col bg-muted/10 h-full">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold tracking-tight">Messages</h2>
                <div className="mt-2 relative">
                    <input
                        className="w-full bg-secondary text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Search..."
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-1 p-2">
                    {conversations.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => onSelect(chat.id)}
                            className={cn(
                                "flex items-start gap-3 p-3 rounded-xl text-left transition-colors",
                                selectedId === chat.id
                                    ? "bg-secondary/80 shadow-sm"
                                    : "hover:bg-secondary/40"
                            )}
                        >
                            <Avatar>
                                <AvatarImage src={chat.contact?.profile_pic_url || ''} />
                                <AvatarFallback>{chat.contact?.push_name?.slice(0, 2).toUpperCase() || 'CX'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="font-semibold text-sm truncate">
                                        {chat.contact?.push_name || chat.contact?.wa_id}
                                    </span>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: false, locale: id })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                                        {/* In real app, pass last message snippet here */}
                                        {chat.status === 'active' ? 'Active conversation...' : 'Resolved'}
                                    </p>
                                    {chat.unread_count > 0 && (
                                        <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                            {chat.unread_count}
                                        </Badge>
                                    )}
                                </div>
                                {chat.ai_mode && chat.status !== 'resolved' && (
                                    <div className="mt-1 flex gap-1">
                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-primary/20 text-primary/60">AI On</Badge>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
