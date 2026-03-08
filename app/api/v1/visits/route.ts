import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { createVisitSchema } from '@/lib/validators'

// ── GET /api/v1/visits?orphanage_id=<uuid> ────────────────────────────────
// Public. Returns all visits for a given orphanage ordered by visit_date DESC.

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const orphanageId = searchParams.get('orphanage_id')

  if (!orphanageId) {
    return NextResponse.json(
      { error: 'orphanage_id query parameter is required', code: 'MISSING_PARAM' },
      { status: 400 }
    )
  }

  // Basic UUID format check to prevent injection via query param
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(orphanageId)) {
    return NextResponse.json(
      { error: 'Invalid orphanage_id format', code: 'INVALID_PARAM' },
      { status: 400 }
    )
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('visits')
    .select(
      'id, orphanage_id, project_id, visit_date, duration_hours, volunteer_count, activities, outcomes, children_engaged, lead_volunteer, notes, created_at'
    )
    .eq('orphanage_id', orphanageId)
    .order('visit_date', { ascending: false })

  if (error) {
    console.error('[GET /api/v1/visits]', error)
    return NextResponse.json({ error: 'Failed to fetch visits', code: 'DB_ERROR' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// ── POST /api/v1/visits  [Admin] ──────────────────────────────────────────
// Creates a new visit record. DB trigger automatically syncs orphanage stats.

export async function POST(req: NextRequest) {
  await requireAuth()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = createVisitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      },
      { status: 400 }
    )
  }

  const supabase = createSupabaseServiceClient()

  // Verify orphanage exists and is active
  const { data: orphanage, error: orphanageErr } = await supabase
    .from('orphanages')
    .select('id')
    .eq('id', parsed.data.orphanage_id)
    .eq('is_active', true)
    .single()

  if (orphanageErr || !orphanage) {
    return NextResponse.json({ error: 'Orphanage not found', code: 'NOT_FOUND' }, { status: 404 })
  }

  const { data, error } = await supabase.from('visits').insert(parsed.data).select().single()

  if (error) {
    console.error('[POST /api/v1/visits]', error)
    return NextResponse.json({ error: 'Failed to create visit', code: 'DB_ERROR' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
