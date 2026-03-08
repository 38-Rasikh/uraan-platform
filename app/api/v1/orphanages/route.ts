import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { createOrphanageSchema, orphanageQuerySchema } from '@/lib/validators'
import { generateSlug } from '@/lib/utils'

// ── GET /api/v1/orphanages ─────────────────────────────────────────────────
// Public endpoint. Returns paginated, filtered list of active orphanages.

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const parsed = orphanageQuerySchema.safeParse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    area: searchParams.get('area') ?? undefined,
    org_type: searchParams.get('org_type') ?? undefined,
    is_registered: searchParams.get('is_registered') ?? undefined,
    uraan_visited: searchParams.get('uraan_visited') ?? undefined,
    accepts_donations: searchParams.get('accepts_donations') ?? undefined,
    accepts_volunteers: searchParams.get('accepts_volunteers') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    order: searchParams.get('order') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid query parameters',
        code: 'INVALID_PARAMS',
        details: parsed.error.flatten(),
      },
      { status: 400 }
    )
  }

  const {
    page,
    limit,
    area,
    org_type,
    is_registered,
    uraan_visited,
    accepts_donations,
    accepts_volunteers,
    search,
    sort,
    order,
  } = parsed.data
  const offset = (page - 1) * limit

  const supabase = await createSupabaseServerClient()

  // Build query — count total matching rows with same filters
  let countQuery = supabase
    .from('orphanages')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)

  let dataQuery = supabase
    .from('orphanages')
    .select(
      'id, name, slug, area, address, org_type, is_registered, children_count, uraan_visited, visit_count, last_visited_at, accepts_donations, accepts_volunteers, is_verified, cover_image_url'
    )
    .eq('is_active', true)

  // Apply filters to both queries
  const applyFilters = (q: typeof dataQuery) => {
    if (area) q = q.eq('area', area)
    if (org_type) q = q.eq('org_type', org_type)
    if (is_registered !== undefined) q = q.eq('is_registered', is_registered)
    if (uraan_visited !== undefined) q = q.eq('uraan_visited', uraan_visited)
    if (accepts_donations !== undefined) q = q.eq('accepts_donations', accepts_donations)
    if (accepts_volunteers !== undefined) q = q.eq('accepts_volunteers', accepts_volunteers)
    if (search) {
      const term = `%${search}%`
      q = q.or(`name.ilike.${term},area.ilike.${term},address.ilike.${term}`)
    }
    return q
  }

  const applyCountFilters = (q: typeof countQuery) => {
    if (area) q = q.eq('area', area)
    if (org_type) q = q.eq('org_type', org_type)
    if (is_registered !== undefined) q = q.eq('is_registered', is_registered)
    if (uraan_visited !== undefined) q = q.eq('uraan_visited', uraan_visited)
    if (accepts_donations !== undefined) q = q.eq('accepts_donations', accepts_donations)
    if (accepts_volunteers !== undefined) q = q.eq('accepts_volunteers', accepts_volunteers)
    if (search) {
      const term = `%${search}%`
      q = q.or(`name.ilike.${term},area.ilike.${term},address.ilike.${term}`)
    }
    return q
  }

  dataQuery = applyFilters(dataQuery)
  countQuery = applyCountFilters(countQuery)

  // Sorting
  dataQuery = dataQuery.order(sort, { ascending: order === 'asc', nullsFirst: false })

  // Pagination
  dataQuery = dataQuery.range(offset, offset + limit - 1)

  const [{ data, error }, { count, error: countError }] = await Promise.all([dataQuery, countQuery])

  if (error || countError) {
    console.error('Orphanages GET error:', error || countError)
    return NextResponse.json(
      { error: 'Failed to fetch orphanages', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  const total = count ?? 0

  return NextResponse.json({
    data: data ?? [],
    meta: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  })
}

// ── POST /api/v1/orphanages ────────────────────────────────────────────────
// Admin only. Creates a new orphanage record.

export async function POST(req: NextRequest) {
  await requireAuth()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = createOrphanageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data

  // Generate unique slug from name
  const supabase = createSupabaseServiceClient()
  const baseSlug = generateSlug(data.name)
  let slug = baseSlug
  let suffix = 1

  while (true) {
    const { data: existing } = await supabase
      .from('orphanages')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!existing) break
    slug = `${baseSlug}-${suffix++}`
  }

  const { data: orphanage, error } = await supabase
    .from('orphanages')
    .insert({ ...data, slug })
    .select()
    .single()

  if (error) {
    console.error('Orphanage POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create orphanage', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: orphanage }, { status: 201 })
}
