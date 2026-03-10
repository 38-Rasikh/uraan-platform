import { createSupabaseServerClient } from '@/lib/supabase/server'
import TeamMemberCard from '@/components/public/team/TeamMemberCard'
import type { Metadata } from 'next'
import type { TeamMember } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Our Team — Uraan Outreach Platform',
  description:
    'Meet the Uraan Rahbar Project Division team — the volunteers, coordinators, and founding members behind every visit.',
}

export const revalidate = 60

export default async function TeamPage() {
  const supabase = await createSupabaseServerClient()

  const { data: members } = await supabase
    .from('team_members')
    .select(
      'id, full_name, role, department, batch, bio, photo_url, linkedin_url, is_active, is_founding_member, sort_order'
    )
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const list = (members ?? []) as Pick<
    TeamMember,
    | 'id'
    | 'full_name'
    | 'role'
    | 'department'
    | 'batch'
    | 'bio'
    | 'photo_url'
    | 'linkedin_url'
    | 'is_founding_member'
    | 'sort_order'
  >[]

  return (
    <div className="mx-auto max-w-container px-6 py-16">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-[--color-text-primary]">Our Team</h1>
        <p className="mt-4 max-w-2xl text-lg text-[--color-text-secondary]">
          The dedicated students of UET Lahore who make Uraan&apos;s outreach possible.
        </p>
      </div>

      {/* Team Grid */}
      {list.length === 0 ? (
        <div className="rounded-lg border border-[--color-border] bg-[--color-surface] py-20 text-center">
          <p className="text-[--color-text-muted]">Team page coming soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  )
}
