import { createSupabaseServerClient } from '@/lib/supabase/server'
import ProjectsManager from '@/components/admin/projects/ProjectsManager'

export default async function ProjectsPage() {
  const supabase = await createSupabaseServerClient()

  const { data: projects } = await supabase
    .from('projects')
    .select(
      'id, title, slug, tagline, description, date_start, date_end, duration_label, institutions, collaborators, children_reached, volunteer_count, hours_delivered, skills_taught, cover_image_url, gallery_urls, impact_metrics, is_published, sort_order, created_at, updated_at'
    )
    .order('date_start', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Projects</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Manage Uraan outreach projects. Toggle Published to control public visibility.
        </p>
      </div>
      <ProjectsManager projects={projects ?? []} />
    </div>
  )
}
