'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Pencil, Trash2, Search, ChevronUp, ChevronDown, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import OrphanageDrawer from './OrphanageDrawer'
import DeleteOrphanageDialog from './DeleteOrphanageDialog'
import type { Orphanage } from '@/lib/types'

interface OrphanagesManagerProps {
  orphanages: Orphanage[]
  total: number
  page: number
  limit: number
  search: string
  sort: string
  order: string
  area: string
  orgType: string
  isRegistered: string
  uraanVisited: string
}

const ORG_TYPE_COLORS: Record<string, string> = {
  government: 'bg-blue-900/40 text-blue-300 border-blue-800',
  ngo: 'bg-green-900/40 text-green-300 border-green-800',
  volunteer: 'bg-purple-900/40 text-purple-300 border-purple-800',
  religious: 'bg-yellow-900/40 text-yellow-300 border-yellow-800',
  other: 'bg-zinc-800 text-zinc-300 border-zinc-700',
}

const LAHORE_AREAS = [
  'Baghbanpura',
  'DHA',
  'Faisal Town',
  'Garhi Shahu',
  'Gulberg',
  'Iqbal Town',
  'Johar Town',
  'Lahore Cantt',
  'Model Town',
  'Mughal Pura',
  'Muslim Town',
  'Outline Town',
  'Samanabad',
  'Shadman',
  'Shalimar',
  'Township',
  'Wahdat Colony',
]

const SELECT_CLS =
  'h-8 rounded-md border border-zinc-700 bg-zinc-800 px-2 text-sm text-zinc-300 outline-none focus:ring-1 focus:ring-[#E8620A]'

function SortIcon({ field, sort, order }: { field: string; sort: string; order: string }) {
  if (sort !== field) return <span className="ml-1 opacity-30">↕</span>
  return order === 'asc' ? (
    <ChevronUp className="ml-1 inline h-3.5 w-3.5 text-[#E8620A]" />
  ) : (
    <ChevronDown className="ml-1 inline h-3.5 w-3.5 text-[#E8620A]" />
  )
}

export default function OrphanagesManager({
  // ↓ Use props directly — no useState wrapper. Stale-state bug fix.
  orphanages,
  total,
  page,
  limit,
  search: initialSearch,
  sort,
  order,
  area,
  orgType,
  isRegistered,
  uraanVisited,
}: OrphanagesManagerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Only the search input field needs local state (controlled input before submit)
  const [search, setSearch] = useState(initialSearch)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Orphanage | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Orphanage | null>(null)

  const totalPages = Math.ceil(total / limit)

  const buildUrl = useCallback(
    (overrides: Record<string, string | number>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(overrides)) {
        if (v === '') {
          params.delete(k)
        } else {
          params.set(k, String(v))
        }
      }
      return `/admin/orphanages?${params.toString()}`
    },
    [searchParams]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(buildUrl({ search, page: 1 }))
  }

  const handleSort = (field: string) => {
    const newOrder = sort === field && order === 'asc' ? 'desc' : 'asc'
    router.push(buildUrl({ sort: field, order: newOrder, page: 1 }))
  }

  const handleFilter = (key: string, value: string) => {
    router.push(buildUrl({ [key]: value, page: 1 }))
  }

  const clearFilters = () => {
    setSearch('')
    router.push('/admin/orphanages')
  }

  // After create/edit/delete, tell Next.js to re-run the server component
  const refreshData = () => {
    router.refresh()
  }

  const handleOpenAdd = () => {
    setEditTarget(null)
    setDrawerOpen(true)
  }

  const handleOpenEdit = (o: Orphanage) => {
    setEditTarget(o)
    setDrawerOpen(true)
  }

  const handleOpenDelete = (o: Orphanage) => {
    setDeleteTarget(o)
  }

  const hasFilters = area || orgType || isRegistered || uraanVisited || initialSearch

  return (
    <div className="space-y-4">
      {/* ── Row 1: Search + Add button ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, area, address…"
              className="w-64 border-zinc-700 bg-zinc-800 pl-9 text-white placeholder:text-zinc-500"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Search
          </Button>
        </form>

        <Button
          onClick={handleOpenAdd}
          className="gap-2 bg-[#E8620A] text-white hover:bg-[#d05509]"
        >
          <Plus className="h-4 w-4" />
          Add Orphanage
        </Button>
      </div>

      {/* ── Row 2: Dropdown filters ── */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={area}
          onChange={(e) => handleFilter('area', e.target.value)}
          className={SELECT_CLS}
        >
          <option value="">All Areas</option>
          {LAHORE_AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          value={orgType}
          onChange={(e) => handleFilter('org_type', e.target.value)}
          className={SELECT_CLS}
        >
          <option value="">All Types</option>
          <option value="government">Government</option>
          <option value="ngo">NGO</option>
          <option value="volunteer">Volunteer</option>
          <option value="religious">Religious</option>
          <option value="other">Other</option>
        </select>

        <select
          value={isRegistered}
          onChange={(e) => handleFilter('is_registered', e.target.value)}
          className={SELECT_CLS}
        >
          <option value="">Reg. Status</option>
          <option value="true">Registered</option>
          <option value="false">Unregistered</option>
        </select>

        <select
          value={uraanVisited}
          onChange={(e) => handleFilter('uraan_visited', e.target.value)}
          className={SELECT_CLS}
        >
          <option value="">Visit Status</option>
          <option value="true">Visited</option>
          <option value="false">Not Visited</option>
        </select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 gap-1 text-zinc-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}

        <span className="ml-auto text-xs text-zinc-500">
          {total} result{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-md border border-zinc-700">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800/60">
              <TableHead
                className="cursor-pointer select-none font-medium text-zinc-400 hover:text-white"
                onClick={() => handleSort('name')}
              >
                Name <SortIcon field="name" sort={sort} order={order} />
              </TableHead>
              <TableHead className="font-medium text-zinc-400">Area</TableHead>
              <TableHead className="font-medium text-zinc-400">Type</TableHead>
              <TableHead
                className="cursor-pointer select-none font-medium text-zinc-400 hover:text-white"
                onClick={() => handleSort('children_count')}
              >
                Children <SortIcon field="children_count" sort={sort} order={order} />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none font-medium text-zinc-400 hover:text-white"
                onClick={() => handleSort('visit_count')}
              >
                Visits <SortIcon field="visit_count" sort={sort} order={order} />
              </TableHead>
              <TableHead className="font-medium text-zinc-400">Status</TableHead>
              <TableHead className="text-right font-medium text-zinc-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orphanages.length === 0 ? (
              <TableRow className="border-zinc-700">
                <TableCell colSpan={7} className="py-12 text-center text-zinc-500">
                  No orphanages found.
                </TableCell>
              </TableRow>
            ) : (
              orphanages.map((o) => (
                <TableRow key={o.id} className="border-zinc-700 hover:bg-zinc-800/40">
                  <TableCell className="font-medium text-white">
                    <div>{o.name}</div>
                    {o.is_verified && <span className="text-xs text-green-400">✓ Verified</span>}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-300">{o.area}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${ORG_TYPE_COLORS[o.org_type] ?? ORG_TYPE_COLORS['other']}`}
                    >
                      {o.org_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-zinc-300">
                    {o.children_count ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-zinc-300">
                    {o.visit_count}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {o.uraan_visited && (
                        <Badge className="border border-[#E8620A]/40 bg-[#E8620A]/20 text-xs text-[#E8620A]">
                          Visited
                        </Badge>
                      )}
                      {o.is_registered && (
                        <Badge className="border border-green-800 bg-green-900/30 text-xs text-green-400">
                          Registered
                        </Badge>
                      )}
                      {o.accepts_donations && (
                        <Badge className="border-zinc-700 bg-zinc-800 text-xs text-zinc-400">
                          Donations
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(o)}
                        className="h-8 w-8 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDelete(o)}
                        className="h-8 w-8 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => router.push(buildUrl({ page: page - 1 }))}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => router.push(buildUrl({ page: page + 1 }))}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ── Drawers / Dialogs ── */}
      <OrphanageDrawer
        open={drawerOpen}
        orphanage={editTarget}
        onClose={() => setDrawerOpen(false)}
        onSaved={refreshData}
      />

      {deleteTarget && (
        <DeleteOrphanageDialog
          open={!!deleteTarget}
          orphanageName={deleteTarget.name}
          orphanageId={deleteTarget.id}
          onClose={() => setDeleteTarget(null)}
          onDeleted={refreshData}
        />
      )}
    </div>
  )
}
