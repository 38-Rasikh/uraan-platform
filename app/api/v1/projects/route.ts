import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { createProjectSchema } from '@/lib/validators'
import { generateSlug } from '@/lib/utils'

// ── GET /api/v1/projects ──────────────────────────────────────────────────
// Public. Returns all published projects ordered by date_start DESC.

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('projects')
    .select(
      'id, title, slug, tagline, date_start, date_end, duration_label, institutions, collaborators, children_reached, volunteer_count, hours_delivered, skills_taught, cover_image_url, is_published, sort_order, created_at'
    )
    .eq('is_published', true)
    .order('date_start', { ascending: false })

  if (error) {
    console.error('[GET /api/v1/projects]', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: data ?? [] })
}

// ── POST /api/v1/projects  [Admin] ────────────────────────────────────────
// Creates a new project. Auto-generates slug from title if not provided.

export async function POST(req: NextRequest) {
  await requireAuth()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, { status: 400 })
  }

  // Auto-generate slug from title if not provided
  const raw = body as Record<string, unknown>
  if (!raw.slug && typeof raw.title === 'string') {
    raw.slug = generateSlug(raw.title)
  }

  const parsed = createProjectSchema.safeParse(raw)
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

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', parsed.data.slug)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'A project with this slug already exists', code: 'SLUG_CONFLICT' },
      { status: 409 }
    )
  }

  const { data, error } = await supabase.from('projects').insert(parsed.data).select().single()

  if (error) {
    console.error('[POST /api/v1/projects]', error)
    return NextResponse.json(
      { error: 'Failed to create project', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data }, { status: 201 })
}
