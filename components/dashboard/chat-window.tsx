'use client'

import React, { useState } from 'react'
import { Conversation, Message } from '@/types'
import { ChatMessage } from './chat-message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Phone, Video, Info, Paperclip, Send, Bot, UserCog, PowerOff, Sparkles } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ChatWindowProps {
    conversation?: Conversation
    messages: Message[]
    className?: string
    onSendMessage?: (content: string) => void
    onBack?: () => void
}

export function ChatWindow({ conversation, messages, className, onSendMessage, onBack }: ChatWindowProps) {
    const [inputText, setInputText] = useState('')
    const scrollRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-white/50">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground">BurjoLevelUp AI Host</h3>
                <p className="max-w-xs mt-2 text-sm">Select a conversation to start monitoring or chatting with your customers.</p>
            </div>
        )
    }

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputText.trim()) return
        if (onSendMessage) {
            onSendMessage(inputText)
        }
        setInputText('')
    }

    return (
        <div className={cn(
            "flex-1 flex-col h-full bg-white/50 backdrop-blur-xl relative overflow-hidden",
            conversation ? "flex" : "hidden md:flex" // Hide on mobile if no conversation
        )}>
            {/* Header */}
            <div className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    {/* Back Button (Mobile Only) */}
                    <div className="md:hidden mr-1">
                        <Button variant="ghost" size="icon" className="-ml-2 h-8 w-8" onClick={() => onBack?.()}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m15 18-6-6 6-6" /></svg>
                        </Button>
                    </div>

                    <Avatar className="h-9 w-9 border">
                        <AvatarImage src={conversation.contact?.profile_pic_url || ''} />
                        <AvatarFallback>{conversation.contact?.push_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-sm leading-none">{conversation.contact?.push_name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            {conversation.ai_mode ? (
                                <span className="flex items-center gap-1 text-primary">
                                    <Bot className="w-3 h-3" /> AI Active
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-orange-500">
                                    <UserCog className="w-3 h-3" /> Manual Mode
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Call</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                    <Video className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Video Call</TooltipContent>
                        </Tooltip>
                        <Separator orientation="vertical" className="h-6 mx-2" />
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 h-8 text-xs font-medium"
                            onClick={async () => {
                                const { toggleAI } = await import('@/app/dashboard/chat/actions')
                                await toggleAI(conversation.id, !conversation.ai_mode)
                            }}
                        >
                            {conversation.ai_mode ? (
                                <>
                                    <PowerOff className="w-3 h-3" /> Take Over
                                </>
                            ) : (
                                <>
                                    <Bot className="w-3 h-3" /> Enable AI
                                </>
                            )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 text-muted-foreground">
                            <Info className="w-4 h-4" />
                        </Button>
                    </TooltipProvider>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0 p-6">
                <div className="max-w-3xl mx-auto">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-white/80 backdrop-blur-md">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-end gap-2">
                    <Button type="button" variant="ghost" size="icon" className="rounded-full h-10 w-10 shrink-0 text-muted-foreground">
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    <div className="flex-1 bg-secondary/50 rounded-2xl border transition-all focus-within:bg-white focus-within:ring-1 focus-within:ring-primary/20">
                        <Input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type a message..."
                            className="border-none bg-transparent h-10 focus-visible:ring-0 px-4"
                        />
                    </div>
                    <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0 shadow-md">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
