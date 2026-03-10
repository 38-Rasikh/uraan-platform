import { z } from 'zod'

// ── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(254),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
})

// ── Orphanages ───────────────────────────────────────────────────────────────

export const orgTypeEnum = z.enum(['government', 'ngo', 'volunteer', 'religious', 'other'])
export const genderServedEnum = z.enum(['male', 'female', 'both'])

export const createOrphanageSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  address: z.string().trim().min(1, 'Address is required').max(400),
  area: z.string().trim().min(1, 'Area is required').max(100),
  org_type: orgTypeEnum,
  is_registered: z.boolean().default(false),
  registration_number: z.string().trim().max(100).nullable().optional(),
  registration_body: z.string().trim().max(200).nullable().optional(),
  children_count: z.number().int().nonnegative().max(10_000).nullable().optional(),
  age_range: z.string().trim().max(50).nullable().optional(),
  gender_served: genderServedEnum.nullable().optional(),
  contact_name: z.string().trim().max(150).nullable().optional(),
  contact_phone: z.string().trim().max(30).nullable().optional(),
  contact_email: z.string().trim().email().max(254).nullable().optional(),
  website: z.string().trim().url().max(2048).nullable().optional(),
  accepts_donations: z.boolean().default(false),
  donation_details: z.string().trim().max(1000).nullable().optional(),
  accepts_volunteers: z.boolean().default(false),
  volunteer_details: z.string().trim().max(1000).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
  cover_image_url: z.string().url().max(2048).nullable().optional(),
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
  search: z.string().trim().max(200).optional(),
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
  activities: z.array(z.string().trim().max(500)).max(50).default([]),
  outcomes: z.array(z.string().trim().max(500)).max(50).default([]),
  children_engaged: z.number().int().nonnegative().max(10_000).nullable().optional(),
  lead_volunteer: z.string().trim().max(150).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
})

// ── Projects ─────────────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  tagline: z.string().trim().max(300).nullable().optional(),
  description: z.string().trim().min(1, 'Description is required').max(20_000),
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
  skills_taught: z.array(z.string().trim().max(100)).max(100).default([]),
  cover_image_url: z.string().url().max(2048).nullable().optional(),
  gallery_urls: z.array(z.string().url().max(2048)).max(50).default([]),
  impact_metrics: z.record(z.string(), z.unknown()).nullable().optional(),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().default(0),
})

export const updateProjectSchema = createProjectSchema.partial()

// ── Team Members ─────────────────────────────────────────────────────────────

export const createTeamMemberSchema = z.object({
  full_name: z.string().trim().min(1, 'Name is required').max(150),
  role: z.string().trim().min(1, 'Role is required').max(150),
  department: z.string().trim().max(100).nullable().optional(),
  batch: z.string().trim().max(20).nullable().optional(),
  bio: z.string().trim().max(3000).nullable().optional(),
  photo_url: z.string().url().max(2048).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  linkedin_url: z.string().url().max(2048).nullable().optional(),
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
