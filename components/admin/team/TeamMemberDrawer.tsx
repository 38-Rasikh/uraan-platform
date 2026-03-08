'use client'

import { useState, useEffect } from 'react'
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
import { Loader2 } from 'lucide-react'
import type { TeamMember } from '@/lib/types'

interface TeamMemberDrawerProps {
  open: boolean
  member?: TeamMember | null
  onClose: () => void
  onSaved: () => void
}

const FIELD_DEFAULTS = {
  full_name: '',
  role: '',
  department: '',
  batch: '',
  bio: '',
  photo_url: '',
  phone: '',
  linkedin_url: '',
  joined_date: '',
  left_date: '',
  is_active: true,
  is_founding_member: false,
  sort_order: '0',
}

type FieldState = typeof FIELD_DEFAULTS

function memberToFields(m: TeamMember): FieldState {
  return {
    full_name: m.full_name,
    role: m.role,
    department: m.department ?? '',
    batch: m.batch ?? '',
    bio: m.bio ?? '',
    photo_url: m.photo_url ?? '',
    phone: m.phone ?? '',
    linkedin_url: m.linkedin_url ?? '',
    joined_date: m.joined_date ?? '',
    left_date: m.left_date ?? '',
    is_active: m.is_active,
    is_founding_member: m.is_founding_member,
    sort_order: m.sort_order.toString(),
  }
}

function fieldsToPayload(f: FieldState) {
  return {
    full_name: f.full_name,
    role: f.role,
    department: f.department || null,
    batch: f.batch || null,
    bio: f.bio || null,
    photo_url: f.photo_url || null,
    phone: f.phone || null,
    linkedin_url: f.linkedin_url || null,
    joined_date: f.joined_date || null,
    left_date: f.left_date || null,
    is_active: f.is_active,
    is_founding_member: f.is_founding_member,
    sort_order: parseInt(f.sort_order, 10) || 0,
  }
}

export default function TeamMemberDrawer({
  open,
  member,
  onClose,
  onSaved,
}: TeamMemberDrawerProps) {
  const isEdit = !!member
  const [fields, setFields] = useState<FieldState>(member ? memberToFields(member) : FIELD_DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setFields(member ? memberToFields(member) : FIELD_DEFAULTS)
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, member?.id])

  const set = (key: keyof FieldState, value: string | boolean) => {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = fieldsToPayload(fields)
    const url = isEdit ? `/api/v1/team/${member!.id}` : '/api/v1/team'
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
            {isEdit ? 'Edit Team Member' : 'Add Team Member'}
          </SheetTitle>
          <SheetDescription className="text-zinc-400">
            {isEdit ? `Editing: ${member!.full_name}` : 'Fill in details to add a new team member.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pb-8">
          {/* ── Identity ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Identity
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="tm-name" className="text-zinc-300">
                Full Name *
              </Label>
              <Input
                id="tm-name"
                value={fields.full_name}
                onChange={(e) => set('full_name', e.target.value)}
                required
                placeholder="Muhammad Ali"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tm-role" className="text-zinc-300">
                  Role *
                </Label>
                <Input
                  id="tm-role"
                  value={fields.role}
                  onChange={(e) => set('role', e.target.value)}
                  required
                  placeholder="Finance Secretary"
                  className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tm-dept" className="text-zinc-300">
                  Department
                </Label>
                <Input
                  id="tm-dept"
                  value={fields.department}
                  onChange={(e) => set('department', e.target.value)}
                  placeholder="Operations"
                  className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tm-batch" className="text-zinc-300">
                Batch / Session
              </Label>
              <Input
                id="tm-batch"
                value={fields.batch}
                onChange={(e) => set('batch', e.target.value)}
                placeholder="2022-2026"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tm-bio" className="text-zinc-300">
                Bio
              </Label>
              <Textarea
                id="tm-bio"
                value={fields.bio}
                onChange={(e) => set('bio', e.target.value)}
                rows={3}
                placeholder="Short biography..."
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>

          <Separator className="border-zinc-700" />

          {/* ── Contact & Media ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Contact &amp; Media
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="tm-photo" className="text-zinc-300">
                Photo URL
              </Label>
              <Input
                id="tm-photo"
                type="url"
                value={fields.photo_url}
                onChange={(e) => set('photo_url', e.target.value)}
                placeholder="https://..."
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tm-phone" className="text-zinc-300">
                  Phone
                </Label>
                <Input
                  id="tm-phone"
                  type="tel"
                  value={fields.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+92 300 0000000"
                  className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tm-linkedin" className="text-zinc-300">
                  LinkedIn URL
                </Label>
                <Input
                  id="tm-linkedin"
                  type="url"
                  value={fields.linkedin_url}
                  onChange={(e) => set('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>

          <Separator className="border-zinc-700" />

          {/* ── Dates & Status ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Dates &amp; Status
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tm-joined" className="text-zinc-300">
                  Joined Date
                </Label>
                <Input
                  id="tm-joined"
                  type="date"
                  value={fields.joined_date}
                  onChange={(e) => set('joined_date', e.target.value)}
                  className="border-zinc-700 bg-zinc-800 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tm-left" className="text-zinc-300">
                  Left Date
                </Label>
                <Input
                  id="tm-left"
                  type="date"
                  value={fields.left_date}
                  onChange={(e) => set('left_date', e.target.value)}
                  className="border-zinc-700 bg-zinc-800 text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tm-sort" className="text-zinc-300">
                Sort Order
              </Label>
              <Input
                id="tm-sort"
                type="number"
                value={fields.sort_order}
                onChange={(e) => set('sort_order', e.target.value)}
                className="border-zinc-700 bg-zinc-800 text-white"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800 p-3">
              <div>
                <p className="text-sm font-medium text-zinc-200">Founding Member</p>
                <p className="text-xs text-zinc-500">Was part of the founding team</p>
              </div>
              <Switch
                checked={fields.is_founding_member}
                onCheckedChange={(v) => set('is_founding_member', v)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800 p-3">
              <div>
                <p className="text-sm font-medium text-zinc-200">Currently Active</p>
                <p className="text-xs text-zinc-500">Appears on public team page when ON</p>
              </div>
              <Switch checked={fields.is_active} onCheckedChange={(v) => set('is_active', v)} />
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
              {isEdit ? 'Save Changes' : 'Add Member'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
