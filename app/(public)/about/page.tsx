import Link from 'next/link'
import { ArrowRight, Heart, BookOpen, Users, Target } from 'lucide-react'

// ── Milestone data ────────────────────────────────────────────────────────────
const MILESTONES = [
  {
    year: '2020',
    title: 'Uraan Founded',
    description:
      'A small group of UET Lahore students launched Uraan under the Rahbar Project Division — with one orphanage, four volunteers, and a single workshop on basic computer skills.',
  },
  {
    year: '2021',
    title: 'First Mapped Directory',
    description:
      'Uraan created the first student-run directory of Lahore orphanages — visiting 12 institutions, documenting registration statuses, capacities, and needs.',
  },
  {
    year: '2022',
    title: 'Education Drive Expansion',
    description:
      'Launched structured curriculum workshops: English literacy, mathematics, and life skills delivered over 8-week cycles across 5 orphanages. Children reached crossed 200.',
  },
  {
    year: '2023',
    title: 'Tech Skills Program',
    description:
      'Introduced the first tech skills curriculum — typing, internet safety, and introductory coding for older students. Partnered with 2 NGOs for resource sharing.',
  },
  {
    year: '2024',
    title: 'Community Network Built',
    description:
      'Grew to 57+ active student volunteers, 7 endorsed skills modules, and a partner network spanning government and private institutions across Lahore.',
  },
  {
    year: '2025',
    title: 'Platform Launch',
    description:
      'Launched this open platform to document all visits, publish verified orphanage data, and connect donors, NGOs, and volunteers with the children who need them most.',
  },
]

const VALUES = [
  {
    icon: Heart,
    title: 'Compassion First',
    body: 'Every action begins with empathy. We meet children where they are — with patience, dignity, and care.',
  },
  {
    icon: BookOpen,
    title: 'Education as Empowerment',
    body: 'Skills open doors. We focus on practical, lasting knowledge that travels with a child long after our visit ends.',
  },
  {
    icon: Users,
    title: 'Student-Led Change',
    body: 'Uraan is built by students, for students and children. Peer-to-peer mentorship creates deeper connections than top-down charity.',
  },
  {
    icon: Target,
    title: 'Accountability & Transparency',
    body: 'Every visit is logged, every orphanage documented. We publish what we do so donors and partners can verify our work.',
  },
]

export default function AboutPage() {
  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-zinc-950 px-6 py-24">
        <div
          aria-hidden
          className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-[--color-accent] to-transparent opacity-50"
        />
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[--color-accent]">
            About Uraan
          </p>
          <h1 className="font-display text-5xl font-bold leading-tight text-white md:text-6xl">
            Who We Are
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400 md:text-xl">
            Uraan is a student volunteer initiative under UET Lahore&apos;s Rahbar Project Division.
            We run education, skill, and community outreach programs for children in Lahore&apos;s
            orphanages — building bridges between the university and those who need it most.
          </p>
        </div>
      </section>

      {/* ── Mission & Vision ──────────────────────────────────────────────── */}
      <section className="bg-[--color-bg] px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[--color-accent]">
              Mission
            </p>
            <p className="text-lg font-medium leading-relaxed text-[--color-text-primary]">
              To bridge the gap between university students and underprivileged children — providing
              skill education, mentorship, and sustained community connection across Lahore.
            </p>
          </div>
          <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[--color-accent]">
              Vision
            </p>
            <p className="text-lg font-medium leading-relaxed text-[--color-text-primary]">
              A Lahore where every child in an orphanage has access to a skilled mentor, a learning
              opportunity, and a community that believes in their potential.
            </p>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────────── */}
      <section className="bg-[--color-surface-alt] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[--color-accent]">
            What We Stand For
          </p>
          <h2 className="mb-10 text-3xl font-bold text-[--color-text-primary]">Our Values</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-[--color-border] bg-[--color-surface] p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[--color-accent-muted]">
                  <Icon className="h-5 w-5 text-[--color-accent]" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-[--color-text-primary]">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-[--color-text-secondary]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Milestones timeline ───────────────────────────────────────────── */}
      <section className="bg-[--color-bg] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[--color-accent]">
            History
          </p>
          <h2 className="mb-12 text-3xl font-bold text-[--color-text-primary]">Our Journey</h2>

          <ol className="relative border-l border-[--color-border]">
            {MILESTONES.map((m, idx) => (
              <li key={m.year} className={`pl-8 ${idx !== MILESTONES.length - 1 ? 'pb-10' : ''}`}>
                {/* dot */}
                <span
                  aria-hidden
                  className="absolute -left-[9px] flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-[--color-accent] bg-[--color-bg]"
                />
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[--color-accent]">
                  {m.year}
                </p>
                <h3 className="mb-2 text-lg font-semibold text-[--color-text-primary]">
                  {m.title}
                </h3>
                <p className="text-sm leading-relaxed text-[--color-text-secondary]">
                  {m.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-950 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Join the Movement</h2>
          <p className="mb-8 text-lg text-zinc-400">
            Whether you&apos;re a student, a donor, or an organization — there&apos;s a place for
            you in Uraan.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/connect"
              className="inline-flex items-center gap-2 rounded-md bg-[--color-accent] px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Get Involved <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-6 py-3 text-sm font-semibold text-white hover:border-zinc-500 hover:bg-zinc-800"
            >
              Explore the Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
