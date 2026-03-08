import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, BookOpen } from 'lucide-react'
import type { Project } from '@/lib/types'

export const revalidate = 60

export default async function ProjectsPage() {
  const supabase = await createSupabaseServerClient()

  const { data: projects } = await supabase
    .from('projects')
    .select(
      'id, title, slug, tagline, date_start, date_end, duration_label, children_reached, volunteer_count, skills_taught, cover_image_url, is_published, created_at'
    )
    .eq('is_published', true)
    .order('date_start', { ascending: false })

  const list = (projects ?? []) as Pick<
    Project,
    | 'id'
    | 'title'
    | 'slug'
    | 'tagline'
    | 'date_start'
    | 'date_end'
    | 'duration_label'
    | 'children_reached'
    | 'volunteer_count'
    | 'skills_taught'
    | 'cover_image_url'
    | 'is_published'
    | 'created_at'
  >[]

  return (
    <div className="mx-auto max-w-container px-6 py-16">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-[--color-text-primary]">Outreach Projects</h1>
        <p className="mt-4 max-w-2xl text-lg text-[--color-text-secondary]">
          Every initiative Uraan has led — documented, measured, and shared.
        </p>
      </div>

      {/* Project List */}
      {list.length === 0 ? (
        <div className="rounded-lg border border-[--color-border] bg-[--color-surface] py-20 text-center">
          <p className="text-[--color-text-muted]">No projects published yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {list.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({
  project,
}: {
  project: Pick<
    Project,
    | 'id'
    | 'title'
    | 'slug'
    | 'tagline'
    | 'date_start'
    | 'date_end'
    | 'duration_label'
    | 'children_reached'
    | 'volunteer_count'
    | 'skills_taught'
    | 'cover_image_url'
    | 'created_at'
  >
}) {
  const startYear = project.date_start ? new Date(project.date_start).getFullYear() : null
  const endYear = project.date_end ? new Date(project.date_end).getFullYear() : null
  const dateRange = startYear
    ? endYear && endYear !== startYear
      ? `${startYear} – ${endYear}`
      : String(startYear)
    : null

  return (
    <Link href={`/projects/${project.slug}`}>
      <article className="group flex gap-6 rounded-xl border border-[--color-border] bg-[--color-surface] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        {/* Cover thumbnail */}
        {project.cover_image_url && (
          <div className="hidden flex-shrink-0 sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="h-28 w-40 rounded-lg object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between gap-4">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[--color-text-primary] transition-colors group-hover:text-[--color-accent]">
                  {project.title}
                </h2>
                {project.tagline && (
                  <p className="mt-1 text-sm text-[--color-text-secondary]">{project.tagline}</p>
                )}
              </div>
              {dateRange && (
                <span className="flex-shrink-0 rounded bg-[--color-surface-alt] px-2 py-0.5 font-mono text-xs text-[--color-text-muted]">
                  {dateRange}
                </span>
              )}
            </div>
          </div>

          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-4">
            {project.duration_label && (
              <span className="flex items-center gap-1.5 text-sm text-[--color-text-muted]">
                <Calendar className="h-3.5 w-3.5" />
                {project.duration_label}
              </span>
            )}
            {project.children_reached != null && (
              <span className="flex items-center gap-1.5 text-sm text-[--color-text-muted]">
                <Users className="h-3.5 w-3.5" />
                {project.children_reached} children reached
              </span>
            )}
            {project.volunteer_count != null && (
              <span className="flex items-center gap-1.5 text-sm text-[--color-text-muted]">
                <Users className="h-3.5 w-3.5" />
                {project.volunteer_count} volunteers
              </span>
            )}
          </div>

          {/* Skills */}
          {project.skills_taught && project.skills_taught.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-[--color-text-muted]" />
              {project.skills_taught.slice(0, 4).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-[--color-accent-muted] text-xs text-[--color-accent]"
                >
                  {skill}
                </Badge>
              ))}
              {project.skills_taught.length > 4 && (
                <span className="text-xs text-[--color-text-muted]">
                  +{project.skills_taught.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
