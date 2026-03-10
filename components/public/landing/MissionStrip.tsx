import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function MissionStrip() {
  return (
    <section className="bg-zinc-950 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="border-l-4 border-[--color-accent] pl-8">
          {/* label */}
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[--color-accent]">
            Our Mission
          </p>

          {/* mission statement */}
          <blockquote className="text-2xl font-medium leading-snug text-white md:text-3xl">
            To bridge the gap between talented university students and underprivileged children —
            providing skill education, mentorship, and community connection across Lahore&apos;s
            orphanages.
          </blockquote>

          {/* vision */}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400">
            Every child deserves access to quality education and a mentor who believes in them.
            Uraan brings that belief to life through sustained, measurable outreach — one visit at a
            time.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-md bg-[--color-accent] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-600"
            >
              Explore Projects
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-zinc-500 hover:bg-zinc-800"
            >
              View Orphanage Directory
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
