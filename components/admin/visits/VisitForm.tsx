'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import type { Orphanage, Project } from '@/lib/types'

interface VisitFormProps {
  orphanages: Pick<Orphanage, 'id' | 'name' | 'area'>[]
  projects: Pick<Project, 'id' | 'title'>[]
  onSuccess: () => void
}

interface Fields {
  orphanage_id: string
  project_id: string
  visit_date: string
  duration_hours: string
  volunteer_count: string
  children_engaged: string
  lead_volunteer: string
  notes: string
  activities: string[]
  outcomes: string[]
}

const DEFAULT_FIELDS: Fields = {
  orphanage_id: '',
  project_id: '',
  visit_date: new Date().toISOString().slice(0, 10),
  duration_hours: '',
  volunteer_count: '',
  children_engaged: '',
  lead_volunteer: '',
  notes: '',
  activities: [],
  outcomes: [],
}

// ── Tag Input ─────────────────────────────────────────────────────────────

function TagInput({
  label,
  tags,
  onChange,
  placeholder,
}: {
  label: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder: string
}) {
  const [inputValue, setInputValue] = useState('')

  const addTag = useCallback(() => {
    const trimmed = inputValue.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInputValue('')
  }, [inputValue, tags, onChange])

  const removeTag = useCallback(
    (tag: string) => {
      onChange(tags.filter((t) => t !== tag))
    },
    [tags, onChange]
  )

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
          className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addTag}
          disabled={!inputValue.trim()}
          className="shrink-0 border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-full hover:text-white"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Searchable Orphanage Dropdown ─────────────────────────────────────────

function OrphanageSelect({
  orphanages,
  value,
  onChange,
}: {
  orphanages: Pick<Orphanage, 'id' | 'name' | 'area'>[]
  value: string
  onChange: (v: string) => void
}) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = orphanages.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.area.toLowerCase().includes(search.toLowerCase())
  )

  const selected = orphanages.find((o) => o.id === value)

  return (
    <div className="relative">
      <Label>
        Orphanage <span className="text-red-400">*</span>
      </Label>
      <div
        className="mt-1 flex min-h-10 cursor-pointer items-center justify-between rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v)
        }}
        tabIndex={0}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {selected ? (
          <span>
            {selected.name} <span className="text-zinc-400">({selected.area})</span>
          </span>
        ) : (
          <span className="text-zinc-500">Search orphanage…</span>
        )}
        <span className="text-zinc-400">▾</span>
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 shadow-xl">
          <div className="p-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or area…"
              className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <ul role="listbox" className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-zinc-500">No results</li>
            )}
            {filtered.map((o) => (
              <li
                key={o.id}
                role="option"
                aria-selected={o.id === value}
                className={`cursor-pointer px-4 py-2 text-sm hover:bg-zinc-800 ${o.id === value ? 'bg-zinc-800 text-[#E8620A]' : 'text-zinc-200'}`}
                onClick={() => {
                  onChange(o.id)
                  setOpen(false)
                  setSearch('')
                }}
              >
                {o.name} <span className="text-zinc-500">— {o.area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Main Form ─────────────────────────────────────────────────────────────

export default function VisitForm({ orphanages, projects, onSuccess }: VisitFormProps) {
  const [fields, setFields] = useState<Fields>(DEFAULT_FIELDS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
    setError(null)
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!fields.orphanage_id) {
      setError('Please select an orphanage.')
      setLoading(false)
      return
    }

    const payload = {
      orphanage_id: fields.orphanage_id,
      project_id: fields.project_id || null,
      visit_date: fields.visit_date,
      duration_hours: fields.duration_hours ? parseFloat(fields.duration_hours) : null,
      volunteer_count: fields.volunteer_count ? parseInt(fields.volunteer_count, 10) : null,
      children_engaged: fields.children_engaged ? parseInt(fields.children_engaged, 10) : null,
      lead_volunteer: fields.lead_volunteer || null,
      notes: fields.notes || null,
      activities: fields.activities,
      outcomes: fields.outcomes,
    }

    try {
      const res = await fetch('/api/v1/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await res.json()) as { error?: string; details?: unknown }

      if (!res.ok) {
        setError(json.error ?? 'Failed to log visit.')
      } else {
        setSuccess(true)
        setFields({ ...DEFAULT_FIELDS, visit_date: new Date().toISOString().slice(0, 10) })
        onSuccess()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-zinc-800 bg-zinc-900 p-6"
    >
      <h3 className="text-base font-semibold text-white">Log New Visit</h3>

      {/* Orphanage + Project */}
      <div className="grid gap-4 sm:grid-cols-2">
        <OrphanageSelect
          orphanages={orphanages}
          value={fields.orphanage_id}
          onChange={(v) => set('orphanage_id', v)}
        />

        <div className="space-y-1">
          <Label htmlFor="project_id">Project (optional)</Label>
          <select
            id="project_id"
            value={fields.project_id}
            onChange={(e) => set('project_id', e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E8620A]"
          >
            <option value="">— No project —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visit Date + Duration + Volunteer Count + Children */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="visit_date">
            Visit Date <span className="text-red-400">*</span>
          </Label>
          <Input
            id="visit_date"
            type="date"
            required
            value={fields.visit_date}
            onChange={(e) => set('visit_date', e.target.value)}
            className="border-zinc-700 bg-zinc-800 text-white"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="duration_hours">Duration (hours)</Label>
          <Input
            id="duration_hours"
            type="number"
            min="0.5"
            step="0.5"
            placeholder="2.5"
            value={fields.duration_hours}
            onChange={(e) => set('duration_hours', e.target.value)}
            className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="volunteer_count">Volunteers</Label>
          <Input
            id="volunteer_count"
            type="number"
            min="0"
            placeholder="12"
            value={fields.volunteer_count}
            onChange={(e) => set('volunteer_count', e.target.value)}
            className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="children_engaged">Children Engaged</Label>
          <Input
            id="children_engaged"
            type="number"
            min="0"
            placeholder="35"
            value={fields.children_engaged}
            onChange={(e) => set('children_engaged', e.target.value)}
            className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Lead Volunteer */}
      <div className="space-y-1">
        <Label htmlFor="lead_volunteer">Lead Volunteer</Label>
        <Input
          id="lead_volunteer"
          placeholder="Name of lead volunteer"
          value={fields.lead_volunteer}
          onChange={(e) => set('lead_volunteer', e.target.value)}
          className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
        />
      </div>

      {/* Activities + Outcomes */}
      <div className="grid gap-6 sm:grid-cols-2">
        <TagInput
          label="Activities"
          tags={fields.activities}
          onChange={(v) => set('activities', v)}
          placeholder="e.g. Coding, Art Therapy"
        />
        <TagInput
          label="Outcomes"
          tags={fields.outcomes}
          onChange={(v) => set('outcomes', v)}
          placeholder="e.g. Skill Development"
        />
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional observations or context…"
          value={fields.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={3}
          className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
        />
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Visit logged successfully. Orphanage stats updated.
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E8620A] text-white hover:bg-[#cb5309] sm:w-auto"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Saving…' : 'Log Visit'}
      </Button>
    </form>
  )
}
