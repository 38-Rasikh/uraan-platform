import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  createOrphanageSchema,
  orphanageQuerySchema,
  createVisitSchema,
  createProjectSchema,
  createTeamMemberSchema,
} from '@/lib/validators'

// ── loginSchema ───────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'admin@uraan.org', password: 'secret123' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret123' })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 6 chars', () => {
    const result = loginSchema.safeParse({ email: 'admin@uraan.org', password: '12345' })
    expect(result.success).toBe(false)
  })

  it('rejects password longer than 128 chars', () => {
    const result = loginSchema.safeParse({
      email: 'admin@uraan.org',
      password: 'a'.repeat(129),
    })
    expect(result.success).toBe(false)
  })

  it('rejects email longer than 254 chars', () => {
    // 249 'a's + '@x.com' (6) = 255 chars — exceeds 254 max
    const long = 'a'.repeat(249) + '@x.com'
    expect(long.length).toBe(255)
    const result = loginSchema.safeParse({ email: long, password: 'secret123' })
    expect(result.success).toBe(false)
  })

  it('trims whitespace from email', () => {
    const result = loginSchema.safeParse({ email: '  admin@uraan.org  ', password: 'secret123' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('admin@uraan.org')
  })
})

// ── createOrphanageSchema ─────────────────────────────────────────────────────

describe('createOrphanageSchema', () => {
  const base = {
    name: 'Test Orphanage',
    address: '123 Main St',
    area: 'Gulberg',
    org_type: 'ngo' as const,
  }

  it('accepts a minimal valid orphanage', () => {
    const result = createOrphanageSchema.safeParse(base)
    expect(result.success).toBe(true)
  })

  it('rejects name longer than 200 chars', () => {
    const result = createOrphanageSchema.safeParse({ ...base, name: 'x'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('rejects notes longer than 5000 chars', () => {
    const result = createOrphanageSchema.safeParse({ ...base, notes: 'n'.repeat(5001) })
    expect(result.success).toBe(false)
  })

  it('rejects invalid org_type', () => {
    const result = createOrphanageSchema.safeParse({ ...base, org_type: 'unknown' })
    expect(result.success).toBe(false)
  })

  it('trims whitespace from name', () => {
    const result = createOrphanageSchema.safeParse({ ...base, name: '  Lahore Home  ' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.name).toBe('Lahore Home')
  })

  it('rejects latitude out of range', () => {
    const result = createOrphanageSchema.safeParse({ ...base, latitude: 91 })
    expect(result.success).toBe(false)
  })
})

// ── orphanageQuerySchema ──────────────────────────────────────────────────────

describe('orphanageQuerySchema', () => {
  it('applies defaults when no params are provided', () => {
    const result = orphanageQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
      expect(result.data.sort).toBe('name')
      expect(result.data.order).toBe('asc')
    }
  })

  it('coerces string numbers for page and limit', () => {
    const result = orphanageQuerySchema.safeParse({ page: '3', limit: '50' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(3)
      expect(result.data.limit).toBe(50)
    }
  })

  it('rejects limit above 100', () => {
    const result = orphanageQuerySchema.safeParse({ limit: '101' })
    expect(result.success).toBe(false)
  })

  it('rejects search longer than 200 chars', () => {
    const result = orphanageQuerySchema.safeParse({ search: 'x'.repeat(201) })
    expect(result.success).toBe(false)
  })
})

// ── createVisitSchema ─────────────────────────────────────────────────────────

describe('createVisitSchema', () => {
  const base = {
    orphanage_id: '123e4567-e89b-12d3-a456-426614174000',
    visit_date: '2025-12-01',
  }

  it('accepts a minimal valid visit', () => {
    const result = createVisitSchema.safeParse(base)
    expect(result.success).toBe(true)
  })

  it('rejects non-UUID orphanage_id', () => {
    const result = createVisitSchema.safeParse({ ...base, orphanage_id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid date format', () => {
    const result = createVisitSchema.safeParse({ ...base, visit_date: '01-12-2025' })
    expect(result.success).toBe(false)
  })

  it('rejects activities array with more than 50 items', () => {
    const result = createVisitSchema.safeParse({
      ...base,
      activities: Array.from({ length: 51 }, (_, i) => `activity ${i}`),
    })
    expect(result.success).toBe(false)
  })
})

// ── createProjectSchema ───────────────────────────────────────────────────────

describe('createProjectSchema', () => {
  const base = {
    title: 'Education Drive',
    slug: 'education-drive',
    description: 'A camp focused on education.',
    date_start: '2025-01-15',
  }

  it('accepts a valid project', () => {
    const result = createProjectSchema.safeParse(base)
    expect(result.success).toBe(true)
  })

  it('rejects invalid slug with uppercase letters', () => {
    const result = createProjectSchema.safeParse({ ...base, slug: 'Education-Drive' })
    expect(result.success).toBe(false)
  })

  it('rejects slug longer than 100 chars', () => {
    const result = createProjectSchema.safeParse({ ...base, slug: 'a'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('rejects title longer than 200 chars', () => {
    const result = createProjectSchema.safeParse({ ...base, title: 'x'.repeat(201) })
    expect(result.success).toBe(false)
  })
})

// ── createTeamMemberSchema ────────────────────────────────────────────────────

describe('createTeamMemberSchema', () => {
  const base = { full_name: 'Ali Raza', role: 'Coordinator' }

  it('accepts a valid team member', () => {
    const result = createTeamMemberSchema.safeParse(base)
    expect(result.success).toBe(true)
  })

  it('trims whitespace from full_name', () => {
    const result = createTeamMemberSchema.safeParse({ ...base, full_name: '  Ali Raza  ' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.full_name).toBe('Ali Raza')
  })

  it('rejects full_name longer than 150 chars', () => {
    const result = createTeamMemberSchema.safeParse({ ...base, full_name: 'x'.repeat(151) })
    expect(result.success).toBe(false)
  })

  it('rejects bio longer than 3000 chars', () => {
    const result = createTeamMemberSchema.safeParse({ ...base, bio: 'b'.repeat(3001) })
    expect(result.success).toBe(false)
  })
})
