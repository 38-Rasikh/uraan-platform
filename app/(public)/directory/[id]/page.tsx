import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  CheckCircle,
  Heart,
  HandHeart,
  CalendarDays,
  Clock,
  ArrowLeft,
} from 'lucide-react'
import type { Orphanage, Visit } from '@/lib/types'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const { data } = await (isUUID
    ? supabase
        .from('orphanages')
        .select('name, area, address')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle()
    : supabase
        .from('orphanages')
        .select('name, area, address')
        .eq('slug', id)
        .eq('is_active', true)
        .maybeSingle())

  if (!data) return {}

  return {
    title: `${data.name} — Uraan Orphanage Directory`,
    description: `View location, contact details, and Uraan visit history for ${data.name} in ${data.area}, Lahore.`,
  }
}

export default async function OrphanageProfilePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // Accept UUID or slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const orphanageQuery = isUUID
    ? supabase.from('orphanages').select('*').eq('id', id).eq('is_active', true).maybeSingle()
    : supabase.from('orphanages').select('*').eq('slug', id).eq('is_active', true).maybeSingle()

  const { data: orphanage } = await orphanageQuery
  if (!orphanage) notFound()

  const o = orphanage as Orphanage

  // Fetch visit history
  const { data: visitsData } = await supabase
    .from('visits')
    .select(
      'id, visit_date, duration_hours, volunteer_count, activities, outcomes, children_engaged, lead_volunteer, notes'
    )
    .eq('orphanage_id', o.id)
    .order('visit_date', { ascending: false })

  const visits = (visitsData ?? []) as Visit[]

  const ORG_TYPE_LABELS: Record<string, string> = {
    government: 'Government',
    ngo: 'NGO',
    volunteer: 'Volunteer',
    religious: 'Religious',
    other: 'Other',
  }

  const GENDER_LABELS: Record<string, string> = {
    male: 'Male only',
    female: 'Female only',
    both: 'Mixed',
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      {/* Back link */}
      <Link
        href="/directory"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[--color-text-secondary] transition-colors hover:text-[--color-text-primary]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Directory
      </Link>

      {/* Cover image */}
      {o.cover_image_url && (
        <div
          className="mb-8 h-64 w-full rounded-2xl bg-cover bg-center"
          style={{ backgroundImage: `url(${o.cover_image_url})` }}
          aria-hidden="true"
        />
      )}

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* ── Left column (main info) ── */}
        <div className="min-w-0 flex-1">
          {/* Name + badges */}
          <div className="mb-4">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {ORG_TYPE_LABELS[o.org_type] ?? o.org_type}
              </Badge>
              {o.is_registered && (
                <Badge className="border border-green-800/50 bg-green-900/20 text-xs text-green-400">
                  <CheckCircle className="mr-1 h-3 w-3" /> Registered
                </Badge>
              )}
              {o.uraan_visited && (
                <Badge className="border-[--color-accent]/30 border bg-[--color-accent-muted] text-xs text-[--color-accent]">
                  Uraan Visited
                </Badge>
              )}
              {o.is_verified && (
                <Badge className="border border-blue-800/50 bg-blue-900/20 text-xs text-blue-400">
                  ✓ Verified
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold leading-tight text-[--color-text-primary]">
              {o.name}
            </h1>
          </div>

          {/* Address */}
          <div className="mb-6 flex items-start gap-2 text-[--color-text-secondary]">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#E8620A]" />
            <span>
              {o.address}, {o.area}, {o.city}
            </span>
          </div>

          <Separator className="mb-6" />

          {/* Children info */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {o.children_count != null && (
              <div className="rounded-lg border border-[--color-border] bg-[--color-surface-alt] p-4 text-center">
                <div className="text-2xl font-bold text-[--color-text-primary]">
                  {o.children_count}
                </div>
                <div className="mt-1 text-xs text-[--color-text-muted]">Children</div>
              </div>
            )}
            {o.age_range && (
              <div className="rounded-lg border border-[--color-border] bg-[--color-surface-alt] p-4 text-center">
                <div className="text-lg font-bold text-[--color-text-primary]">{o.age_range}</div>
                <div className="mt-1 text-xs text-[--color-text-muted]">Age Range</div>
              </div>
            )}
            {o.gender_served && (
              <div className="rounded-lg border border-[--color-border] bg-[--color-surface-alt] p-4 text-center">
                <div className="text-lg font-bold text-[--color-text-primary]">
                  {GENDER_LABELS[o.gender_served]}
                </div>
                <div className="mt-1 text-xs text-[--color-text-muted]">Gender</div>
              </div>
            )}
            <div className="rounded-lg border border-[--color-border] bg-[--color-surface-alt] p-4 text-center">
              <div className="text-2xl font-bold text-[--color-text-primary]">{o.visit_count}</div>
              <div className="mt-1 text-xs text-[--color-text-muted]">
                Uraan Visit{o.visit_count !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Registration details */}
          {o.is_registered && (o.registration_number || o.registration_body) && (
            <>
              <Separator className="mb-6" />
              <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold text-[--color-text-primary]">
                  Registration Details
                </h2>
                <div className="space-y-2 text-sm">
                  {o.registration_number && (
                    <div className="flex gap-2">
                      <span className="w-36 shrink-0 text-[--color-text-muted]">Reg. Number</span>
                      <span className="font-mono text-[--color-text-primary]">
                        {o.registration_number}
                      </span>
                    </div>
                  )}
                  {o.registration_body && (
                    <div className="flex gap-2">
                      <span className="w-36 shrink-0 text-[--color-text-muted]">
                        Registered with
                      </span>
                      <span className="text-[--color-text-secondary]">{o.registration_body}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Donations */}
          {o.accepts_donations && (
            <>
              <Separator className="mb-6" />
              <div className="mb-6">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[--color-text-primary]">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Donations
                </h2>
                {o.donation_details && (
                  <p className="text-sm leading-relaxed text-[--color-text-secondary]">
                    {o.donation_details}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Volunteering */}
          {o.accepts_volunteers && (
            <>
              <Separator className="mb-6" />
              <div className="mb-6">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[--color-text-primary]">
                  <HandHeart className="h-5 w-5 text-blue-500" />
                  Volunteering
                </h2>
                {o.volunteer_details && (
                  <p className="text-sm leading-relaxed text-[--color-text-secondary]">
                    {o.volunteer_details}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Notes */}
          {o.notes && (
            <>
              <Separator className="mb-6" />
              <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold text-[--color-text-primary]">Notes</h2>
                <p className="text-sm leading-relaxed text-[--color-text-secondary]">{o.notes}</p>
              </div>
            </>
          )}
        </div>

        {/* ── Right column (visits + contact + map) ── */}
        <div className="w-full shrink-0 space-y-6 lg:w-80">
          {/* Contact card */}
          {(o.contact_name || o.contact_phone || o.contact_email || o.website) && (
            <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[--color-text-primary]">
                Contact
              </h3>
              <div className="space-y-2 text-sm">
                {o.contact_name && (
                  <div className="flex items-center gap-2 text-[--color-text-secondary]">
                    <Users className="h-4 w-4 shrink-0 text-zinc-400" />
                    {o.contact_name}
                  </div>
                )}
                {o.contact_phone && (
                  <a
                    href={`tel:${o.contact_phone}`}
                    className="flex items-center gap-2 text-[#E8620A] hover:underline"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    {o.contact_phone}
                  </a>
                )}
                {o.contact_email && (
                  <a
                    href={`mailto:${o.contact_email}`}
                    className="flex items-center gap-2 text-[#E8620A] hover:underline"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    {o.contact_email}
                  </a>
                )}
                {o.website && (
                  <a
                    href={o.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#E8620A] hover:underline"
                  >
                    <Globe className="h-4 w-4 shrink-0" />
                    Website
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Map placeholder (Week 3 — Leaflet) */}
          {o.latitude && o.longitude && (
            <div className="flex h-48 items-center justify-center rounded-xl border border-[--color-border] bg-zinc-800 text-sm text-zinc-400">
              Map coming in Week 3
            </div>
          )}

          {/* Visit history */}
          {visits.length > 0 && (
            <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[--color-text-primary]">
                Uraan Visit History
              </h3>
              <div className="space-y-4">
                {visits.map((v) => (
                  <div
                    key={v.id}
                    className="relative pl-5 before:absolute before:left-1.5 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-[#E8620A]"
                  >
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium text-[--color-text-primary]">
                      <CalendarDays className="h-4 w-4 text-[#E8620A]" />
                      {new Date(v.visit_date).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-[--color-text-muted]">
                      {v.duration_hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {v.duration_hours}h
                        </span>
                      )}
                      {v.volunteer_count && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {v.volunteer_count} volunteers
                        </span>
                      )}
                      {v.children_engaged && <span>{v.children_engaged} children engaged</span>}
                    </div>
                    {v.activities && v.activities.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {v.activities.map((act) => (
                          <span
                            key={act}
                            className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                          >
                            {act}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last verified */}
          {o.is_verified && o.verified_at && (
            <p className="text-center text-xs text-[--color-text-muted]">
              Verified on{' '}
              {new Date(o.verified_at).toLocaleDateString('en-PK', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
              {o.verified_by ? ` by ${o.verified_by}` : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
