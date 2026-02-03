'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { createKnowledge, updateKnowledge } from '@/app/dashboard/knowledge/actions'
import { Plus } from 'lucide-react'

interface KnowledgeFormProps {
    initialData?: {
        id?: string
        question: string
        answer: string
        type: string
        image_url?: string
        tags: string[]
    }
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function KnowledgeForm({ initialData, trigger, onSuccess }: KnowledgeFormProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        question: initialData?.question || '',
        answer: initialData?.answer || '',
        type: initialData?.type || 'faq',
        image_url: initialData?.image_url || '',
        tags: initialData?.tags?.join(', ') || ''
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            }

            if (initialData?.id) {
                await updateKnowledge(initialData.id, payload)
            } else {
                await createKnowledge(payload)
            }

            setOpen(false)
            onSuccess?.()
            if (!initialData) setFormData({ question: '', answer: '', type: 'faq', image_url: '', tags: '' })
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button><Plus className="mr-2 h-4 w-4" /> Add New</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Knowledge' : 'Add Knowledge'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="faq">FAQ</SelectItem>
                                <SelectItem value="sop">SOP</SelectItem>
                                <SelectItem value="promo">Promo</SelectItem>
                                <SelectItem value="flow">Flow</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Question / Key</Label>
                        <Input
                            value={formData.question}
                            onChange={e => setFormData({ ...formData, question: e.target.value })}
                            placeholder="e.g. Wifi Password"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Answer / Content</Label>
                        <Textarea
                            value={formData.answer}
                            onChange={e => setFormData({ ...formData, answer: e.target.value })}
                            placeholder="The content AI should use..."
                            required
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Image URL (Optional)</Label>
                        <Input
                            value={formData.image_url}
                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://example.com/menu.jpg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Tags (Comma separated)</Label>
                        <Input
                            value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="internet, facility"
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
