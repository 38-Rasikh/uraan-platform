import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { updateTeamMemberSchema } from '@/lib/validators'

// ── GET /api/v1/team/[id] ────────────────────────────────────────────────
// Public. Returns a single team member by UUID.

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: 'Invalid ID format', code: 'INVALID_PARAM' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from('team_members').select('*').eq('id', id).single()

  if (error || !data) {
    return NextResponse.json({ error: 'Team member not found', code: 'NOT_FOUND' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

// ── PATCH /api/v1/team/[id]  [Admin] ─────────────────────────────────────
// Partial update. Admin only.

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const { id } = await params

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: 'Invalid ID format', code: 'INVALID_PARAM' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = updateTeamMemberSchema.safeParse(body)
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
  const { data, error } = await supabase
    .from('team_members')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    console.error('[PATCH /api/v1/team]', error)
    return NextResponse.json(
      { error: 'Failed to update team member', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data })
}

// ── DELETE /api/v1/team/[id]  [Admin] ────────────────────────────────────
// Soft delete — sets is_active = false.

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const { id } = await params

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: 'Invalid ID format', code: 'INVALID_PARAM' }, { status: 400 })
  }

  const supabase = createSupabaseServiceClient()
  const { error } = await supabase.from('team_members').update({ is_active: false }).eq('id', id)

  if (error) {
    console.error('[DELETE /api/v1/team]', error)
    return NextResponse.json(
      { error: 'Failed to remove team member', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
