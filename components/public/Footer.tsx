import Link from 'next/link'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { Mail, Github } from 'lucide-react'

const footerLinks = [
  { href: '/directory', label: 'Orphanage Directory' },
  { href: '/projects', label: 'Projects' },
  { href: '/team', label: 'Team' },
  { href: '/about', label: 'About Uraan' },
  { href: '/connect', label: 'Connect' },
  { href: '/verify', label: 'Verify an NGO' },
]

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-white">
      <div className="mx-auto max-w-container px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center gap-2">
              <Image
                src="/uraan-logo-white.png"
                alt="Uraan logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <p className="text-lg font-semibold">Uraan</p>
            </div>
            <p className="text-sm text-zinc-400">Igniting Minds, Empowering Futures</p>
            <p className="text-sm text-zinc-500">Rahbar Project Division · UET Lahore</p>
          </div>

          {/* Platform links */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Platform</p>
            <nav className="flex flex-col gap-2" aria-label="Footer navigation">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-zinc-400 transition-colors hover:text-white focus-visible:underline"
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

          {/* Contact Developers */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              Contact Developers
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              Found a bug or want to suggest a feature? Reach out to the platform team directly.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:dev@uraan.uet.edu.pk"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-[--color-accent] focus-visible:underline"
                aria-label="Email the development team"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                dev@uraan.uet.edu.pk
              </a>
              <a
                href="https://github.com/uraan-uet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-[--color-accent] focus-visible:underline"
                aria-label="Uraan on GitHub (opens in new tab)"
              >
                <Github className="h-4 w-4 flex-shrink-0" />
                github.com/uraan-uet
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-zinc-800" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-zinc-600 sm:flex-row">
          <p>© {new Date().getFullYear()} Uraan Society, UET Lahore. All rights reserved.</p>
          <p>Built by Rahbar · UET Lahore</p>
        </div>
      </div>
    </footer>
  )
}
