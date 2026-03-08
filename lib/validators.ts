import { z } from 'zod'

// ── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// ── Orphanages ───────────────────────────────────────────────────────────────

export const orgTypeEnum = z.enum(['government', 'ngo', 'volunteer', 'religious', 'other'])
export const genderServedEnum = z.enum(['male', 'female', 'both'])

export const createOrphanageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  area: z.string().min(1, 'Area is required'),
  org_type: orgTypeEnum,
  is_registered: z.boolean().default(false),
  registration_number: z.string().nullable().optional(),
  registration_body: z.string().nullable().optional(),
  children_count: z.number().int().nonnegative().nullable().optional(),
  age_range: z.string().nullable().optional(),
  gender_served: genderServedEnum.nullable().optional(),
  contact_name: z.string().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  contact_email: z.string().email().nullable().optional(),
  website: z.string().url().nullable().optional(),
  accepts_donations: z.boolean().default(false),
  donation_details: z.string().nullable().optional(),
  accepts_volunteers: z.boolean().default(false),
  volunteer_details: z.string().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  notes: z.string().nullable().optional(),
  cover_image_url: z.string().url().nullable().optional(),
})

export const updateOrphanageSchema = createOrphanageSchema.partial()

export const orphanageQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  area: z.string().optional(),
  org_type: orgTypeEnum.optional(),
  is_registered: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  uraan_visited: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  accepts_donations: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  accepts_volunteers: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  search: z.string().optional(),
  sort: z.enum(['name', 'visit_count', 'last_visited_at', 'created_at']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
})

// ── Visits ───────────────────────────────────────────────────────────────────

export const createVisitSchema = z.object({
  orphanage_id: z.string().uuid('Invalid orphanage ID'),
  project_id: z.string().uuid().nullable().optional(),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  duration_hours: z.number().positive().nullable().optional(),
  volunteer_count: z.number().int().nonnegative().nullable().optional(),
  activities: z.array(z.string()).default([]),
  outcomes: z.array(z.string()).default([]),
  children_engaged: z.number().int().nonnegative().nullable().optional(),
  lead_volunteer: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

// ── Projects ─────────────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  tagline: z.string().nullable().optional(),
  description: z.string().min(1, 'Description is required'),
  date_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  date_end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  duration_label: z.string().nullable().optional(),
  institutions: z.array(z.string()).default([]),
  collaborators: z.array(z.string()).default([]),
  children_reached: z.number().int().nonnegative().nullable().optional(),
  volunteer_count: z.number().int().nonnegative().nullable().optional(),
  hours_delivered: z.number().nonnegative().nullable().optional(),
  skills_taught: z.array(z.string()).default([]),
  cover_image_url: z.string().url().nullable().optional(),
  gallery_urls: z.array(z.string().url()).default([]),
  impact_metrics: z.record(z.string(), z.unknown()).nullable().optional(),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().default(0),
})

export const updateProjectSchema = createProjectSchema.partial()

// ── Team Members ─────────────────────────────────────────────────────────────

export const createTeamMemberSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  department: z.string().nullable().optional(),
  batch: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  photo_url: z.string().url().nullable().optional(),
  phone: z.string().nullable().optional(),
  linkedin_url: z.string().url().nullable().optional(),
  joined_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  left_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  is_active: z.boolean().default(true),
  is_founding_member: z.boolean().default(false),
  sort_order: z.number().int().default(0),
})

export const updateTeamMemberSchema = createTeamMemberSchema.partial()
