
import React from 'react'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Users, Calendar, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function getMetrics() {
    const [totalContacts, activeChats, todayReservationsRaw] = await Promise.all([
        prisma.contact.count(),
        prisma.conversation.count({ where: { status: 'active' } }),
        prisma.reservation.findMany({
            where: {
                start_time: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lt: new Date(new Date().setHours(23, 59, 59, 999))
                }
            },
            include: { contact: true }
        })
    ])

    return { totalContacts, activeChats, todayReservations: todayReservationsRaw }
}

export default async function DashboardPage() {
    const { totalContacts, activeChats, todayReservations } = await getMetrics()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <Button>Download Report</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Conversations
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeChats}</div>
                        <p className="text-xs text-muted-foreground">
                            +2 since last hour
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Contacts
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalContacts}</div>
                        <p className="text-xs text-muted-foreground">
                            +180 from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Reservations</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayReservations.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Coming up in next 24h
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            AI Engagement
                        </CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98%</div>
                        <p className="text-xs text-muted-foreground">
                            Response rate
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {/* Placeholder for chart or list */}
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            Activity Chart (Coming Soon)
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Upcoming Reservations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {todayReservations.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No reservations for today.</p>
                            ) : (
                                todayReservations.map((res) => (
                                    <div key={res.id} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{res.contact?.push_name || 'Guest'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(res.start_time).toLocaleTimeString()} - {new Date(res.end_time).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            {(res.details as any)?.partySize || '?'} pax
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
