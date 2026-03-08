'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

const ORG_TYPES = [
  { value: 'government', label: 'Government' },
  { value: 'ngo', label: 'NGO' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'religious', label: 'Religious' },
  { value: 'other', label: 'Other' },
] as const

// Common Lahore localities
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

interface DirectoryFiltersProps {
  search: string
  areas: string[]
  orgTypes: string[]
  isRegistered: string
  uraanVisited: string
  acceptsDonations: string
  acceptsVolunteers: string
}

export default function DirectoryFilters({
  search: initialSearch,
  areas: selectedAreas,
  orgTypes: selectedOrgTypes,
  isRegistered,
  uraanVisited,
  acceptsDonations,
  acceptsVolunteers,
}: DirectoryFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const buildUrl = useCallback(
    (overrides: Record<string, string | string[]>) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', '1')
      for (const [k, v] of Object.entries(overrides)) {
        params.delete(k)
        if (Array.isArray(v)) {
          v.forEach((item) => params.append(k, item))
        } else if (v !== '') {
          params.set(k, v)
        }
      }
      return `${pathname}?${params.toString()}`
    },
    [pathname, searchParams]
  )

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const q = (fd.get('search') as string) ?? ''
    router.push(buildUrl({ search: q }))
  }

  const toggleArea = (area: string) => {
    const next = selectedAreas.includes(area)
      ? selectedAreas.filter((a) => a !== area)
      : [...selectedAreas, area]
    router.push(buildUrl({ area: next }))
  }

  const toggleOrgType = (type: string) => {
    const next = selectedOrgTypes.includes(type)
      ? selectedOrgTypes.filter((t) => t !== type)
      : [...selectedOrgTypes, type]
    router.push(buildUrl({ org_type: next }))
  }

  const toggleBoolean = (key: string, current: string) => {
    const next = current === 'true' ? '' : 'true'
    router.push(buildUrl({ [key]: next }))
  }

  const hasActiveFilters =
    initialSearch ||
    selectedAreas.length > 0 ||
    selectedOrgTypes.length > 0 ||
    isRegistered ||
    uraanVisited ||
    acceptsDonations ||
    acceptsVolunteers

  const clearAll = () => {
    router.push(pathname)
  }

  return (
    <aside className="w-full space-y-6">
      {/* ── Search ── */}
      <form onSubmit={handleSearchSubmit} className="space-y-2">
        <Label className="text-sm font-semibold text-[--color-text-primary]">Search</Label>
        <div className="flex gap-2">
          <Input
            name="search"
            defaultValue={initialSearch}
            placeholder="Name, area, address…"
            className="flex-1"
          />
          <Button type="submit" size="sm" variant="outline">
            Go
          </Button>
        </div>
      </form>

      <Separator />

      {/* ── Area ── */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-[--color-text-primary]">Area</Label>
        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {LAHORE_AREAS.map((area) => (
            <div key={area} className="flex items-center gap-2">
              <Checkbox
                id={`area-${area}`}
                checked={selectedAreas.includes(area)}
                onCheckedChange={() => toggleArea(area)}
              />
              <label
                htmlFor={`area-${area}`}
                className="cursor-pointer text-sm leading-none text-[--color-text-secondary]"
              >
                {area}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* ── Organisation Type ── */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-[--color-text-primary]">
          Organisation Type
        </Label>
        <div className="space-y-2">
          {ORG_TYPES.map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2">
              <Checkbox
                id={`org-${value}`}
                checked={selectedOrgTypes.includes(value)}
                onCheckedChange={() => toggleOrgType(value)}
              />
              <label
                htmlFor={`org-${value}`}
                className="cursor-pointer text-sm leading-none text-[--color-text-secondary]"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* ── Boolean Filters ── */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-[--color-text-primary]">Filters</Label>
        <div className="space-y-2">
          {[
            { key: 'is_registered', label: 'Registered only', current: isRegistered },
            { key: 'uraan_visited', label: 'Uraan Visited only', current: uraanVisited },
            { key: 'accepts_donations', label: 'Accepts donations', current: acceptsDonations },
            { key: 'accepts_volunteers', label: 'Accepts volunteers', current: acceptsVolunteers },
          ].map(({ key, label, current }) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={`filter-${key}`}
                checked={current === 'true'}
                onCheckedChange={() => toggleBoolean(key, current)}
              />
              <label
                htmlFor={`filter-${key}`}
                className="cursor-pointer text-sm leading-none text-[--color-text-secondary]"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* ── Clear Filters ── */}
      {hasActiveFilters && (
        <>
          <Separator />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="w-full gap-2 text-[--color-text-muted] hover:text-[--color-text-primary]"
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        </>
      )}
    </aside>
  )
}
