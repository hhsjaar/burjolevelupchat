'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Users, Settings, BookOpen, LayoutDashboard, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: MessageSquare, label: 'Chats', href: '/dashboard/chat' },
    { icon: Calendar, label: 'Reservations', href: '/dashboard/reservations' },
    { icon: BookOpen, label: 'Knowledge', href: '/dashboard/knowledge' },
    { icon: Users, label: 'Contacts', href: '/dashboard/contacts' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export function NavSidebar() {
    const pathname = usePathname()

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-16 border-r bg-background flex-col items-center py-6">
                <div className="mb-8 p-2 bg-primary rounded-xl">
                    <div className="w-6 h-6 bg-primary-foreground rounded-full" />
                </div>

                <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                    <TooltipProvider delayDuration={0}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
                            return (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>
                                        <Link href={item.href}>
                                            <Button
                                                variant={isActive ? 'secondary' : 'ghost'}
                                                size="icon"
                                                className={cn(
                                                    'w-full aspect-square rounded-xl transition-all',
                                                    isActive ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary/50'
                                                )}
                                            >
                                                <item.icon className="w-5 h-5" />
                                                <span className="sr-only">{item.label}</span>
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="font-medium">
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            )
                        })}
                    </TooltipProvider>
                </nav>

                <div className="mt-auto px-2">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        BJ
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-background border-t flex items-center justify-around px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
                    return (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-full h-full">
                            <div className={cn(
                                "p-2 rounded-xl transition-all",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}>
                                <item.icon className="w-6 h-6" />
                            </div>
                        </Link>
                    )
                })}
            </nav>
        </>
    )
}
