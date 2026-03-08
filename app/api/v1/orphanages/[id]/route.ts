import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { updateOrphanageSchema } from '@/lib/validators'

// The [id] param can be a UUID or a slug.
type RouteParams = { params: Promise<{ id: string }> }

async function findOrphanage(
  id: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
) {
  // Try UUID first, then slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  if (isUUID) {
    const { data } = await supabase
      .from('orphanages')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle()
    return data
  }

  const { data } = await supabase
    .from('orphanages')
    .select('*')
    .eq('slug', id)
    .eq('is_active', true)
    .maybeSingle()
  return data
}

// ── GET /api/v1/orphanages/[id] ────────────────────────────────────────────
// Public. Returns full orphanage record + visit history.

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const orphanage = await findOrphanage(id, supabase)

  if (!orphanage) {
    return NextResponse.json({ error: 'Orphanage not found', code: 'NOT_FOUND' }, { status: 404 })
  }

  // Fetch visit history
  const { data: visits } = await supabase
    .from('visits')
    .select(
      'id, visit_date, duration_hours, volunteer_count, activities, outcomes, children_engaged, lead_volunteer, notes'
    )
    .eq('orphanage_id', orphanage.id)
    .order('visit_date', { ascending: false })

  return NextResponse.json({
    data: {
      ...orphanage,
      visits: visits ?? [],
    },
  })
}

// ── PATCH /api/v1/orphanages/[id] ─────────────────────────────────────────
// Admin only. Partial update of an orphanage record.

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  await requireAuth()

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = updateOrphanageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createSupabaseServiceClient()

  // Resolve to UUID first
  const serverSupabase = await createSupabaseServerClient()
  const existing = await findOrphanage(id, serverSupabase)
  if (!existing) {
    return NextResponse.json({ error: 'Orphanage not found', code: 'NOT_FOUND' }, { status: 404 })
  }

  const { data: updated, error } = await supabase
    .from('orphanages')
    .update(parsed.data)
    .eq('id', existing.id)
    .select()
    .single()

  if (error) {
    console.error('Orphanage PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update orphanage', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: updated })
}

// ── DELETE /api/v1/orphanages/[id] ────────────────────────────────────────
// Admin only. Soft delete — sets is_active = false.

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  await requireAuth()

  const { id } = await params

  const serverSupabase = await createSupabaseServerClient()
  const existing = await findOrphanage(id, serverSupabase)
  if (!existing) {
    return NextResponse.json({ error: 'Orphanage not found', code: 'NOT_FOUND' }, { status: 404 })
  }

  const supabase = createSupabaseServiceClient()
  const { error } = await supabase
    .from('orphanages')
    .update({ is_active: false })
    .eq('id', existing.id)

  if (error) {
    console.error('Orphanage DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete orphanage', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
