
import React from 'react'
import { getSpaces, deleteSpace } from './actions'
import { SpaceForm } from '@/components/dashboard/space-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Edit, Users } from 'lucide-react'

export default async function SpacesPage() {
    const spaces = await getSpaces()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Spaces & Tables</h2>
                <SpaceForm />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {spaces.map((space) => (
                    <Card key={space.id} className="relative group">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant={space.is_reservable ? 'outline' : 'destructive'}>
                                    {space.is_reservable ? 'Bookable' : 'Internal'}
                                </Badge>
                                <div className="space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <SpaceForm
                                        initialData={space as any}
                                        trigger={<Button variant="ghost" size="icon" className="h-6 w-6"><Edit className="h-3 w-3" /></Button>}
                                    />
                                    <form action={deleteSpace.bind(null, space.id)} className="inline-block">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                                    </form>
                                </div>
                            </div>
                            <CardTitle className="text-lg leading-tight mt-2 flex items-center gap-2">
                                {space.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-2xl font-bold">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                {space.capacity}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                {space.description || 'No description'}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
