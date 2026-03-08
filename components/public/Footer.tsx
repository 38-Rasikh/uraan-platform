import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

const footerLinks = [
  { href: '/directory', label: 'Orphanage Directory' },
  { href: '/projects', label: 'Projects' },
  { href: '/team', label: 'Team' },
  { href: '/connect', label: 'Connect' },
  { href: '/verify', label: 'Verify an NGO' },
]

export function Footer() {
  return (
    <footer className="bg-[--color-text-primary] text-white">
      <div className="mx-auto max-w-container px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <p className="text-lg font-semibold">Uraan</p>
            <p className="text-sm text-zinc-400">Igniting Minds, Empowering Futures</p>
            <p className="text-sm text-zinc-500">Rahbar Project Division · UET Lahore</p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Platform</p>
            <nav className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mission */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Mission</p>
            <p className="text-sm leading-relaxed text-zinc-400">
              Connecting volunteers, donors, and communities to improve the lives of children in
              orphanages across Lahore.
            </p>
          </div>
        </div>

        <Separator className="my-8 bg-zinc-800" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-zinc-600 sm:flex-row">
          <p>© {new Date().getFullYear()} Uraan Society, UET Lahore. All rights reserved.</p>
          <p>Built by Rahbar</p>
        </div>
      </div>
    </footer>
  )
}
