import { Suspense } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import DirectoryFilters from '@/components/public/orphanages/DirectoryFilters'
import DirectoryViewToggle from '@/components/public/orphanages/DirectoryViewToggle'
import MobileFilterSheet from '@/components/public/orphanages/MobileFilterSheet'
import type { Orphanage } from '@/lib/types'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function getParam(v: string | string[] | undefined): string {
  if (!v) return ''
  return Array.isArray(v) ? (v[0] ?? '') : v
}

function getParamArray(v: string | string[] | undefined): string[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

function buildQueryString(
  current: Record<string, string | string[] | undefined>,
  overrides: Record<string, string>
): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(current)) {
    if (v === undefined) continue
    if (Array.isArray(v)) v.forEach((item) => params.append(k, item))
    else params.set(k, v)
  }
  for (const [k, v] of Object.entries(overrides)) {
    params.set(k, v)
  }
  return params.toString()
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const params = await searchParams

  const page = Math.max(1, parseInt(getParam(params.page) || '1', 10))
  const limit = 20
  const offset = (page - 1) * limit

  const search = getParam(params.search)
  const areas = getParamArray(params.area)
  const orgTypes = getParamArray(params.org_type)
  const isRegistered = getParam(params.is_registered)
  const uraanVisited = getParam(params.uraan_visited)
  const acceptsDonations = getParam(params.accepts_donations)
  const acceptsVolunteers = getParam(params.accepts_volunteers)
  const sort = (getParam(params.sort) || 'name') as
    | 'name'
    | 'visit_count'
    | 'last_visited_at'
    | 'created_at'
  const order = getParam(params.order) === 'desc' ? 'desc' : 'asc'

  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('orphanages')
    .select(
      'id, name, slug, area, address, org_type, is_registered, children_count, uraan_visited, visit_count, last_visited_at, accepts_donations, accepts_volunteers, is_verified, cover_image_url',
      { count: 'exact' }
    )
    .eq('is_active', true)
    .order(sort, { ascending: order === 'asc', nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (search) {
    const term = `%${search}%`
    query = query.or(`name.ilike.${term},area.ilike.${term},address.ilike.${term}`)
  }
  if (areas.length === 1) query = query.eq('area', areas[0]!)
  if (areas.length > 1) query = query.in('area', areas)
  if (orgTypes.length === 1) query = query.eq('org_type', orgTypes[0]!)
  if (orgTypes.length > 1) query = query.in('org_type', orgTypes)
  if (isRegistered === 'true') query = query.eq('is_registered', true)
  if (uraanVisited === 'true') query = query.eq('uraan_visited', true)
  if (acceptsDonations === 'true') query = query.eq('accepts_donations', true)
  if (acceptsVolunteers === 'true') query = query.eq('accepts_volunteers', true)

  // Map query: all orphanages with coordinates (same filters, no pagination)
  let mapQuery = supabase
    .from('orphanages')
    .select(
      'id, name, slug, area, latitude, longitude, uraan_visited, visit_count, children_count, org_type'
    )
    .eq('is_active', true)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)

  if (search) {
    const term = `%${search}%`
    mapQuery = mapQuery.or(`name.ilike.${term},area.ilike.${term},address.ilike.${term}`)
  }
  if (areas.length === 1) mapQuery = mapQuery.eq('area', areas[0]!)
  if (areas.length > 1) mapQuery = mapQuery.in('area', areas)
  if (orgTypes.length === 1) mapQuery = mapQuery.eq('org_type', orgTypes[0]!)
  if (orgTypes.length > 1) mapQuery = mapQuery.in('org_type', orgTypes)
  if (isRegistered === 'true') mapQuery = mapQuery.eq('is_registered', true)
  if (uraanVisited === 'true') mapQuery = mapQuery.eq('uraan_visited', true)
  if (acceptsDonations === 'true') mapQuery = mapQuery.eq('accepts_donations', true)
  if (acceptsVolunteers === 'true') mapQuery = mapQuery.eq('accepts_volunteers', true)

  const [{ data, count }, { data: mapData }] = await Promise.all([query, mapQuery])

  const orphanages = (data ?? []) as Orphanage[]
  const mapOrphanages = (mapData ?? []) as Orphanage[]
  const total = count ?? 0
  const totalPages = Math.ceil(total / limit)

  function buildPageHref(p: number) {
    return `/directory?${buildQueryString(params, { page: String(p) })}`
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      {/* Page header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[--color-text-primary]">Orphanage Directory</h1>
          <p className="mt-2 text-[--color-text-secondary]">
            Exploring {total} orphanage{total !== 1 ? 's' : ''} across Lahore
          </p>
        </div>
        {/* Mobile filter trigger (hidden on lg+) */}
        <MobileFilterSheet
          search={search}
          areas={areas}
          orgTypes={orgTypes}
          isRegistered={isRegistered}
          uraanVisited={uraanVisited}
          acceptsDonations={acceptsDonations}
          acceptsVolunteers={acceptsVolunteers}
        />
      </div>

      <div className="flex gap-8">
        {/* ── Filter Sidebar ── */}
        <div className="hidden w-72 shrink-0 lg:block">
          <Suspense>
            <DirectoryFilters
              search={search}
              areas={areas}
              orgTypes={orgTypes}
              isRegistered={isRegistered}
              uraanVisited={uraanVisited}
              acceptsDonations={acceptsDonations}
              acceptsVolunteers={acceptsVolunteers}
            />
          </Suspense>
        </div>

        {/* ── Content area: Grid or Map ── */}
        <div className="min-w-0 flex-1">
          <Suspense>
            <DirectoryViewToggle
              orphanages={orphanages}
              mapOrphanages={mapOrphanages}
              total={total}
              page={page}
              totalPages={totalPages}
              prevHref={page > 1 ? buildPageHref(page - 1) : null}
              nextHref={page < totalPages ? buildPageHref(page + 1) : null}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
