'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { LayoutGrid, Map } from 'lucide-react'
import OrphanageCard from './OrphanageCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Orphanage } from '@/lib/types'

// Dynamically import the map so Leaflet's browser-only code never runs on the server
const DirectoryMap = dynamic(() => import('./DirectoryMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
      <p className="text-sm text-zinc-500">Loading map…</p>
    </div>
  ),
})

type CardOrphanage = Pick<
  Orphanage,
  | 'id'
  | 'name'
  | 'slug'
  | 'area'
  | 'address'
  | 'org_type'
  | 'is_registered'
  | 'children_count'
  | 'uraan_visited'
  | 'visit_count'
  | 'last_visited_at'
  | 'accepts_donations'
  | 'accepts_volunteers'
  | 'is_verified'
  | 'cover_image_url'
>

type MapOrphanage = Pick<
  Orphanage,
  | 'id'
  | 'name'
  | 'slug'
  | 'area'
  | 'latitude'
  | 'longitude'
  | 'uraan_visited'
  | 'visit_count'
  | 'children_count'
  | 'org_type'
>

interface DirectoryViewToggleProps {
  orphanages: CardOrphanage[]
  mapOrphanages: MapOrphanage[]
  total: number
  page: number
  totalPages: number
  prevHref: string | null
  nextHref: string | null
}

export default function DirectoryViewToggle({
  orphanages,
  mapOrphanages,
  total,
  page,
  totalPages,
  prevHref,
  nextHref,
}: DirectoryViewToggleProps) {
  const [view, setView] = useState<'grid' | 'map'>('grid')

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[--color-text-secondary]">
          {view === 'grid'
            ? `Showing ${orphanages.length} of ${total}`
            : `${mapOrphanages.length} mapped (${total} total)`}
        </span>
        <div className="flex gap-1 rounded-md border border-zinc-200 p-0.5">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              view === 'grid' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
            aria-pressed={view === 'grid'}
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setView('map')}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              view === 'map' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
            aria-pressed={view === 'map'}
          >
            <Map className="h-4 w-4" />
            Map
          </button>
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <>
          {orphanages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="mb-4 text-5xl">🔍</span>
              <h3 className="mb-2 text-xl font-semibold text-[--color-text-primary]">
                No orphanages found
              </h3>
              <p className="mb-6 text-[--color-text-secondary]">
                Try adjusting your search or filters.
              </p>
              <Link href="/directory">
                <Button variant="outline">Clear all filters</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {orphanages.map((orphanage) => (
                  <OrphanageCard key={orphanage.id} orphanage={orphanage as Orphanage} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-between text-sm text-[--color-text-secondary]">
                  <span>
                    Page {page} of {totalPages} ({total} total)
                  </span>
                  <div className="flex gap-3">
                    {prevHref && (
                      <Link href={prevHref}>
                        <Button variant="outline" size="sm">
                          Previous
                        </Button>
                      </Link>
                    )}
                    {nextHref && (
                      <Link href={nextHref}>
                        <Button variant="outline" size="sm">
                          Next
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Map view — always mounted so Leaflet never re-initializes on the same container */}
      <div className={view !== 'map' ? 'hidden' : undefined}>
        <DirectoryMap orphanages={mapOrphanages} />
      </div>
    </div>
  )
}
