import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { updateProjectSchema } from '@/lib/validators'

// ── GET /api/v1/projects/[slug] ───────────────────────────────────────────
// Public. Returns full project record by slug (or UUID).

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const query = supabase.from('projects').select('*')
  const { data, error } = await (
    uuidRegex.test(slug) ? query.eq('id', slug) : query.eq('slug', slug)
  )
    .eq('is_published', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Project not found', code: 'NOT_FOUND' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

// ── PATCH /api/v1/projects/[slug]  [Admin] ────────────────────────────────
// Partial update. Admin only. Accepts slug or UUID as identifier.

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  await requireAuth()
  const { slug } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = updateProjectSchema.safeParse(body)
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
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  const query = supabase.from('projects').update(parsed.data).select()
  const { data, error } = await (
    uuidRegex.test(slug) ? query.eq('id', slug) : query.eq('slug', slug)
  ).single()

  if (error || !data) {
    console.error('[PATCH /api/v1/projects]', error)
    return NextResponse.json(
      { error: 'Failed to update project', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data })
}

// ── DELETE /api/v1/projects/[slug]  [Admin] ───────────────────────────────
// Hard delete (projects don't use soft-delete; they have is_published instead).

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  await requireAuth()
  const { slug } = await params

  const supabase = createSupabaseServiceClient()
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  const query = supabase.from('projects').delete()
  const { error } = await (uuidRegex.test(slug) ? query.eq('id', slug) : query.eq('slug', slug))

  if (error) {
    console.error('[DELETE /api/v1/projects]', error)
    return NextResponse.json(
      { error: 'Failed to delete project', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
