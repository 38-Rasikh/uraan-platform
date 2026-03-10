import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createSupabaseServiceClient } from '@/lib/supabase/server'

// Returns last N months of visit counts for the bar chart
export async function GET() {
  await requireAuth()

  const supabase = createSupabaseServiceClient()

  // Fetch last 6 months of visits
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  const since = sixMonthsAgo.toISOString().slice(0, 10)

  const { data: visits } = await supabase
    .from('visits')
    .select('visit_date')
    .gte('visit_date', since)
    .order('visit_date', { ascending: true })

  // Group by YYYY-MM
  const byMonth: Record<string, number> = {}
  // Pre-fill the last 6 months so months with 0 visits still appear
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    byMonth[key] = 0
  }

  for (const v of visits ?? []) {
    const key = v.visit_date.slice(0, 7)
    if (key in byMonth) byMonth[key] = (byMonth[key] ?? 0) + 1
  }

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const chartData = Object.entries(byMonth).map(([key, count]) => {
    const [, month] = key.split('-')
    return { month: monthNames[parseInt(month, 10) - 1], visits: count }
  })

  return NextResponse.json({ chartData })
}
