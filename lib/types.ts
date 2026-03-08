// ── Database entity types ────────────────────────────────────────────────────
// These mirror the database schema exactly. Use for typed Supabase queries.

export type OrgType = 'government' | 'ngo' | 'volunteer' | 'religious' | 'other'
export type GenderServed = 'male' | 'female' | 'both'

export interface Orphanage {
  id: string
  name: string
  slug: string
  address: string
  area: string
  city: string
  latitude: number | null
  longitude: number | null
  is_registered: boolean
  registration_number: string | null
  registration_body: string | null
  org_type: OrgType
  children_count: number | null
  age_range: string | null
  gender_served: GenderServed | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  website: string | null
  accepts_donations: boolean
  donation_details: string | null
  accepts_volunteers: boolean
  volunteer_details: string | null
  uraan_visited: boolean
  visit_count: number
  last_visited_at: string | null
  is_verified: boolean
  verified_by: string | null
  verified_at: string | null
  notes: string | null
  cover_image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Visit {
  id: string
  orphanage_id: string
  project_id: string | null
  visit_date: string
  duration_hours: number | null
  volunteer_count: number | null
  activities: string[]
  outcomes: string[]
  children_engaged: number | null
  lead_volunteer: string | null
  report_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  slug: string
  tagline: string | null
  description: string
  date_start: string
  date_end: string | null
  duration_label: string | null
  institutions: string[]
  collaborators: string[]
  children_reached: number | null
  volunteer_count: number | null
  hours_delivered: number | null
  skills_taught: string[]
  cover_image_url: string | null
  gallery_urls: string[]
  impact_metrics: Record<string, unknown> | null
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  full_name: string
  role: string
  department: string | null
  bio: string | null
  photo_url: string | null
  linkedin_url: string | null
  session_year: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Partner {
  id: string
  name: string
  slug: string
  org_type: string
  contact_name: string | null
  contact_email: string | null
  website: string | null
  description: string | null
  logo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── API Response types ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface ApiError {
  error: string
  code: string
  details?: Record<string, unknown>
}
