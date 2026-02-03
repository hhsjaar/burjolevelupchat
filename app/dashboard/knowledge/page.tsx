
import React from 'react'
import { getKnowledgeList, deleteKnowledge } from './actions'
import { KnowledgeForm } from '@/components/dashboard/knowledge-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Edit } from 'lucide-react'

export default async function KnowledgePage() {
    const knowledgeList = await getKnowledgeList()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
                <KnowledgeForm />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {knowledgeList.map((item) => (
                    <Card key={item.id} className="relative group">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline">{item.type?.toUpperCase()}</Badge>
                                <div className="space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <KnowledgeForm
                                        initialData={item as any}
                                        trigger={<Button variant="ghost" size="icon" className="h-6 w-6"><Edit className="h-3 w-3" /></Button>}
                                    />
                                    <form action={deleteKnowledge.bind(null, item.id)} className="inline-block">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                                    </form>
                                </div>
                            </div>
                            <CardTitle className="text-lg leading-tight mt-2">{item.question}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {item.answer}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-1">
                                {item.tags.map(tag => (
                                    <span key={tag} className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{tag}</span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
