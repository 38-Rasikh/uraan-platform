import Link from 'next/link'
import { ArrowRight, MapPin, Heart, Users, Award } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Project } from '@/lib/types'

type ProjectRow = Pick<
  Project,
  'id' | 'title' | 'slug' | 'tagline' | 'date_start' | 'children_reached' | 'volunteer_count'
>

export default async function ImpactHighlights() {
  const supabase = await createSupabaseServerClient()

  const [projectRes, orphanageRes] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, slug, tagline, date_start, children_reached, volunteer_count')
      .eq('is_published', true)
      .order('date_start', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('orphanages').select('id, uraan_visited, children_count').eq('is_active', true),
  ])

  const latestProject = projectRes.data as ProjectRow | null
  const orphanages = orphanageRes.data ?? []

  const totalOrphanages = orphanages.length
  const visitedOrphanages = orphanages.filter((o) => o.uraan_visited).length
  const totalChildren = orphanages.reduce((sum, o) => sum + (o.children_count ?? 0), 0)

  return (
    <section className="bg-[--color-bg] px-6 py-20">
      <div className="mx-auto max-w-5xl">
        {/* section header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[--color-accent]">
              Impact
            </p>
            <h2 className="text-3xl font-bold text-[--color-text-primary]">Highlights</h2>
          </div>
          <Link
            href="/projects"
            className="hidden items-center gap-1 text-sm font-medium text-[--color-accent] hover:underline sm:flex"
          >
            All projects <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3-column card grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Latest Project */}
          {latestProject ? (
            <Link
              href={`/projects/${latestProject.slug}`}
              className="hover:border-[--color-accent]/40 group rounded-xl border border-[--color-border] bg-[--color-surface] p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[--color-accent-muted]">
                <Award className="h-5 w-5 text-[--color-accent]" />
              </div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[--color-accent]">
                Latest Project
              </p>
              <h3 className="mb-2 text-lg font-semibold text-[--color-text-primary] transition-colors group-hover:text-[--color-accent]">
                {latestProject.title}
              </h3>
              {latestProject.tagline && (
                <p className="mb-4 line-clamp-2 text-sm text-[--color-text-secondary]">
                  {latestProject.tagline}
                </p>
              )}
              <div className="flex flex-wrap gap-3 text-sm text-[--color-text-muted]">
                {latestProject.children_reached && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {latestProject.children_reached} children
                  </span>
                )}
                {latestProject.volunteer_count && (
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {latestProject.volunteer_count} volunteers
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[--color-accent-muted]">
                <Award className="h-5 w-5 text-[--color-accent]" />
              </div>
              <p className="text-sm text-[--color-text-muted]">No published projects yet.</p>
            </div>
          )}

          {/* Card 2: Impact Stat */}
          <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[--color-accent-muted]">
              <Heart className="h-5 w-5 text-[--color-accent]" />
            </div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[--color-accent]">
              Cumulative Impact
            </p>
            <p className="mb-4 text-4xl font-bold text-[--color-text-primary]">
              {totalChildren.toLocaleString()}
            </p>
            <p className="text-sm text-[--color-text-secondary]">
              Children across <strong>{totalOrphanages}</strong> orphanages in Lahore, with{' '}
              <strong>{visitedOrphanages}</strong> visited by Uraan.
            </p>
          </div>

          {/* Card 3: Directory CTA */}
          <Link
            href="/directory"
            className="hover:border-[--color-accent]/40 group rounded-xl border border-[--color-border] bg-[--color-surface] p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:col-span-2 lg:col-span-1"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[--color-accent-muted]">
              <MapPin className="h-5 w-5 text-[--color-accent]" />
            </div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[--color-accent]">
              Orphanage Directory
            </p>
            <h3 className="mb-2 text-lg font-semibold text-[--color-text-primary] transition-colors group-hover:text-[--color-accent]">
              Explore {totalOrphanages} Orphanages
            </h3>
            <p className="mb-4 text-sm text-[--color-text-secondary]">
              Filter by area, registration status, visit history, and more. View on a map or browse
              cards.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[--color-accent] group-hover:underline">
              Open Directory <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
