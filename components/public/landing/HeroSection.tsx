import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[92vh] flex-col justify-center overflow-hidden bg-zinc-950 px-6 py-24">
      {/* subtle grain texture overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* left accent line */}
      <div
        aria-hidden
        className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-[--color-accent] to-transparent opacity-60"
      />

      <div className="relative mx-auto w-full max-w-5xl">
        {/* eyebrow label */}
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-[--color-accent]">
          Rahbar Project Division · UET Lahore
        </p>

        {/* hero headline */}
        <h1 className="font-display text-5xl font-bold leading-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
          Igniting Minds,
          <br />
          <span className="text-[--color-accent]">Empowering</span>
          <br />
          Futures
        </h1>

        {/* subline */}
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-400 md:text-xl">
          Uraan connects UET Lahore student volunteers with orphanages across the city — running
          skill workshops, education drives, and community outreach programs.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 rounded-md bg-[--color-accent] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-900/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-accent]"
          >
            View Orphanage Directory
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-zinc-500 hover:bg-zinc-800"
          >
            Explore Projects
          </Link>
        </div>
      </div>

      {/* bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-zinc-950 to-transparent"
      />
    </section>
  )
}
