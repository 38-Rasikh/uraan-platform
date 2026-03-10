import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import AccessibilityWidget from '@/components/public/AccessibilityWidget'

const navLinks = [
  { href: '/directory', label: 'Directory' },
  { href: '/projects', label: 'Projects' },
  { href: '/team', label: 'Team' },
  { href: '/about', label: 'About' },
  { href: '/connect', label: 'Connect' },
  { href: '/verify', label: 'Verify' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[--color-border] bg-[--color-surface]">
      <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 sm:px-6">
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
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[--color-text-muted] transition-colors hover:text-[--color-text-primary] focus-visible:underline focus-visible:outline-none"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: CTA + Accessibility + Mobile trigger */}
        <div className="flex items-center gap-3">
          {/* CTA — hidden on small screens */}
          <Link
            href="/directory"
            className="hidden rounded-md bg-[--color-accent] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[--color-accent] sm:block"
          >
            Explore Directory
          </Link>

          {/* Accessibility widget — always visible */}
          <AccessibilityWidget />

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[--color-border] text-[--color-text-muted] transition-colors hover:border-[--color-accent] hover:text-[--color-text-primary] lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-64 border-[--color-border] bg-[--color-bg] p-0">
              <div className="flex h-16 items-center border-b border-[--color-border] px-6">
                <span className="text-sm font-semibold text-[--color-text-primary]">
                  Navigation
                </span>
              </div>
              <nav className="flex flex-col p-4" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-[--color-text-secondary] transition-colors hover:bg-[--color-surface-alt] hover:text-[--color-text-primary]"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 border-t border-[--color-border] pt-4">
                  <Link
                    href="/directory"
                    className="block rounded-md bg-[--color-accent] px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-orange-600"
                  >
                    Explore Directory
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
