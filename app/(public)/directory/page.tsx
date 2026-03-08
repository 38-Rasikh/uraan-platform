import { Suspense } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import OrphanageCard from '@/components/public/orphanages/OrphanageCard'
import DirectoryFilters from '@/components/public/orphanages/DirectoryFilters'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
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

  const { data, count } = await query
  const orphanages = (data ?? []) as Orphanage[]
  const total = count ?? 0
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[--color-text-primary]">Orphanage Directory</h1>
        <p className="mt-2 text-[--color-text-secondary]">
          Exploring {total} orphanage{total !== 1 ? 's' : ''} across Lahore
        </p>
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

        {/* ── Card Grid ── */}
        <div className="min-w-0 flex-1">
          {orphanages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="mb-4 text-5xl">🔍</span>
              <h3 className="mb-2 text-xl font-semibold text-[--color-text-primary]">
                No orphanages found
              </h3>
              <p className="mb-6 text-[--color-text-secondary]">
                Try adjusting your search or filters.
              </p>
              <Link href="/directory">
                <Button variant="outline">Clear all filters</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {orphanages.map((orphanage) => (
                  <OrphanageCard key={orphanage.id} orphanage={orphanage} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-between text-sm text-[--color-text-secondary]">
                  <span>
                    Page {page} of {totalPages} ({total} total)
                  </span>
                  <div className="flex gap-3">
                    {page > 1 && (
                      <Link
                        href={`/directory?${buildQueryString(params, { page: String(page - 1) })}`}
                      >
                        <Button variant="outline" size="sm">
                          Previous
                        </Button>
                      </Link>
                    )}
                    {page < totalPages && (
                      <Link
                        href={`/directory?${buildQueryString(params, { page: String(page + 1) })}`}
                      >
                        <Button variant="outline" size="sm">
                          Next
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
