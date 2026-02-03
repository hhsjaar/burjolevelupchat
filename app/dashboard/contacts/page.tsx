
import React from 'react'
import { prisma } from '@/lib/prisma'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'

async function getContacts() {
    return await prisma.contact.findMany({
        orderBy: { updated_at: 'desc' },
        include: {
            _count: {
                select: { conversations: true, reservations: true }
            }
        }
    })
}

export default async function ContactsPage() {
    const contacts = await getContacts()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contacts.map((contact) => (
                    <Card key={contact.id}>
                        <CardContent className="p-6 flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={contact.profile_pic_url || ''} />
                                <AvatarFallback>{contact.push_name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <p className="font-medium leading-none">{contact.push_name || contact.name || 'Unknown'}</p>
                                <p className="text-sm text-muted-foreground">{contact.wa_id.replace('@c.us', '')}</p>
                                <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                                    <span>{contact._count.conversations} Chats</span>
                                    <span>•</span>
                                    <span>{contact._count.reservations} Reservations</span>
                                </div>
                            </div>
                            <Link href="/dashboard/chat">
                                <Button variant="ghost" size="icon">
                                    <MessageSquare className="h-4 w-4" />
                                </Button>
                            </Link>

                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
