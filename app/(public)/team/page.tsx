import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Linkedin, Star } from 'lucide-react'
import type { TeamMember } from '@/lib/types'

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

function TeamMemberCard({
  member,
}: {
  member: Pick<
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
  >
}) {
  return (
    <div className="group flex flex-col rounded-xl border border-[--color-border] bg-[--color-surface] p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Avatar */}
      <div className="mb-4 flex items-start justify-between">
        {member.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photo_url}
            alt={member.full_name}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-[--color-border]"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[--color-accent-muted] text-2xl font-bold text-[--color-accent]">
            {member.full_name.charAt(0).toUpperCase()}
          </div>
        )}
        {member.linkedin_url && (
          <a
            href={member.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1 text-[--color-text-muted] transition-colors hover:text-[--color-accent]"
            aria-label={`${member.full_name} on LinkedIn`}
          >
            <Linkedin className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <h3 className="text-base font-semibold text-[--color-text-primary]">
            {member.full_name}
          </h3>
          {member.is_founding_member && (
            <Star
              className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
              aria-label="Founding member"
            />
          )}
        </div>
        <p className="mt-0.5 text-sm font-medium text-[--color-accent]">{member.role}</p>
        {member.department && (
          <p className="text-xs text-[--color-text-muted]">{member.department}</p>
        )}
        {member.batch && (
          <Badge
            variant="secondary"
            className="mt-2 bg-[--color-surface-alt] font-mono text-xs text-[--color-text-muted]"
          >
            {member.batch}
          </Badge>
        )}
        {member.bio && (
          <p className="mt-3 line-clamp-3 text-sm text-[--color-text-secondary]">{member.bio}</p>
        )}
      </div>
    </div>
  )
}
