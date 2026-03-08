'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { X, Loader2 } from 'lucide-react'
import { generateSlug } from '@/lib/utils'
import type { Project } from '@/lib/types'

interface ProjectDrawerProps {
  open: boolean
  project?: Project | null
  onClose: () => void
  onSaved: () => void
}

const FIELD_DEFAULTS = {
  title: '',
  slug: '',
  tagline: '',
  description: '',
  date_start: '',
  date_end: '',
  duration_label: '',
  cover_image_url: '',
  children_reached: '',
  volunteer_count: '',
  hours_delivered: '',
  is_published: false,
  sort_order: '0',
  institutions: [] as string[],
  collaborators: [] as string[],
  skills_taught: [] as string[],
  gallery_urls: [] as string[],
}

type FieldState = typeof FIELD_DEFAULTS

function projectToFields(p: Project): FieldState {
  return {
    title: p.title,
    slug: p.slug,
    tagline: p.tagline ?? '',
    description: p.description,
    date_start: p.date_start,
    date_end: p.date_end ?? '',
    duration_label: p.duration_label ?? '',
    cover_image_url: p.cover_image_url ?? '',
    children_reached: p.children_reached?.toString() ?? '',
    volunteer_count: p.volunteer_count?.toString() ?? '',
    hours_delivered: p.hours_delivered?.toString() ?? '',
    is_published: p.is_published,
    sort_order: p.sort_order.toString(),
    institutions: p.institutions ?? [],
    collaborators: p.collaborators ?? [],
    skills_taught: p.skills_taught ?? [],
    gallery_urls: p.gallery_urls ?? [],
  }
}

function fieldsToPayload(f: FieldState) {
  return {
    title: f.title,
    slug: f.slug,
    tagline: f.tagline || null,
    description: f.description,
    date_start: f.date_start || null,
    date_end: f.date_end || null,
    duration_label: f.duration_label || null,
    cover_image_url: f.cover_image_url || null,
    children_reached: f.children_reached ? parseInt(f.children_reached, 10) : null,
    volunteer_count: f.volunteer_count ? parseInt(f.volunteer_count, 10) : null,
    hours_delivered: f.hours_delivered ? parseFloat(f.hours_delivered) : null,
    is_published: f.is_published,
    sort_order: parseInt(f.sort_order, 10) || 0,
    institutions: f.institutions,
    collaborators: f.collaborators,
    skills_taught: f.skills_taught,
    gallery_urls: f.gallery_urls,
  }
}

// ── Tag Array Input ────────────────────────────────────────────────────────

function ArrayTagInput({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
}) {
  const [inputValue, setInputValue] = useState('')

  const add = useCallback(() => {
    const trimmed = inputValue.trim()
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed])
    }
    setInputValue('')
  }, [inputValue, items, onChange])

  const remove = (item: string) => onChange(items.filter((i) => i !== item))

  return (
    <div className="space-y-1.5">
      <Label className="text-zinc-300">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
          className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        >
          Add
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {items.map((item) => (
            <Badge
              key={item}
              className="flex items-center gap-1 bg-zinc-700 text-zinc-200 hover:bg-zinc-700"
            >
              {item}
              <button type="button" onClick={() => remove(item)} className="ml-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Drawer Component ──────────────────────────────────────────────────────

export default function ProjectDrawer({ open, project, onClose, onSaved }: ProjectDrawerProps) {
  const isEdit = !!project
  const [fields, setFields] = useState<FieldState>(
    project ? projectToFields(project) : FIELD_DEFAULTS
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setFields(project ? projectToFields(project) : FIELD_DEFAULTS)
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project?.id])

  const set = (key: keyof FieldState, value: string | boolean | string[]) => {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  // Auto-generate slug when title changes (create mode only)
  const handleTitleChange = (title: string) => {
    setFields((prev) => ({
      ...prev,
      title,
      slug: isEdit ? prev.slug : generateSlug(title),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = fieldsToPayload(fields)
    const url = isEdit ? `/api/v1/projects/${project!.id}` : '/api/v1/projects'
    const method = isEdit ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Something went wrong')
        return
      }

      onSaved()
      onClose()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <SheetContent side="right" className="w-full max-w-lg overflow-y-auto bg-zinc-900 text-white">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-white">
            {isEdit ? 'Edit Project' : 'Add New Project'}
          </SheetTitle>
          <SheetDescription className="text-zinc-400">
            {isEdit ? `Editing: ${project!.title}` : 'Fill in the details to add a project.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pb-8">
          {/* ── Core Info ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Project Info
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="proj-title" className="text-zinc-300">
                Title *
              </Label>
              <Input
                id="proj-title"
                value={fields.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                placeholder="Uraan Outreach 2025"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="proj-slug" className="text-zinc-300">
                Slug *
              </Label>
              <Input
                id="proj-slug"
                value={fields.slug}
                onChange={(e) =>
                  set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                }
                required
                placeholder="uraan-outreach-2025"
                className="border-zinc-700 bg-zinc-800 font-mono text-sm text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="proj-tagline" className="text-zinc-300">
                Tagline
              </Label>
              <Input
                id="proj-tagline"
                value={fields.tagline}
                onChange={(e) => set('tagline', e.target.value)}
                placeholder="Short descriptive tagline"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="proj-description" className="text-zinc-300">
                Description *
              </Label>
              <Textarea
                id="proj-description"
                value={fields.description}
                onChange={(e) => set('description', e.target.value)}
                required
                rows={4}
                placeholder="Full project description..."
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>

          <Separator className="border-zinc-700" />

          {/* ── Dates ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Dates</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="proj-date-start" className="text-zinc-300">
                  Start Date *
                </Label>
                <Input
                  id="proj-date-start"
                  type="date"
                  value={fields.date_start}
                  onChange={(e) => set('date_start', e.target.value)}
                  required
                  className="border-zinc-700 bg-zinc-800 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proj-date-end" className="text-zinc-300">
                  End Date
                </Label>
                <Input
                  id="proj-date-end"
                  type="date"
                  value={fields.date_end}
                  onChange={(e) => set('date_end', e.target.value)}
                  className="border-zinc-700 bg-zinc-800 text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="proj-duration" className="text-zinc-300">
                Duration Label
              </Label>
              <Input
                id="proj-duration"
                value={fields.duration_label}
                onChange={(e) => set('duration_label', e.target.value)}
                placeholder="e.g. 2 Months"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>

          <Separator className="border-zinc-700" />

          {/* ── Impact Stats ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Impact Stats
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="proj-children" className="text-zinc-300">
                  Children Reached
                </Label>
                <Input
                  id="proj-children"
                  type="number"
                  min={0}
                  value={fields.children_reached}
                  onChange={(e) => set('children_reached', e.target.value)}
                  placeholder="0"
                  className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proj-volunteers" className="text-zinc-300">
                  Volunteers
                </Label>
                <Input
                  id="proj-volunteers"
                  type="number"
                  min={0}
                  value={fields.volunteer_count}
                  onChange={(e) => set('volunteer_count', e.target.value)}
                  placeholder="0"
                  className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proj-hours" className="text-zinc-300">
                  Hours Delivered
                </Label>
                <Input
                  id="proj-hours"
                  type="number"
                  min={0}
                  step={0.5}
                  value={fields.hours_delivered}
                  onChange={(e) => set('hours_delivered', e.target.value)}
                  placeholder="0"
                  className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>

          <Separator className="border-zinc-700" />

          {/* ── Arrays ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Institutions &amp; Skills
            </h3>

            <ArrayTagInput
              label="Institutions Covered"
              items={fields.institutions}
              onChange={(v) => set('institutions', v)}
              placeholder="Enter institution name"
            />

            <ArrayTagInput
              label="Collaborators"
              items={fields.collaborators}
              onChange={(v) => set('collaborators', v)}
              placeholder="Enter collaborator name"
            />

            <ArrayTagInput
              label="Skills Taught"
              items={fields.skills_taught}
              onChange={(v) => set('skills_taught', v)}
              placeholder="e.g. Coding, Art Therapy"
            />

            <ArrayTagInput
              label="Gallery Image URLs"
              items={fields.gallery_urls}
              onChange={(v) => set('gallery_urls', v)}
              placeholder="https://..."
            />
          </div>

          <Separator className="border-zinc-700" />

          {/* ── Media & Publishing ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Media &amp; Publishing
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="proj-cover" className="text-zinc-300">
                Cover Image URL
              </Label>
              <Input
                id="proj-cover"
                type="url"
                value={fields.cover_image_url}
                onChange={(e) => set('cover_image_url', e.target.value)}
                placeholder="https://..."
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="proj-sort" className="text-zinc-300">
                Sort Order
              </Label>
              <Input
                id="proj-sort"
                type="number"
                value={fields.sort_order}
                onChange={(e) => set('sort_order', e.target.value)}
                className="border-zinc-700 bg-zinc-800 text-white"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800 p-3">
              <div>
                <p className="text-sm font-medium text-zinc-200">Published</p>
                <p className="text-xs text-zinc-500">Visible to public immediately when ON</p>
              </div>
              <Switch
                checked={fields.is_published}
                onCheckedChange={(v) => set('is_published', v)}
              />
            </div>
          </div>

          {/* ── Error + Submit ── */}
          {error && (
            <p className="rounded-md bg-red-900/30 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[--color-accent] text-white hover:bg-orange-700"
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
