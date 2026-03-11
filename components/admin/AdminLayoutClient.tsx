'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AdminSidebar } from '@/components/admin/Sidebar'
import { AdminHeader } from '@/components/admin/Header'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Fullscreen } from 'lucide-react'
import { maxSize } from 'zod'
import { maximum } from 'zod/mini'

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
        <main className="relative flex-1 overflow-y-auto bg-zinc-900 p-4 text-zinc-100 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
