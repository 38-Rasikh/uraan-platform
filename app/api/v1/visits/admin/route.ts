import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

// ── GET /api/v1/visits/admin ─────────────────────────────────────────────
// Admin endpoint. Returns paginated visits with orphanage info joined.
// Query params: orphanage_id (optional), page, limit

export async function GET(req: NextRequest) {
  await requireAuth()

  const { searchParams } = req.nextUrl
  const orphanageId = searchParams.get('orphanage_id')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '15', 10)))
  const offset = (page - 1) * limit

  // Use service client to bypass RLS so visits for soft-deleted orphanages are still visible
  const supabase = createSupabaseServiceClient()

  let query = supabase
    .from('visits')
    .select(
      'id, orphanage_id, project_id, visit_date, duration_hours, volunteer_count, activities, outcomes, children_engaged, lead_volunteer, notes, created_at, orphanages(name, area)',
      { count: 'exact' }
    )
    .order('visit_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (orphanageId) {
    // Validate UUID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(orphanageId)) {
      return NextResponse.json(
        { error: 'Invalid orphanage_id format', code: 'INVALID_PARAM' },
        { status: 400 }
      )
    }
    query = query.eq('orphanage_id', orphanageId)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('[GET /api/v1/visits/admin]', error)
    return NextResponse.json({ error: 'Failed to fetch visits', code: 'DB_ERROR' }, { status: 500 })
  }

  return NextResponse.json({ data, total: count ?? 0 })
}
