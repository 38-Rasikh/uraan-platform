import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { parse as parseCsv } from 'csv-parse/sync'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { createOrphanageSchema } from '@/lib/validators'
import { generateSlug } from '@/lib/utils'

// ── POST /api/v1/import  [Admin] ─────────────────────────────────────────
// Accepts multipart/form-data with an .xlsx or .csv file.
// Validates ALL rows with Zod before writing any — all-or-nothing.
// Returns: { imported, skipped, errors }

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

// Column header → DB field mapping (case-insensitive header match)
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

// Normalise a raw spreadsheet row into a DB-shaped object
function normaliseRow(raw: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [header, value] of Object.entries(raw)) {
    const dbField = HEADER_MAP[header.trim().toLowerCase()]
    if (dbField) result[dbField] = value
  }

  // Coerce types
  if ('is_registered' in result) result.is_registered = parseBool(result.is_registered) ?? false
  if ('accepts_donations' in result)
    result.accepts_donations = parseBool(result.accepts_donations) ?? false
  if ('accepts_volunteers' in result)
    result.accepts_volunteers = parseBool(result.accepts_volunteers) ?? false
  if ('children_count' in result) result.children_count = parseNum(result.children_count)
  if ('latitude' in result) result.latitude = parseNum(result.latitude)
  if ('longitude' in result) result.longitude = parseNum(result.longitude)

  // Blank strings → null for optional fields
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
    if (f in result && (result[f] === '' || result[f] === undefined)) {
      result[f] = null
    }
  }

  return result
}

export async function POST(req: NextRequest) {
  await requireAuth()

  const contentType = req.headers.get('content-type') ?? ''
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json(
      { error: 'Expected multipart/form-data', code: 'INVALID_CONTENT_TYPE' },
      { status: 400 }
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { error: 'Failed to parse form data', code: 'PARSE_ERROR' },
      { status: 400 }
    )
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'No file provided. Expected a "file" field.', code: 'MISSING_FILE' },
      { status: 400 }
    )
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File too large. Maximum size is 5 MB.', code: 'FILE_TOO_LARGE' },
      { status: 400 }
    )
  }

  // Validate file type
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/csv',
  ]
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!allowedTypes.includes(file.type) && ext !== 'xlsx' && ext !== 'csv') {
    return NextResponse.json(
      { error: 'Only .xlsx and .csv files are accepted.', code: 'INVALID_FILE_TYPE' },
      { status: 400 }
    )
  }

  // Import mode: 'new_only' = insert only rows whose slug doesn't exist yet
  //              'upsert'   = insert new + update existing (default)
  const rawMode = formData.get('mode')?.toString()
  const mode: 'new_only' | 'upsert' = rawMode === 'new_only' ? 'new_only' : 'upsert'

  // Parse spreadsheet (ExcelJS for .xlsx, csv-parse for .csv)
  const arrayBuffer = await file.arrayBuffer()
  let rows: Record<string, unknown>[]
  try {
    if (ext === 'csv') {
      const text = Buffer.from(arrayBuffer).toString('utf-8')
      rows = parseCsv(text, {
        columns: true,
        skip_empty_lines: true,
        cast: false, // keep everything as strings; normaliseRow handles coercion
        trim: true,
      }) as Record<string, unknown>[]
    } else {
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(arrayBuffer)
      const ws = workbook.worksheets[0]
      if (!ws) throw new Error('No worksheet found')

      // Read headers from row 1
      const headers: string[] = []
      ws.getRow(1).eachCell({ includeEmpty: false }, (cell, col) => {
        headers[col - 1] = String(cell.value ?? '')
      })

      rows = []
      ws.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return
        const obj: Record<string, unknown> = {}
        // Seed all headers with empty string (defval equivalent)
        headers.forEach((h) => {
          if (h) obj[h] = ''
        })
        row.eachCell({ includeEmpty: true }, (cell, col) => {
          const h = headers[col - 1]
          if (!h) return
          // Resolve formula result; convert Date objects to ISO date strings
          let val: unknown =
            cell.type === ExcelJS.ValueType.Formula ? (cell.result ?? null) : cell.value
          if (val instanceof Date) val = val.toISOString().slice(0, 10)
          obj[h] = val ?? ''
        })
        rows.push(obj)
      })
    }
  } catch {
    return NextResponse.json(
      {
        error: 'Failed to parse spreadsheet. Ensure the file is a valid .xlsx or .csv.',
        code: 'PARSE_ERROR',
      },
      { status: 400 }
    )
  }

  if (rows.length === 0) {
    return NextResponse.json({ imported: 0, skipped: 0, errors: [] })
  }

  // Validate all rows with Zod
  interface RowError {
    row: number
    field: string
    message: string
  }
  const errors: RowError[] = []
  const validRows: Array<ReturnType<typeof normaliseRow>> = []

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2 // spreadsheet row number (header is row 1)
    const normalised = normaliseRow(rows[i]!)
    const parsed = createOrphanageSchema.safeParse(normalised)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push({
          row: rowNum,
          field: issue.path.join('.') || 'unknown',
          message: issue.message,
        })
      }
    } else {
      validRows.push(normalised)
    }
  }

  // All-or-nothing: refuse to import if any row has errors
  if (errors.length > 0) {
    return NextResponse.json(
      {
        imported: 0,
        skipped: rows.length,
        errors,
      },
      { status: 422 }
    )
  }

  // Build insert rows (generate slug, ensure defaults)
  const supabase = createSupabaseServiceClient()
  const inserts = validRows.map((row) => ({
    ...row,
    slug: generateSlug(String(row.name ?? '')),
    city: row.city ?? 'Lahore',
    is_active: true,
  }))

  if (mode === 'new_only') {
    // Fetch which slugs already exist and skip those rows
    const slugs = inserts.map((r) => r.slug)
    const { data: existing } = await supabase.from('orphanages').select('slug').in('slug', slugs)
    const existingSet = new Set(existing?.map((r) => r.slug) ?? [])
    const newInserts = inserts.filter((r) => !existingSet.has(r.slug))
    const skippedCount = inserts.length - newInserts.length

    if (newInserts.length === 0) {
      return NextResponse.json({ imported: 0, skipped: skippedCount, errors: [] })
    }

    const { data, error } = await supabase.from('orphanages').insert(newInserts).select('id')

    if (error) {
      console.error('[POST /api/v1/import new_only]', error)
      return NextResponse.json(
        { error: 'Database insert failed', code: 'DB_ERROR', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      imported: data?.length ?? 0,
      skipped: skippedCount,
      errors: [],
    })
  }

  // mode === 'upsert': update existing records (including soft-deleted) on slug conflict
  const { data, error } = await supabase
    .from('orphanages')
    .upsert(inserts, { onConflict: 'slug', ignoreDuplicates: false })
    .select('id')

  if (error) {
    console.error('[POST /api/v1/import upsert]', error)
    return NextResponse.json(
      { error: 'Database insert failed', code: 'DB_ERROR', details: error.message },
      { status: 500 }
    )
  }

  const importedCount = data?.length ?? 0
  const skippedCount = inserts.length - importedCount

  return NextResponse.json({
    imported: importedCount,
    skipped: skippedCount,
    errors: [],
  })
}
