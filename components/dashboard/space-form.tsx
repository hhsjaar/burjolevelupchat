'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { createSpace, updateSpace } from '@/app/dashboard/spaces/actions'
import { Plus } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface SpaceFormProps {
    initialData?: {
        id?: string
        name: string
        capacity: number
        description: string
        is_reservable: boolean
    }
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function SpaceForm({ initialData, trigger, onSuccess }: SpaceFormProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        capacity: initialData?.capacity || 4,
        description: initialData?.description || '',
        is_reservable: initialData?.is_reservable ?? true
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            if (initialData?.id) {
                await updateSpace(initialData.id, formData)
            } else {
                await createSpace(formData)
            }

            setOpen(false)
            onSuccess?.()
            if (!initialData) setFormData({ name: '', capacity: 4, description: '', is_reservable: true })
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button><Plus className="mr-2 h-4 w-4" /> Add Space</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Space' : 'Add Space'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Table 1, VIP Room"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Capacity (Pax)</Label>
                        <Input
                            type="number"
                            value={formData.capacity}
                            onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Near Window, Sofa, etc."
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="reservable"
                            checked={formData.is_reservable}
                            onCheckedChange={(c) => setFormData({ ...formData, is_reservable: !!c })}
                        />
                        <Label htmlFor="reservable">Reservable by AI?</Label>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
