
import React from 'react'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

async function getReservations() {
    return await prisma.reservation.findMany({
        include: { contact: true },
        orderBy: { start_time: 'asc' }
    })
}

export default async function ReservationsPage() {
    const reservations = await getReservations()

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'default'
            case 'pending': return 'warning' // need custom variant or use secondary
            case 'cancelled': return 'destructive'
            default: return 'outline'
        }
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Reservations</h2>

            <div className="space-y-4">
                {reservations.map((res) => (
                    <Card key={res.id}>
                        <CardContent className="flex items-center p-6">
                            <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">{res.contact?.push_name || 'Apps Contact'}</h3>
                                    <Badge variant={getStatusColor(res.status || '') as any}>{res.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(res.start_time), 'PPP p')} - {format(new Date(res.end_time), 'p')}
                                </p>
                                <p className="text-sm">
                                    Party Size: {(res.details as any)?.partySize || 'N/A'} | Phone: {(res.details as any)?.customerPhone || res.contact?.wa_id}
                                </p>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                                Booked via AI
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {reservations.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">No reservations found.</div>
                )}
            </div>
        </div>
    )
}
