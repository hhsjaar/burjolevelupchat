'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getKnowledgeList() {
    return await prisma.knowledgeBase.findMany({
        orderBy: { updated_at: 'desc' }
    })
}

export async function createKnowledge(data: { question: string; answer: string; type: string; tags: string[]; image_url?: string }) {
    await prisma.knowledgeBase.create({
        data: {
            ...data,
            category: 'general'
        }
    })
    revalidatePath('/dashboard/knowledge')
}

export async function updateKnowledge(id: string, data: { question: string; answer: string; type: string; tags: string[]; image_url?: string }) {
    await prisma.knowledgeBase.update({
        where: { id },
        data
    })
    revalidatePath('/dashboard/knowledge')
}

export async function deleteKnowledge(id: string) {
    await prisma.knowledgeBase.delete({
        where: { id }
    })
    revalidatePath('/dashboard/knowledge')
}
