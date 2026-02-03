import React from 'react'
import { NavSidebar } from '@/components/dashboard/nav-sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background flex">
            <NavSidebar />
            <main className="flex-1 md:ml-16 pb-16 md:pb-0 h-screen overflow-hidden">
                {children}
            </main>
        </div>
    )
}
