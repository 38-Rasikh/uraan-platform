'use client'

import { useState } from 'react'
import { AdminSidebar } from '@/components/admin/Sidebar'
import { AdminHeader } from '@/components/admin/Header'
import { Sheet, SheetContent } from '@/components/ui/sheet'

interface AdminLayoutClientProps {
  children: React.ReactNode
  userEmail: string | undefined
}

export function AdminLayoutClient({ children, userEmail }: AdminLayoutClientProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="dark flex h-screen overflow-hidden bg-zinc-950">
      {/* Desktop sidebar — hidden below lg */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar — Sheet drawer */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-60 p-0" aria-label="Admin navigation">
          <AdminSidebar onClose={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader userEmail={userEmail} onMenuToggle={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-zinc-900 p-4 text-zinc-100 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
