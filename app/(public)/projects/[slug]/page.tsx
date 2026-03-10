import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Users, Clock, Building2, Handshake, BookOpen } from 'lucide-react'
import type { Metadata } from 'next'
import type { Project } from '@/lib/types'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const query = supabase
    .from('projects')
    .select('title, tagline, cover_image_url')
    .eq('is_published', true)
  const { data } = await (
    uuidRegex.test(slug) ? query.eq('id', slug) : query.eq('slug', slug)
  ).single()

  if (!data) return {}

  return {
    title: `${data.title} — Uraan Projects`,
    description: data.tagline ?? `Details for the ${data.title} Uraan outreach project.`,
    openGraph: data.cover_image_url ? { images: [{ url: data.cover_image_url }] } : undefined,
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const query = supabase.from('projects').select('*').eq('is_published', true)
  const { data } = await (
    uuidRegex.test(slug) ? query.eq('id', slug) : query.eq('slug', slug)
  ).single()

  if (!data) notFound()

  const project = data as Project

  return (
    <div className="mx-auto max-w-container px-6 py-12">
      {/* Back link */}
      <Link
        href="/projects"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[--color-text-muted] transition-colors hover:text-[--color-accent]"
      >
        <ArrowLeft className="h-4 w-4" />
        All Projects
      </Link>

      {/* Hero */}
      {project.cover_image_url && (
        <div className="relative mb-8 h-72 w-full overflow-hidden rounded-2xl">
          <Image
            src={project.cover_image_url}
            alt={project.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </div>
      )}

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[--color-text-primary]">{project.title}</h1>
        {project.tagline && (
          <p className="mt-3 text-xl text-[--color-text-secondary]">{project.tagline}</p>
        )}
      </div>

      {/* Metadata strip */}
      <div className="mb-10 flex flex-wrap gap-x-8 gap-y-3 rounded-xl border border-[--color-border] bg-[--color-surface-alt] px-6 py-4">
        {project.date_start && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-[--color-accent]" />
            <span className="text-[--color-text-secondary]">
              {new Date(project.date_start).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              {project.date_end &&
                ` – ${new Date(project.date_end).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}`}
            </span>
          </div>
        )}
        {project.duration_label && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-[--color-accent]" />
            <span className="text-[--color-text-secondary]">{project.duration_label}</span>
          </div>
        )}
        {project.institutions && project.institutions.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-[--color-accent]" />
            <span className="text-[--color-text-secondary]">{project.institutions.join(', ')}</span>
          </div>
        )}
        {project.collaborators && project.collaborators.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Handshake className="h-4 w-4 text-[--color-accent]" />
            <span className="text-[--color-text-secondary]">
              {project.collaborators.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Impact Stats */}
      {(project.children_reached != null ||
        project.volunteer_count != null ||
        project.hours_delivered != null) && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-[--color-text-primary]">Impact</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {project.children_reached != null && (
              <StatCard
                value={project.children_reached}
                label="Children Reached"
                icon={<Users className="h-5 w-5" />}
              />
            )}
            {project.volunteer_count != null && (
              <StatCard
                value={project.volunteer_count}
                label="Volunteers"
                icon={<Users className="h-5 w-5" />}
              />
            )}
            {project.hours_delivered != null && (
              <StatCard
                value={project.hours_delivered}
                label="Hours Delivered"
                icon={<Clock className="h-5 w-5" />}
              />
            )}
          </div>
        </section>
      )}

      {/* Description */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-[--color-text-primary]">About</h2>
        <div className="prose prose-zinc max-w-none whitespace-pre-line leading-relaxed text-[--color-text-secondary]">
          {project.description}
        </div>
      </section>

      {/* Skills taught */}
      {project.skills_taught && project.skills_taught.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[--color-text-primary]">
            <BookOpen className="h-5 w-5 text-[--color-accent]" />
            Skills Taught
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.skills_taught.map((skill) => (
              <Badge
                key={skill}
                className="bg-[--color-accent-muted] px-3 py-1 text-sm text-[--color-accent]"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      {project.gallery_urls && project.gallery_urls.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-[--color-text-primary]">Gallery</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {project.gallery_urls.map((url, i) => (
              <div key={i} className="relative aspect-square w-full overflow-hidden rounded-lg">
                <Image
                  src={url}
                  alt={`${project.title} gallery image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({ value, label, icon }: { value: number; label: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5 text-center shadow-sm">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[--color-accent-muted] text-[--color-accent]">
        {icon}
      </div>
      <p className="text-3xl font-bold text-[--color-text-primary]">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm text-[--color-text-secondary]">{label}</p>
    </div>
  )
}
