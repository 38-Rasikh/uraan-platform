import { createSupabaseServerClient } from '@/lib/supabase/server'
import TeamManager from '@/components/admin/team/TeamManager'

export default async function TeamPage() {
  const supabase = await createSupabaseServerClient()

  const { data: members } = await supabase
    .from('team_members')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('joined_date', { ascending: false, nullsFirst: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Team</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Manage Uraan team members. Toggle &ldquo;Currently Active&rdquo; to control public
          visibility.
        </p>
      </div>
      <TeamManager members={members ?? []} />
    </div>
  )
}
