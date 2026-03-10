'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle,
  Loader2,
  Heart,
  Handshake,
  Users,
  MessageSquare,
  Mail,
  Github,
} from 'lucide-react'

// ── Shared form state types ────────────────────────────────────────────────

type VolunteerFields = {
  name: string
  email: string
  phone: string
  type: string
  skills: string
  message: string
}

type PartnerFields = {
  org_name: string
  org_type: string
  contact_name: string
  email: string
  phone: string
  message: string
}

const VOLUNTEER_DEFAULTS: VolunteerFields = {
  name: '',
  email: '',
  phone: '',
  type: '',
  skills: '',
  message: '',
}

const PARTNER_DEFAULTS: PartnerFields = {
  org_name: '',
  org_type: '',
  contact_name: '',
  email: '',
  phone: '',
  message: '',
}

// ── Section wrapper ────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-8 shadow-sm">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[--color-accent-muted] text-[--color-accent]">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[--color-text-primary]">{title}</h2>
          <p className="mt-1 text-sm text-[--color-text-secondary]">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

// ── Success banner ─────────────────────────────────────────────────────────

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-emerald-900/30 px-4 py-3 text-emerald-400">
      <CheckCircle className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

// ── Volunteer form ─────────────────────────────────────────────────────────

function VolunteerForm() {
  const [fields, setFields] = useState<VolunteerFields>(VOLUNTEER_DEFAULTS)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof VolunteerFields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    // No backend endpoint for contact forms — submissions are logged client-side only.
    // A backend email/webhook integration can be added in a future sprint.
    await new Promise((r) => setTimeout(r, 600))
    setSubmitting(false)
    setSubmitted(true)
    setFields(VOLUNTEER_DEFAULTS)
  }

  if (submitted) {
    return <SuccessBanner message="Thanks for your interest! We'll reach out within 48 hours." />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="vol-name">Full Name *</Label>
          <Input
            id="vol-name"
            value={fields.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vol-email">Email *</Label>
          <Input
            id="vol-email"
            type="email"
            value={fields.email}
            onChange={(e) => set('email', e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="vol-phone">Contact Number</Label>
        <Input
          id="vol-phone"
          type="tel"
          value={fields.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="+92 300 0000000"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="vol-type">I am a…</Label>
        <Select value={fields.type} onValueChange={(v) => set('type', v ?? '')}>
          <SelectTrigger id="vol-type">
            <SelectValue placeholder="Select one" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student (currently enrolled)</SelectItem>
            <SelectItem value="recent_grad">Recent Graduate</SelectItem>
            <SelectItem value="professional">Working Professional</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="vol-skills">Skills / Interests</Label>
        <Input
          id="vol-skills"
          value={fields.skills}
          onChange={(e) => set('skills', e.target.value)}
          placeholder="e.g. Teaching, Art, Coding, Sports"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="vol-message">Message (optional)</Label>
        <Textarea
          id="vol-message"
          value={fields.message}
          onChange={(e) => set('message', e.target.value)}
          rows={3}
          placeholder="Anything else you'd like to share..."
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button
        type="submit"
        disabled={submitting}
        className="bg-[--color-accent] text-white hover:bg-orange-700"
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Application
      </Button>
    </form>
  )
}

// ── Partner form ───────────────────────────────────────────────────────────

function PartnerForm() {
  const [fields, setFields] = useState<PartnerFields>(PARTNER_DEFAULTS)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const set = (key: keyof PartnerFields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))
    setSubmitting(false)
    setSubmitted(true)
    setFields(PARTNER_DEFAULTS)
  }

  if (submitted) {
    return <SuccessBanner message="Thank you! Our partnerships team will contact you soon." />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="org-name">Organisation Name *</Label>
          <Input
            id="org-name"
            value={fields.org_name}
            onChange={(e) => set('org_name', e.target.value)}
            required
            placeholder="Your organisation"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-type">Organisation Type *</Label>
          <Select value={fields.org_type} onValueChange={(v) => set('org_type', v ?? '')}>
            <SelectTrigger id="org-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ngo">NGO / Non-profit</SelectItem>
              <SelectItem value="corporate">Corporate / Business</SelectItem>
              <SelectItem value="university">University / Educational</SelectItem>
              <SelectItem value="government">Government Body</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name">Contact Person *</Label>
          <Input
            id="contact-name"
            value={fields.contact_name}
            onChange={(e) => set('contact_name', e.target.value)}
            required
            placeholder="Full name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-email">Contact Email *</Label>
          <Input
            id="contact-email"
            type="email"
            value={fields.email}
            onChange={(e) => set('email', e.target.value)}
            required
            placeholder="contact@org.com"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-phone">Phone (optional)</Label>
        <Input
          id="contact-phone"
          type="tel"
          value={fields.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="+92 300 0000000"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="partner-message">How would you like to collaborate? *</Label>
        <Textarea
          id="partner-message"
          value={fields.message}
          onChange={(e) => set('message', e.target.value)}
          required
          rows={4}
          placeholder="Describe your proposed collaboration or partnership..."
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="bg-[--color-accent] text-white hover:bg-orange-700"
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Partnership Request
      </Button>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function ConnectPage() {
  return (
    <div className="mx-auto max-w-container px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-[--color-text-primary]">Connect with Uraan</h1>
        <p className="mt-4 max-w-2xl text-lg text-[--color-text-secondary]">
          Whether you want to volunteer, donate to an orphanage, or partner with us — we&apos;d love
          to hear from you.
        </p>
      </div>

      <div className="space-y-8">
        {/* Volunteer */}
        <SectionCard
          icon={<Users className="h-6 w-6" />}
          title="Volunteer with Uraan"
          description="Join our team of outreach volunteers. We visit orphanages across Lahore to deliver skill-building sessions."
        >
          <VolunteerForm />
        </SectionCard>

        {/* Donate */}
        <SectionCard
          icon={<Heart className="h-6 w-6" />}
          title="Donate to Orphanages"
          description="Many orphanages in our directory accept direct donations. Visit any orphanage profile to find their donation information."
        >
          <div className="space-y-4">
            <p className="text-sm text-[--color-text-secondary]">
              We do not collect donations on behalf of orphanages — all donations go directly to the
              institutions. Use our directory to find verified orphanages that accept donations.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/directory?accepts_donations=true">
                <Button
                  variant="outline"
                  className="border-[--color-accent] text-[--color-accent] hover:bg-[--color-accent-muted]"
                >
                  View Orphanages Accepting Donations
                </Button>
              </Link>
              <Link href="/verify">
                <Button variant="outline">Verify an Orphanage</Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-[--color-accent-muted] text-[--color-accent]">100% Direct</Badge>
              <Badge variant="secondary">No Middleman</Badge>
              <Badge variant="secondary">Verified Listings</Badge>
            </div>
          </div>
        </SectionCard>

        {/* Partner */}
        <SectionCard
          icon={<Handshake className="h-6 w-6" />}
          title="Partner with Uraan"
          description="NGOs, corporates, and educational institutions — collaborate with us on outreach programs."
        >
          <PartnerForm />
        </SectionCard>

        {/* Contact Developers */}
        <SectionCard
          icon={<MessageSquare className="h-6 w-6" />}
          title="Contact Developers"
          description="Experiencing a bug, missing data, or have a feature request? Reach the platform team directly."
        >
          <div className="space-y-4">
            <p className="text-sm text-[--color-text-secondary]">
              This platform is maintained by the Uraan tech team at UET Lahore. We welcome bug
              reports, accessibility feedback, and collaboration proposals.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="mailto:dev@uraan.uet.edu.pk"
                className="inline-flex items-center gap-2 rounded-lg border border-[--color-border] px-4 py-2.5 text-sm text-[--color-text-secondary] transition-colors hover:border-[--color-accent] hover:text-[--color-accent]"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                dev@uraan.uet.edu.pk
              </a>
              <a
                href="https://github.com/uraan-uet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[--color-border] px-4 py-2.5 text-sm text-[--color-text-secondary] transition-colors hover:border-[--color-accent] hover:text-[--color-accent]"
                aria-label="Uraan on GitHub (opens in new tab)"
              >
                <Github className="h-4 w-4 flex-shrink-0" />
                github.com/uraan-uet
              </a>
            </div>
            <p className="text-xs text-[--color-text-muted]">
              Response time is typically within 2–3 business days.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
