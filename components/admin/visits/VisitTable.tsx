'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import type { Visit, Orphanage } from '@/lib/types'

interface VisitWithOrphanage extends Visit {
  orphanages: { name: string; area: string } | null
}

interface VisitTableProps {
  orphanages: Pick<Orphanage, 'id' | 'name' | 'area'>[]
  refreshSignal: number
}

const PAGE_SIZE = 15

export default function VisitTable({ orphanages, refreshSignal }: VisitTableProps) {
  const [visits, setVisits] = useState<VisitWithOrphanage[]>([])
  const [loading, setLoading] = useState(false)
  const [filterOrphanage, setFilterOrphanage] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const router = useRouter()

  const loadVisits = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch directly from Supabase via the public GET endpoint
      const params = new URLSearchParams()
      if (filterOrphanage) params.set('orphanage_id', filterOrphanage)
      params.set('page', String(page))
      params.set('limit', String(PAGE_SIZE))

      const res = await fetch(`/api/v1/visits/admin?${params.toString()}`)
      if (res.ok) {
        const json = (await res.json()) as { data: VisitWithOrphanage[]; total: number }
        setVisits(json.data ?? [])
        setTotal(json.total ?? 0)
      }
    } catch {
      // silently handled — table just stays empty
    } finally {
      setLoading(false)
    }
  }, [filterOrphanage, page])

  useEffect(() => {
    void loadVisits()
  }, [loadVisits, refreshSignal])

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1)
  }, [filterOrphanage])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-base font-semibold text-white">Visit History</h3>

        <select
          value={filterOrphanage}
          onChange={(e) => setFilterOrphanage(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E8620A]"
          aria-label="Filter by orphanage"
        >
          <option value="">All Orphanages</option>
          {orphanages.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} ({o.area})
            </option>
          ))}
        </select>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            void loadVisits()
            router.refresh()
          }}
          className="text-zinc-400 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>

        <span className="ml-auto text-xs text-zinc-500">
          {total} visit{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Orphanage</th>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Volunteers</th>
              <th className="px-4 py-3">Children</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Activities</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && visits.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No visits found.
                  {filterOrphanage && ' Try clearing the orphanage filter.'}
                </td>
              </tr>
            )}
            {!loading &&
              visits.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-zinc-800 bg-zinc-950 transition-colors hover:bg-zinc-900"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-300">
                    {formatDate(v.visit_date)}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {v.orphanages ? (
                      <>
                        <span className="font-medium">{v.orphanages.name}</span>
                        <span className="ml-1.5 text-xs text-zinc-500">{v.orphanages.area}</span>
                      </>
                    ) : (
                      <span className="text-zinc-500">Unknown</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {v.lead_volunteer ?? <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {v.volunteer_count ?? <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {v.children_engaged ?? <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-300">
                    {v.duration_hours != null ? (
                      `${v.duration_hours}h`
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {v.activities?.slice(0, 3).map((a) => (
                        <Badge
                          key={a}
                          variant="secondary"
                          className="bg-zinc-800 text-xs text-zinc-300"
                        >
                          {a}
                        </Badge>
                      ))}
                      {(v.activities?.length ?? 0) > 3 && (
                        <Badge variant="secondary" className="bg-zinc-800 text-xs text-zinc-500">
                          +{v.activities.length - 3}
                        </Badge>
                      )}
                      {(!v.activities || v.activities.length === 0) && (
                        <span className="text-zinc-600">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Prev
          </Button>
          <span className="text-xs text-zinc-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
