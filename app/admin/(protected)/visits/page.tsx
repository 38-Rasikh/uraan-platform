import { createSupabaseServerClient } from '@/lib/supabase/server'
import VisitsManager from '@/components/admin/visits/VisitsManager'

export default async function VisitLoggerPage() {
  const supabase = await createSupabaseServerClient()

  const [{ data: orphanages }, { data: projects }] = await Promise.all([
    supabase
      .from('orphanages')
      .select('id, name, area')
      .eq('is_active', true)
      .order('name', { ascending: true }),
    supabase.from('projects').select('id, title').order('date_start', { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Visit Logger</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Log a new visit — orphanage stats update automatically via DB trigger.
        </p>
      </div>
      <VisitsManager orphanages={orphanages ?? []} projects={projects ?? []} />
    </div>
  )
}
