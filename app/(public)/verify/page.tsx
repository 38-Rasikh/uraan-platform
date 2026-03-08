'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Heart,
} from 'lucide-react'

interface VerifyResult {
  id: string
  name: string
  slug: string
  area: string
  org_type: string
  is_registered: boolean
  registration_number: string | null
  registration_body: string | null
  uraan_visited: boolean
  visit_count: number
  is_verified: boolean
  verified_by: string | null
  verified_at: string | null
  accepts_donations: boolean
  accepts_volunteers: boolean
}

const ORG_TYPE_LABELS: Record<string, string> = {
  government: 'Government',
  ngo: 'NGO',
  volunteer: 'Volunteer',
  religious: 'Religious',
  other: 'Other',
}

export default function VerifyPage() {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<VerifyResult[] | null>(null)
  const [searched, setSearched] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(async () => {
    const q = query.trim()
    if (q.length < 2) return

    setSearching(true)
    setError(null)
    setResults(null)

    try {
      const res = await fetch(`/api/v1/verify?q=${encodeURIComponent(q)}`)
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Search failed')
        return
      }
      const json = await res.json()
      setResults(json.data ?? [])
      setSearched(q)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSearching(false)
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="mx-auto max-w-container px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-[--color-text-primary]">Verify an Orphanage</h1>
        <p className="mt-4 max-w-2xl text-lg text-[--color-text-secondary]">
          Search by organisation name or registration number to check verification status and Uraan
          partnership history before donating independently.
        </p>
      </div>

      {/* Search */}
      <div className="mb-10 flex max-w-xl gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--color-text-muted]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Name or registration number…"
            className="pl-9"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={searching || query.trim().length < 2}
          className="bg-[--color-accent] text-white hover:bg-orange-700"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      {/* Error */}
      {error && <p className="mb-6 text-sm text-red-600">{error}</p>}

      {/* Results */}
      {results !== null && (
        <div>
          <p className="mb-4 text-sm text-[--color-text-muted]">
            {results.length === 0
              ? `No results found for "${searched}"`
              : `${results.length} result${results.length !== 1 ? 's' : ''} for "${searched}"`}
          </p>

          <div className="space-y-4">
            {results.map((org) => (
              <VerifyCard key={org.id} org={org} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state hint */}
      {results === null && !searching && (
        <div className="rounded-xl border border-dashed border-[--color-border] py-16 text-center">
          <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-[--color-text-muted]" />
          <p className="text-[--color-text-muted]">
            Enter a name or registration number above to verify an organisation.
          </p>
        </div>
      )}
    </div>
  )
}

function VerifyCard({ org }: { org: VerifyResult }) {
  const statusLabel = org.is_verified
    ? 'Uraan Verified'
    : org.uraan_visited
      ? 'Uraan Visited (Unverified)'
      : 'Not Connected to Uraan'

  return (
    <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-6 shadow-sm">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/directory/${org.slug}`}
            className="text-lg font-semibold text-[--color-text-primary] transition-colors hover:text-[--color-accent]"
          >
            {org.name}
          </Link>
          <p className="text-sm text-[--color-text-muted]">
            {org.area} · {ORG_TYPE_LABELS[org.org_type] ?? org.org_type}
          </p>
        </div>

        {/* Verification badge */}
        {org.is_verified ? (
          <Badge className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            {statusLabel}
          </Badge>
        ) : org.uraan_visited ? (
          <Badge className="flex items-center gap-1.5 bg-[--color-accent-muted] text-[--color-accent]">
            <Building2 className="h-3.5 w-3.5" />
            {statusLabel}
          </Badge>
        ) : (
          <Badge variant="secondary" className="flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" />
            {statusLabel}
          </Badge>
        )}
      </div>

      {/* Detail grid */}
      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
        {/* Registration */}
        <div className="flex items-center gap-2 text-sm">
          {org.is_registered ? (
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          ) : (
            <XCircle className="h-4 w-4 text-zinc-400" />
          )}
          <span className="text-[--color-text-secondary]">
            {org.is_registered ? 'Registered' : 'Not registered'}
            {org.registration_number && (
              <span className="ml-1 font-mono text-xs text-[--color-text-muted]">
                ({org.registration_number})
              </span>
            )}
          </span>
        </div>

        {org.registration_body && (
          <div className="flex items-center gap-2 text-sm text-[--color-text-secondary]">
            <Building2 className="h-4 w-4 text-zinc-400" />
            {org.registration_body}
          </div>
        )}

        {/* Uraan relationship */}
        <div className="flex items-center gap-2 text-sm text-[--color-text-secondary]">
          <CheckCircle className="h-4 w-4 text-[--color-accent]" />
          {org.uraan_visited
            ? `Visited ${org.visit_count} time${org.visit_count !== 1 ? 's' : ''} by Uraan`
            : 'Not yet visited by Uraan'}
        </div>

        {org.accepts_donations && (
          <div className="flex items-center gap-2 text-sm text-[--color-text-secondary]">
            <Heart className="h-4 w-4 text-rose-400" />
            Accepts donations
          </div>
        )}

        {org.verified_by && (
          <div className="text-xs text-[--color-text-muted]">
            Verified by {org.verified_by}
            {org.verified_at &&
              ` on ${new Date(org.verified_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}`}
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link
          href={`/directory/${org.slug}`}
          className="text-sm font-medium text-[--color-accent] hover:underline"
        >
          View full profile →
        </Link>
      </div>
    </div>
  )
}
