import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET() {
  await requireAuth()

  const supabase = createSupabaseServiceClient()

  const [orphanagesRes, visitsRes] = await Promise.all([
    supabase.from('orphanages').select('id, uraan_visited, children_count').eq('is_active', true),
    supabase.from('visits').select('id, children_engaged'),
  ])

  const orphanages = orphanagesRes.data ?? []
  const visits = visitsRes.data ?? []

  const totalOrphanages = orphanages.length
  const uraanVisited = orphanages.filter((o) => o.uraan_visited).length
  const totalVisits = visits.length
  const childrenReached = visits.reduce((sum, v) => sum + (v.children_engaged ?? 0), 0)

  return NextResponse.json({
    totalOrphanages,
    uraanVisited,
    totalVisits,
    childrenReached,
  })
}
