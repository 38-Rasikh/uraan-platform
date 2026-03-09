'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Linkedin, Star, ChevronDown, ChevronUp } from 'lucide-react'
import type { TeamMember } from '@/lib/types'

type CardMember = Pick<
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

const BIO_CHAR_LIMIT = 160

export default function TeamMemberCard({ member }: { member: CardMember }) {
  const bio = member.bio ?? ''
  const needsTruncation = bio.length > BIO_CHAR_LIMIT
  const [expanded, setExpanded] = useState(false)
  const displayBio =
    needsTruncation && !expanded ? bio.slice(0, BIO_CHAR_LIMIT).trimEnd() + '…' : bio

  return (
    <div className="group flex flex-col rounded-xl border border-[--color-border] bg-[--color-surface] p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Avatar row */}
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

      {/* Name + role */}
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

        {/* Bio with toggle */}
        {bio && (
          <div className="mt-3">
            <p className="text-sm leading-relaxed text-[--color-text-secondary]">{displayBio}</p>
            {needsTruncation && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-1.5 flex items-center gap-0.5 text-xs font-medium text-[--color-accent] hover:underline focus:outline-none"
              >
                {expanded ? (
                  <>
                    Show less <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Read more <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
