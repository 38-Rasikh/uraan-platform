import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { parse as parseCsv } from 'csv-parse/sync'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { createOrphanageSchema } from '@/lib/validators'
import { generateSlug } from '@/lib/utils'

// ── POST /api/v1/import/preview  [Admin] ─────────────────────────────────
// Parses and validates a spreadsheet file without writing to the database.
// Returns up to 50 preview rows with per-row validation results.
// Used by the ImportZone component for safe client-side preview.

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const HEADER_MAP: Record<string, string> = {
  name: 'name',
  address: 'address',
  area: 'area',
  city: 'city',
  org_type: 'org_type',
  'org type': 'org_type',
  is_registered: 'is_registered',
  'is registered': 'is_registered',
  registration_number: 'registration_number',
  'registration number': 'registration_number',
  registration_body: 'registration_body',
  'registration body': 'registration_body',
  children_count: 'children_count',
  'children count': 'children_count',
  age_range: 'age_range',
  'age range': 'age_range',
  gender_served: 'gender_served',
  'gender served': 'gender_served',
  contact_name: 'contact_name',
  'contact name': 'contact_name',
  contact_phone: 'contact_phone',
  'contact phone': 'contact_phone',
  contact_email: 'contact_email',
  'contact email': 'contact_email',
  website: 'website',
  accepts_donations: 'accepts_donations',
  'accepts donations': 'accepts_donations',
  donation_details: 'donation_details',
  'donation details': 'donation_details',
  accepts_volunteers: 'accepts_volunteers',
  'accepts volunteers': 'accepts_volunteers',
  volunteer_details: 'volunteer_details',
  'volunteer details': 'volunteer_details',
  latitude: 'latitude',
  longitude: 'longitude',
  notes: 'notes',
  cover_image_url: 'cover_image_url',
  'cover image url': 'cover_image_url',
}

function parseBool(v: unknown): boolean | undefined {
  if (v === null || v === undefined || v === '') return undefined
  if (typeof v === 'boolean') return v
  const s = String(v).trim().toLowerCase()
  if (s === 'yes' || s === 'true' || s === '1') return true
  if (s === 'no' || s === 'false' || s === '0') return false
  return undefined
}

function parseNum(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

function normaliseRow(raw: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [header, value] of Object.entries(raw)) {
    const dbField = HEADER_MAP[header.trim().toLowerCase()]
    if (dbField) result[dbField] = value
  }
  if ('is_registered' in result) result.is_registered = parseBool(result.is_registered) ?? false
  if ('accepts_donations' in result)
    result.accepts_donations = parseBool(result.accepts_donations) ?? false
  if ('accepts_volunteers' in result)
    result.accepts_volunteers = parseBool(result.accepts_volunteers) ?? false
  if ('children_count' in result) result.children_count = parseNum(result.children_count)
  if ('latitude' in result) result.latitude = parseNum(result.latitude)
  if ('longitude' in result) result.longitude = parseNum(result.longitude)
  const nullableFields = [
    'registration_number',
    'registration_body',
    'age_range',
    'gender_served',
    'contact_name',
    'contact_phone',
    'contact_email',
    'website',
    'donation_details',
    'volunteer_details',
    'notes',
    'cover_image_url',
    'city',
  ]
  for (const f of nullableFields) {
    if (f in result && (result[f] === '' || result[f] === undefined)) result[f] = null
  }
  return result
}

async function parseSpreadsheet(
  arrayBuffer: ArrayBuffer,
  ext: string
): Promise<Record<string, unknown>[]> {
  if (ext === 'csv') {
    const text = Buffer.from(arrayBuffer).toString('utf-8')
    return parseCsv(text, {
      columns: true,
      skip_empty_lines: true,
      cast: false,
      trim: true,
    }) as Record<string, unknown>[]
  }

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(arrayBuffer)
  const ws = workbook.worksheets[0]
  if (!ws) return []

  const headers: string[] = []
  ws.getRow(1).eachCell({ includeEmpty: false }, (cell, col) => {
    headers[col - 1] = String(cell.value ?? '')
  })

  const rows: Record<string, unknown>[] = []
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const obj: Record<string, unknown> = {}
    headers.forEach((h) => {
      if (h) obj[h] = ''
    })
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      const h = headers[col - 1]
      if (!h) return
      let val: unknown =
        cell.type === ExcelJS.ValueType.Formula ? (cell.result ?? null) : cell.value
      if (val instanceof Date) val = val.toISOString().slice(0, 10)
      obj[h] = val ?? ''
    })
    rows.push(obj)
  })
  return rows
}

export async function POST(req: NextRequest) {
  await requireAuth()

  const contentType = req.headers.get('content-type') ?? ''
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 5 MB.' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'xlsx'

  const arrayBuffer = await file.arrayBuffer()
  let rawRows: Record<string, unknown>[]
  try {
    rawRows = await parseSpreadsheet(arrayBuffer, ext)
  } catch {
    return NextResponse.json(
      { error: 'Failed to parse spreadsheet. Ensure the file is a valid .xlsx or .csv.' },
      { status: 400 }
    )
  }

  const total = rawRows.length

  // Preview: first 50 rows with validation results
  const previewRows = rawRows.slice(0, 50).map((raw, i) => {
    const normalised = normaliseRow(raw)
    const parsed = createOrphanageSchema.safeParse(normalised)
    return {
      rowNum: i + 2,
      data: normalised,
      isValid: parsed.success,
      errors: parsed.success
        ? []
        : parsed.error.issues.map((e) => `${e.path.join('.') || 'field'}: ${e.message}`),
    }
  })

  // Check which slugs already exist in the DB (across all rows, not just the 50-row preview)
  const supabase = createSupabaseServiceClient()
  const allSlugs = rawRows.map((raw) => generateSlug(String(normaliseRow(raw).name ?? '')))
  const uniqueSlugs = [...new Set(allSlugs.filter(Boolean))]
  const duplicates: string[] = []
  if (uniqueSlugs.length > 0) {
    const { data: existing } = await supabase
      .from('orphanages')
      .select('slug, name')
      .in('slug', uniqueSlugs)
      .eq('is_active', true)
    const existingSlugSet = new Set(existing?.map((r) => r.slug) ?? [])
    const seen = new Set<string>()
    for (const raw of rawRows) {
      const norm = normaliseRow(raw)
      const slug = generateSlug(String(norm.name ?? ''))
      const name = String(norm.name ?? '')
      if (slug && existingSlugSet.has(slug) && !seen.has(slug)) {
        duplicates.push(name)
        seen.add(slug)
      }
    }
  }

  return NextResponse.json({ rows: previewRows, total, duplicates })
}
