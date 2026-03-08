'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Orphanage } from '@/lib/types'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet's default icon paths when bundled with webpack/Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

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

interface DirectoryMapProps {
  orphanages: MapOrphanage[]
}

const LAHORE_CENTER: [number, number] = [31.5204, 74.3587]

export default function DirectoryMap({ orphanages }: DirectoryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  const pinnable = orphanages.filter(
    (o): o is MapOrphanage & { latitude: number; longitude: number } =>
      o.latitude != null && o.longitude != null
  )

  useEffect(() => {
    const el = containerRef.current
    // Guard: skip if already initialised — React 18 Strict Mode runs effects twice
    if (!el || mapRef.current) return

    const map = L.map(el, { center: LAHORE_CENTER, zoom: 12, scrollWheelZoom: true })
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    pinnable.forEach((o) => {
      const badges = [
        o.uraan_visited
          ? `<span style="display:inline-block;margin:2px;padding:1px 6px;border-radius:4px;background:#ffedd5;font-size:10px;font-weight:600;color:#c2410c">Uraan Visited (${o.visit_count}×)</span>`
          : '',
        o.children_count != null
          ? `<span style="display:inline-block;margin:2px;padding:1px 6px;border-radius:4px;background:#f4f4f5;font-size:10px;color:#52525b">${o.children_count} children</span>`
          : '',
      ]
        .filter(Boolean)
        .join('')

      L.circleMarker([o.latitude, o.longitude], {
        color: o.uraan_visited ? '#E8620A' : '#71717a',
        fillColor: o.uraan_visited ? '#E8620A' : 'transparent',
        fillOpacity: o.uraan_visited ? 0.85 : 0,
        weight: o.uraan_visited ? 2 : 1.5,
        radius: o.uraan_visited ? 10 : 8,
      })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:160px">` +
            `<p style="font-weight:600;color:#18181b;margin:0 0 2px">${o.name}</p>` +
            `<p style="font-size:12px;color:#71717a;margin:0 0 4px">${o.area}</p>` +
            `<div style="display:flex;flex-wrap:wrap;gap:2px;margin-bottom:4px">${badges}</div>` +
            `<a href="/directory/${o.slug}" style="display:block;font-size:12px;font-weight:500;color:#ea580c;text-decoration:none">View Profile →</a>` +
            `</div>`
        )
    })

    // Invalidate size when the container becomes visible (switching from grid → map view)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) map.invalidateSize()
      },
      { threshold: 0 }
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      map.remove()
      mapRef.current = null
    }
    // Intentionally [] — initialise once on mount; orphanage data is from SSR and
    // does not change during the component's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-xl border border-zinc-200">
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 shadow-md">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Legend</p>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: '#E8620A', border: '2px solid #E8620A' }}
          />
          <span className="text-xs text-zinc-600">Uraan Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full border-2"
            style={{ borderColor: '#71717a', background: 'transparent' }}
          />
          <span className="text-xs text-zinc-600">Not Yet Visited</span>
        </div>
        <p className="mt-1 text-[10px] text-zinc-400">
          {pinnable.length} of {orphanages.length} mapped
        </p>
      </div>
    </div>
  )
}
