'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSpaces() {
    return await prisma.space.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function createSpace(data: { name: string; capacity: number; description: string; is_reservable: boolean }) {
    await prisma.space.create({
        data
    })
    revalidatePath('/dashboard/spaces')
}

export async function updateSpace(id: string, data: { name: string; capacity: number; description: string; is_reservable: boolean }) {
    await prisma.space.update({
        where: { id },
        data
    })
    revalidatePath('/dashboard/spaces')
}

export async function deleteSpace(id: string) {
    try {
        await prisma.space.delete({
            where: { id }
        })
        revalidatePath('/dashboard/spaces')
    } catch (error) {
        console.error('Failed to delete space (might have reservations?)', error)
        throw new Error('Cannot delete space with active reservations.')
    }
}
