import { createSupabaseServerClient } from '@/lib/supabase/server'
import OrphanagesManager from '@/components/admin/orphanages/OrphanagesManager'
import type { Orphanage } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    sort?: string
    order?: string
    area?: string
    org_type?: string
    is_registered?: string
    uraan_visited?: string
  }>
}

export default async function OrphanageManagerPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const limit = 20
  const search = params.search ?? ''
  const sort = (params.sort ?? 'name') as 'name' | 'visit_count' | 'last_visited_at' | 'created_at'
  const order = params.order === 'desc' ? 'desc' : 'asc'
  const area = params.area ?? ''
  const orgType = params.org_type ?? ''
  const isRegistered = params.is_registered ?? ''
  const uraanVisited = params.uraan_visited ?? ''
  const offset = (page - 1) * limit

  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('orphanages')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order(sort, { ascending: order === 'asc', nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (search) {
    const term = `%${search}%`
    query = query.or(`name.ilike.${term},area.ilike.${term},address.ilike.${term}`)
  }
  if (area) query = query.eq('area', area)
  if (orgType) query = query.eq('org_type', orgType)
  if (isRegistered === 'true') query = query.eq('is_registered', true)
  if (isRegistered === 'false') query = query.eq('is_registered', false)
  if (uraanVisited === 'true') query = query.eq('uraan_visited', true)
  if (uraanVisited === 'false') query = query.eq('uraan_visited', false)

  const { data, count, error } = await query

  if (error) {
    return <div className="p-6 text-red-400">Failed to load orphanages: {error.message}</div>
  }

  const orphanages = (data ?? []) as Orphanage[]
  const total = count ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Orphanage Directory</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {total} orphanage{total !== 1 ? 's' : ''} in database
        </p>
      </div>

      <OrphanagesManager
        orphanages={orphanages}
        total={total}
        page={page}
        limit={limit}
        search={search}
        sort={sort}
        order={order}
        area={area}
        orgType={orgType}
        isRegistered={isRegistered}
        uraanVisited={uraanVisited}
      />
    </div>
  )
}
