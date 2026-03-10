'use client'

import { useRouter } from 'next/navigation'
import { LogOut, User, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdminHeaderProps {
  userEmail: string | undefined
  pageTitle?: string
  onMenuToggle?: () => void
}

export function AdminHeader({ userEmail, pageTitle, onMenuToggle }: AdminHeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/v1/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-[--color-admin-bg] px-4">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        {pageTitle && <h1 className="text-sm font-semibold text-white">{pageTitle}</h1>}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white">
          <User className="h-4 w-4" />
          <span className="hidden max-w-[160px] truncate sm:block">{userEmail ?? 'Admin'}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 border-zinc-700 bg-zinc-900 text-zinc-100">
          <DropdownMenuItem className="cursor-default text-xs text-zinc-400 focus:bg-zinc-800">
            {userEmail}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-700" />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer gap-2 text-sm focus:bg-zinc-800 focus:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
