import Link from 'next/link'
import { Building2, MapPin, CalendarCheck, Users, Plus, FileUp, ClipboardList } from 'lucide-react'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import VisitsBarChart from '@/components/admin/dashboard/VisitsBarChart'

// ── Types ─────────────────────────────────────────────────────────────────────
type ActivityType = 'visit' | 'orphanage' | 'project'
interface ActivityItem {
  id: string
  type: ActivityType
  label: string
  timestamp: string
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  icon: React.ElementType
  accent?: boolean
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-400">{label}</p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            accent ? 'bg-[--color-accent]/15' : 'bg-zinc-800'
          }`}
        >
          <Icon className={`h-4 w-4 ${accent ? 'text-[--color-accent]' : 'text-zinc-400'}`} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  )
}

// ── Activity helpers ───────────────────────────────────────────────────────────
function ActivityDot({ type }: { type: ActivityType }) {
  const colorMap: Record<ActivityType, string> = {
    visit: 'bg-[--color-accent]',
    orphanage: 'bg-blue-500',
    project: 'bg-emerald-500',
  }
  return (
    <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${colorMap[type]}`} aria-hidden />
  )
}

function formatRelativeDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const supabase = createSupabaseServiceClient()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  const since = sixMonthsAgo.toISOString().slice(0, 10)

  const [
    orphanagesRes,
    visitsAllRes,
    visitsChartRes,
    recentVisitsRes,
    recentOrgsRes,
    recentProjectsRes,
  ] = await Promise.all([
    supabase.from('orphanages').select('id, uraan_visited, children_count').eq('is_active', true),
    supabase.from('visits').select('id, children_engaged'),
    supabase
      .from('visits')
      .select('visit_date')
      .gte('visit_date', since)
      .order('visit_date', { ascending: true }),
    supabase
      .from('visits')
      .select('id, visit_date, children_engaged, orphanages(name)')
      .order('visit_date', { ascending: false })
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

  // Stat values
  const orphanages = orphanagesRes.data ?? []
  const allVisits = visitsAllRes.data ?? []
  const totalOrphanages = orphanages.length
  const uraanVisited = orphanages.filter((o) => o.uraan_visited).length
  const totalVisits = allVisits.length
  const childrenReached = allVisits.reduce((sum, v) => sum + (v.children_engaged ?? 0), 0)

  // Chart data — last 6 months pre-filled
  const byMonth: Record<string, number> = {}
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
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    byMonth[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`] = 0
  }
  for (const v of visitsChartRes.data ?? []) {
    const key = v.visit_date.slice(0, 7)
    if (key in byMonth) byMonth[key] = (byMonth[key] ?? 0) + 1
  }
  const chartData = Object.entries(byMonth).map(([key, count]) => ({
    month: monthNames[parseInt(key.split('-')[1], 10) - 1],
    visits: count,
  }))

  // Activity feed
  const activityItems: ActivityItem[] = []
  for (const v of recentVisitsRes.data ?? []) {
    const orphName = (v.orphanages as { name?: string } | null)?.name ?? 'an orphanage'
    activityItems.push({
      id: v.id,
      type: 'visit',
      label: `Visit logged at ${orphName}`,
      timestamp: v.visit_date,
    })
  }
  for (const o of recentOrgsRes.data ?? []) {
    activityItems.push({
      id: o.id,
      type: 'orphanage',
      label: `Orphanage added: ${o.name}`,
      timestamp: o.created_at,
    })
  }
  for (const p of recentProjectsRes.data ?? []) {
    activityItems.push({
      id: p.id,
      type: 'project',
      label: `Project created: ${p.title}`,
      timestamp: p.created_at,
    })
  }
  activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const feed = activityItems.slice(0, 10)

  const QUICK_ACTIONS = [
    { label: 'Add Orphanage', href: '/admin/orphanages', icon: Plus },
    { label: 'Log a Visit', href: '/admin/visits', icon: CalendarCheck },
    { label: 'Add Project', href: '/admin/projects', icon: ClipboardList },
    { label: 'Import Data', href: '/admin/orphanages', icon: FileUp },
  ]

  return (
    <div className="space-y-8 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Overview of Uraan platform activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Orphanages" value={totalOrphanages} icon={Building2} />
        <StatCard label="Uraan Visited" value={uraanVisited} icon={MapPin} accent />
        <StatCard label="Total Visits Logged" value={totalVisits} icon={CalendarCheck} />
        <StatCard label="Children Reached" value={childrenReached} icon={Users} accent />
      </div>

      {/* Chart + Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-1 text-sm font-semibold text-white">Visits per Month</h2>
          <p className="mb-4 text-xs text-zinc-500">Last 6 months</p>
          <VisitsBarChart data={chartData} />
        </div>

        <div className="flex flex-col gap-6">
          {/* Recent Activity */}
          <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">Recent Activity</h2>
            {feed.length === 0 ? (
              <p className="text-xs text-zinc-500">No activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {feed.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <ActivityDot type={item.type} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-200">{item.label}</p>
                      <p className="text-xs text-zinc-500">{formatRelativeDate(item.timestamp)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="hover:border-[--color-accent]/50 flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <Icon className="h-4 w-4 text-[--color-accent]" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
