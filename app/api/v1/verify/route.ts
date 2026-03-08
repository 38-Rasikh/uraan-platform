import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// ── GET /api/v1/verify?q=<name_or_reg_number> ─────────────────────────────
// Public. Search orphanages by name or registration_number.
// Returns verification status for donor due-diligence.

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: 'Search query must be at least 2 characters', code: 'INVALID_PARAM' },
      { status: 400 }
    )
  }

  // Sanitize: no special regex chars that could cause issues in ILIKE
  const safe = q.replace(/[%_\\]/g, (c) => `\\${c}`)
  const term = `%${safe}%`

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('orphanages')
    .select(
      'id, name, slug, area, org_type, is_registered, registration_number, registration_body, uraan_visited, visit_count, is_verified, verified_by, verified_at, accepts_donations, accepts_volunteers'
    )
    .eq('is_active', true)
    .or(`name.ilike.${term},registration_number.ilike.${term}`)
    .order('name', { ascending: true })
    .limit(20)

  if (error) {
    console.error('[GET /api/v1/verify]', error)
    return NextResponse.json({ error: 'Search failed', code: 'DB_ERROR' }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [], query: q })
}
