'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, ClipboardList, FolderOpen, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orphanages', label: 'Orphanages', icon: Building2 },
  { href: '/admin/visits', label: 'Visit Logger', icon: ClipboardList },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { href: '/admin/team', label: 'Team', icon: Users },
]

interface SidebarProps {
  onClose?: () => void
}

export function AdminSidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-col bg-[--color-admin-bg]">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <Image
            src="/uraan-logo-white.png"
            alt="Uraan logo"
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
          />
          <span className="text-sm font-semibold text-white">Uraan</span>
          <span className="text-xs text-zinc-500">Admin</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-zinc-500 hover:text-white lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer accent bar */}
      <div className="h-1 w-full bg-[--color-accent]" />
    </aside>
  )
}
