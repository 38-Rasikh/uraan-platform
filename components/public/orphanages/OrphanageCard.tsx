import Link from 'next/link'
import { MapPin, Users, CheckCircle, Heart, HandHeart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Orphanage } from '@/lib/types'

const ORG_TYPE_LABELS: Record<string, string> = {
  government: 'Government',
  ngo: 'NGO',
  volunteer: 'Volunteer',
  religious: 'Religious',
  other: 'Other',
}

interface OrphanageCardProps {
  orphanage: Pick<
    Orphanage,
    | 'id'
    | 'name'
    | 'slug'
    | 'area'
    | 'address'
    | 'org_type'
    | 'is_registered'
    | 'children_count'
    | 'uraan_visited'
    | 'visit_count'
    | 'last_visited_at'
    | 'accepts_donations'
    | 'accepts_volunteers'
    | 'is_verified'
    | 'cover_image_url'
  >
}

export default function OrphanageCard({ orphanage: o }: OrphanageCardProps) {
  return (
    <Link
      href={`/directory/${o.slug}`}
      className="block rounded-xl border border-[--color-border] bg-[--color-surface] p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8620A]"
    >
      {/* Cover image */}
      {o.cover_image_url ? (
        <div
          className="mb-4 h-40 w-full rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url(${o.cover_image_url})` }}
          aria-hidden="true"
        />
      ) : (
        <div className="mb-4 flex h-40 w-full items-center justify-center rounded-lg bg-zinc-100">
          <span className="select-none text-3xl">🏠</span>
        </div>
      )}

      {/* Name */}
      <h3 className="mb-2 text-lg font-semibold leading-snug text-[--color-text-primary]">
        {o.name}
      </h3>

      {/* Area + Address */}
      <div className="mb-3 flex items-start gap-1.5 text-sm text-[--color-text-secondary]">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E8620A]" />
        <span>
          {o.area}
          {o.address ? `, ${o.address}` : ''}
        </span>
      </div>

      {/* Badges row */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <Badge variant="outline" className="border-zinc-200 text-xs text-zinc-600">
          {ORG_TYPE_LABELS[o.org_type] ?? o.org_type}
        </Badge>

        {o.is_registered ? (
          <Badge className="border border-green-200 bg-green-50 text-xs text-green-700">
            <CheckCircle className="mr-1 h-3 w-3" /> Registered
          </Badge>
        ) : (
          <Badge variant="outline" className="border-zinc-200 text-xs text-zinc-400">
            Unregistered
          </Badge>
        )}

        {o.uraan_visited ? (
          <Badge className="border border-[#E8620A]/30 bg-[#FEF3EC] text-xs text-[#E8620A]">
            Uraan Visited
          </Badge>
        ) : (
          <Badge variant="outline" className="border-zinc-200 text-xs text-zinc-400">
            Not Yet Visited
          </Badge>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 text-[--color-text-secondary]">
          <Users className="h-4 w-4" />
          {o.children_count != null ? `${o.children_count} children` : 'Unknown count'}
        </span>

        <div className="flex items-center gap-2 text-[--color-text-muted]">
          {o.accepts_donations && (
            <span title="Accepts donations">
              <Heart className="h-4 w-4 text-rose-400" />
            </span>
          )}
          {o.accepts_volunteers && (
            <span title="Accepts volunteers">
              <HandHeart className="h-4 w-4 text-blue-400" />
            </span>
          )}
          {o.visit_count > 0 && (
            <span className="text-xs text-[--color-text-muted]">
              {o.visit_count} visit{o.visit_count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
