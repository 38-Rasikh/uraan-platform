import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

// ── GET /api/v1/export?resource=orphanages  [Admin] ───────────────────────
// Generates and streams an .xlsx file for the requested resource.
// Processed server-side using SheetJS.

export async function GET(req: NextRequest) {
  await requireAuth()

  const resource = req.nextUrl.searchParams.get('resource') ?? 'orphanages'

  // Allowlist — only export known resources
  if (resource !== 'orphanages') {
    return NextResponse.json(
      {
        error: 'Unsupported resource. Only "orphanages" is currently supported.',
        code: 'INVALID_RESOURCE',
      },
      { status: 400 }
    )
  }

  const supabase = createSupabaseServiceClient()

  // Fetch all active orphanages (no pagination — export is intentionally exhaustive)
  const { data, error } = await supabase
    .from('orphanages')
    .select(
      'id, name, slug, address, area, city, latitude, longitude, is_registered, registration_number, registration_body, org_type, children_count, age_range, gender_served, contact_name, contact_phone, contact_email, website, accepts_donations, donation_details, accepts_volunteers, volunteer_details, uraan_visited, visit_count, last_visited_at, is_verified, verified_by, notes, is_active, created_at, updated_at'
    )
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('[GET /api/v1/export]', error)
    return NextResponse.json(
      { error: 'Failed to fetch data for export', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  // Map DB rows to human-readable column names
  const rows = (data ?? []).map((o) => ({
    ID: o.id,
    Name: o.name,
    Slug: o.slug,
    Address: o.address,
    Area: o.area,
    City: o.city,
    Latitude: o.latitude ?? '',
    Longitude: o.longitude ?? '',
    'Is Registered': o.is_registered ? 'Yes' : 'No',
    'Registration Number': o.registration_number ?? '',
    'Registration Body': o.registration_body ?? '',
    'Org Type': o.org_type,
    'Children Count': o.children_count ?? '',
    'Age Range': o.age_range ?? '',
    'Gender Served': o.gender_served ?? '',
    'Contact Name': o.contact_name ?? '',
    'Contact Phone': o.contact_phone ?? '',
    'Contact Email': o.contact_email ?? '',
    Website: o.website ?? '',
    'Accepts Donations': o.accepts_donations ? 'Yes' : 'No',
    'Donation Details': o.donation_details ?? '',
    'Accepts Volunteers': o.accepts_volunteers ? 'Yes' : 'No',
    'Volunteer Details': o.volunteer_details ?? '',
    'Uraan Visited': o.uraan_visited ? 'Yes' : 'No',
    'Visit Count': o.visit_count,
    'Last Visited At': o.last_visited_at ?? '',
    'Is Verified': o.is_verified ? 'Yes' : 'No',
    'Verified By': o.verified_by ?? '',
    Notes: o.notes ?? '',
    'Is Active': o.is_active ? 'Yes' : 'No',
    'Created At': o.created_at,
    'Updated At': o.updated_at,
  }))

  // Build workbook with ExcelJS
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Uraan Platform'
  workbook.created = new Date()

  const ws = workbook.addWorksheet('Orphanages')

  // Set columns from the keys of the first row
  if (rows.length > 0) {
    ws.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: Math.max(key.length + 4, 18),
    }))
  }

  // Bold + freeze header row
  ws.getRow(1).font = { bold: true }
  ws.views = [{ state: 'frozen', ySplit: 1 }]

  // Add data rows
  ws.addRows(rows)

  const buffer = await workbook.xlsx.writeBuffer()
  const filename = `uraan-orphanages-${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buffer as unknown as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
