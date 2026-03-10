import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createSupabaseServiceClient } from '@/lib/supabase/server'

// Returns last 10 activities across visits and orphanage/project creation events
export async function GET() {
  await requireAuth()

  const supabase = createSupabaseServiceClient()

  const [visitsRes, orphanagesRes, projectsRes] = await Promise.all([
    supabase
      .from('visits')
      .select('id, visit_date, volunteer_count, children_engaged, orphanages(name)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('orphanages')
      .select('id, name, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('projects')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  type ActivityItem = {
    id: string
    type: 'visit' | 'orphanage' | 'project'
    label: string
    timestamp: string
  }

  const items: ActivityItem[] = []

  for (const v of visitsRes.data ?? []) {
    const orphName = (v.orphanages as { name?: string } | null)?.name ?? 'an orphanage'
    items.push({
      id: v.id,
      type: 'visit',
      label: `Visit logged at ${orphName}`,
      timestamp: v.visit_date,
    })
  }

  for (const o of orphanagesRes.data ?? []) {
    items.push({
      id: o.id,
      type: 'orphanage',
      label: `Orphanage added: ${o.name}`,
      timestamp: o.created_at,
    })
  }

  for (const p of projectsRes.data ?? []) {
    items.push({
      id: p.id,
      type: 'project',
      label: `Project created: ${p.title}`,
      timestamp: p.created_at,
    })
  }

  // Sort all by timestamp descending, take top 10
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return NextResponse.json({ activity: items.slice(0, 10) })
}
