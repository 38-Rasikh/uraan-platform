import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '/directory', label: 'Directory' },
  { href: '/projects', label: 'Projects' },
  { href: '/team', label: 'Team' },
  { href: '/connect', label: 'Connect' },
  { href: '/verify', label: 'Verify' },
]

export function Navbar() {
  return (
    <header className="bg-[--color-surface]/95 supports-[backdrop-filter]:bg-[--color-surface]/80 sticky top-0 z-50 w-full border-b border-[--color-border] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-container items-center justify-between px-6">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[--color-text-primary] transition-opacity hover:opacity-80"
        >
          <span className="text-lg font-semibold tracking-tight">Uraan</span>
          <span className="hidden text-xs text-[--color-text-muted] sm:block">
            Rahbar · UET Lahore
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[--color-text-secondary] transition-colors hover:text-[--color-text-primary]"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/directory">
            <Button
              size="sm"
              className="hover:bg-[--color-accent]/90 bg-[--color-accent] text-white"
            >
              Explore Directory
            </Button>
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <Sheet>
          <SheetTrigger
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="mt-8 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-[--color-text-secondary] hover:text-[--color-text-primary]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
