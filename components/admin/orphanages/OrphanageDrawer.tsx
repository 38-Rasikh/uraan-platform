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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import type { Orphanage, OrgType } from '@/lib/types'

interface OrphanageDrawerProps {
  open: boolean
  orphanage?: Orphanage | null
  onClose: () => void
  onSaved: () => void
}

const ORG_TYPE_LABELS: Record<OrgType, string> = {
  government: 'Government',
  ngo: 'NGO',
  volunteer: 'Volunteer',
  religious: 'Religious',
  other: 'Other',
}

const FIELD_DEFAULTS = {
  name: '',
  address: '',
  area: '',
  org_type: '' as OrgType | '',
  is_registered: false,
  registration_number: '',
  registration_body: '',
  children_count: '',
  age_range: '',
  gender_served: '' as 'male' | 'female' | 'both' | '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  website: '',
  accepts_donations: false,
  donation_details: '',
  accepts_volunteers: false,
  volunteer_details: '',
  latitude: '',
  longitude: '',
  notes: '',
  cover_image_url: '',
}

type FieldState = typeof FIELD_DEFAULTS

function orphanageToFields(o: Orphanage): FieldState {
  return {
    name: o.name,
    address: o.address,
    area: o.area,
    org_type: o.org_type,
    is_registered: o.is_registered,
    registration_number: o.registration_number ?? '',
    registration_body: o.registration_body ?? '',
    children_count: o.children_count?.toString() ?? '',
    age_range: o.age_range ?? '',
    gender_served: o.gender_served ?? '',
    contact_name: o.contact_name ?? '',
    contact_phone: o.contact_phone ?? '',
    contact_email: o.contact_email ?? '',
    website: o.website ?? '',
    accepts_donations: o.accepts_donations,
    donation_details: o.donation_details ?? '',
    accepts_volunteers: o.accepts_volunteers,
    volunteer_details: o.volunteer_details ?? '',
    latitude: o.latitude?.toString() ?? '',
    longitude: o.longitude?.toString() ?? '',
    notes: o.notes ?? '',
    cover_image_url: o.cover_image_url ?? '',
  }
}

function fieldsToPayload(f: FieldState) {
  return {
    name: f.name,
    address: f.address,
    area: f.area,
    org_type: f.org_type || undefined,
    is_registered: f.is_registered,
    registration_number: f.registration_number || null,
    registration_body: f.registration_body || null,
    children_count: f.children_count ? parseInt(f.children_count, 10) : null,
    age_range: f.age_range || null,
    gender_served: (f.gender_served || null) as 'male' | 'female' | 'both' | null,
    contact_name: f.contact_name || null,
    contact_phone: f.contact_phone || null,
    contact_email: f.contact_email || null,
    website: f.website || null,
    accepts_donations: f.accepts_donations,
    donation_details: f.donation_details || null,
    accepts_volunteers: f.accepts_volunteers,
    volunteer_details: f.volunteer_details || null,
    latitude: f.latitude ? parseFloat(f.latitude) : null,
    longitude: f.longitude ? parseFloat(f.longitude) : null,
    notes: f.notes || null,
    cover_image_url: f.cover_image_url || null,
  }
}

export default function OrphanageDrawer({
  open,
  orphanage,
  onClose,
  onSaved,
}: OrphanageDrawerProps) {
  const isEdit = !!orphanage
  const [fields, setFields] = useState<FieldState>(
    orphanage ? orphanageToFields(orphanage) : FIELD_DEFAULTS
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Re-sync form whenever drawer opens or switches between orphanages.
  // Base UI Sheet does NOT call onOpenChange(true) on programmatic open,
  // so we rely on this effect instead of handling it in onOpenChange.
  useEffect(() => {
    if (open) {
      setFields(orphanage ? orphanageToFields(orphanage) : FIELD_DEFAULTS)
      setError(null)
    }
    // orphanage?.id is intentional: only re-run when we switch to a different record
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orphanage?.id])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose()
  }

  const set = (key: keyof FieldState, value: string | boolean) => {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = fieldsToPayload(fields)
    const url = isEdit ? `/api/v1/orphanages/${orphanage!.id}` : '/api/v1/orphanages'
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
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full max-w-lg overflow-y-auto bg-zinc-900 text-white">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-white">
            {isEdit ? 'Edit Orphanage' : 'Add New Orphanage'}
          </SheetTitle>
          <SheetDescription className="text-zinc-400">
            {isEdit ? `Editing: ${orphanage!.name}` : 'Fill in the details to add a new orphanage.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pb-8">
          {/* ── Core Info ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Basic Info
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-zinc-300">
                Name *
              </Label>
              <Input
                id="name"
                value={fields.name}
                onChange={(e) => set('name', e.target.value)}
                required
                placeholder="Dar-ul-Shafqat Orphanage"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-zinc-300">
                Address *
              </Label>
              <Textarea
                id="address"
                value={fields.address}
                onChange={(e) => set('address', e.target.value)}
                required
                rows={2}
                placeholder="Street, locality, city"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="area" className="text-zinc-300">
                  Area *
                </Label>
                <Input
                  id="area"
                  value={fields.area}
                  onChange={(e) => set('area', e.target.value)}
                  required
                  placeholder="Gulberg"
                  className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300">Org Type *</Label>
                <Select
                  value={fields.org_type}
                  onValueChange={(v) => set('org_type', v ?? '')}
                  required
                >
                  <SelectTrigger className="border-zinc-700 bg-zinc-800 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-700 bg-zinc-800 text-white">
                    {(Object.entries(ORG_TYPE_LABELS) as [OrgType, string][]).map(
                      ([val, label]) => (
                        <SelectItem key={val} value={val} className="focus:bg-zinc-700">
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="children-count" className="text-zinc-300">
                  Children Count
                </Label>
                <Input
                  id="children-count"
                  type="number"
                  min={0}
                  value={fields.children_count}
                  onChange={(e) => set('children_count', e.target.value)}
                  placeholder="0"
                  className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="age-range" className="text-zinc-300">
                  Age Range
                </Label>
                <Input
                  id="age-range"
                  value={fields.age_range}
                  onChange={(e) => set('age_range', e.target.value)}
                  placeholder="3–18 years"
                  className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-300">Gender Served</Label>
              <Select
                value={fields.gender_served}
                onValueChange={(v) => set('gender_served', v ?? '')}
              >
                <SelectTrigger className="border-zinc-700 bg-zinc-800 text-white">
                  <SelectValue placeholder="Select (optional)" />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-800 text-white">
                  <SelectItem value="male" className="focus:bg-zinc-700">
                    Male
                  </SelectItem>
                  <SelectItem value="female" className="focus:bg-zinc-700">
                    Female
                  </SelectItem>
                  <SelectItem value="both" className="focus:bg-zinc-700">
                    Both
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="bg-zinc-700" />

          {/* ── Registration ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Registration
            </h3>

            <div className="flex items-center gap-3">
              <Switch
                id="is-registered"
                checked={fields.is_registered}
                onCheckedChange={(v) => set('is_registered', v)}
              />
              <Label htmlFor="is-registered" className="text-zinc-300">
                Registered
              </Label>
            </div>

            <div
              className={`grid grid-cols-2 gap-3 transition-opacity ${fields.is_registered ? '' : 'pointer-events-none opacity-40'}`}
            >
              <div className="space-y-1.5">
                <Label htmlFor="reg-number" className="text-zinc-300">
                  Reg. Number
                </Label>
                <Input
                  id="reg-number"
                  value={fields.registration_number}
                  onChange={(e) => set('registration_number', e.target.value)}
                  className="border-zinc-700 bg-zinc-800 font-mono text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-body" className="text-zinc-300">
                  Reg. Body
                </Label>
                <Input
                  id="reg-body"
                  value={fields.registration_body}
                  onChange={(e) => set('registration_body', e.target.value)}
                  placeholder="Social Welfare Dept"
                  className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-zinc-700" />

          {/* ── Contact ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Contact
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact-name" className="text-zinc-300">
                  Contact Name
                </Label>
                <Input
                  id="contact-name"
                  value={fields.contact_name}
                  onChange={(e) => set('contact_name', e.target.value)}
                  className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-phone" className="text-zinc-300">
                  Phone
                </Label>
                <Input
                  id="contact-phone"
                  value={fields.contact_phone}
                  onChange={(e) => set('contact_phone', e.target.value)}
                  type="tel"
                  className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="contact-email"
                type="email"
                value={fields.contact_email}
                onChange={(e) => set('contact_email', e.target.value)}
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-zinc-300">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={fields.website}
                onChange={(e) => set('website', e.target.value)}
                placeholder="https://"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>

          <Separator className="bg-zinc-700" />

          {/* ── Donations ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Donations & Volunteers
            </h3>

            <div className="flex items-center gap-3">
              <Switch
                id="accepts-donations"
                checked={fields.accepts_donations}
                onCheckedChange={(v) => set('accepts_donations', v)}
              />
              <Label htmlFor="accepts-donations" className="text-zinc-300">
                Accepts Donations
              </Label>
            </div>

            <div
              className={`space-y-1.5 transition-opacity ${fields.accepts_donations ? '' : 'pointer-events-none opacity-40'}`}
            >
              <Label htmlFor="donation-details" className="text-zinc-300">
                Donation Details
              </Label>
              <Textarea
                id="donation-details"
                value={fields.donation_details}
                onChange={(e) => set('donation_details', e.target.value)}
                rows={2}
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="accepts-volunteers"
                checked={fields.accepts_volunteers}
                onCheckedChange={(v) => set('accepts_volunteers', v)}
              />
              <Label htmlFor="accepts-volunteers" className="text-zinc-300">
                Accepts Volunteers
              </Label>
            </div>

            <div
              className={`space-y-1.5 transition-opacity ${fields.accepts_volunteers ? '' : 'pointer-events-none opacity-40'}`}
            >
              <Label htmlFor="volunteer-details" className="text-zinc-300">
                Volunteer Details
              </Label>
              <Textarea
                id="volunteer-details"
                value={fields.volunteer_details}
                onChange={(e) => set('volunteer_details', e.target.value)}
                rows={2}
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>

          <Separator className="bg-zinc-700" />

          {/* ── Location ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Location
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="latitude" className="text-zinc-300">
                  Latitude
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={fields.latitude}
                  onChange={(e) => set('latitude', e.target.value)}
                  placeholder="31.5204"
                  className="border-zinc-700 bg-zinc-800 font-mono text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="longitude" className="text-zinc-300">
                  Longitude
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={fields.longitude}
                  onChange={(e) => set('longitude', e.target.value)}
                  placeholder="74.3587"
                  className="border-zinc-700 bg-zinc-800 font-mono text-white placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-zinc-700" />

          {/* ── Additional ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Additional
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="cover-image" className="text-zinc-300">
                Cover Image URL
              </Label>
              <Input
                id="cover-image"
                type="url"
                value={fields.cover_image_url}
                onChange={(e) => set('cover_image_url', e.target.value)}
                placeholder="https://..."
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-zinc-300">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={fields.notes}
                onChange={(e) => set('notes', e.target.value)}
                rows={3}
                placeholder="Internal notes…"
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>

          {error && (
            <p className="rounded border border-red-800 bg-red-900/40 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#E8620A] text-white hover:bg-[#d05509]"
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Orphanage'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
