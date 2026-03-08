import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Returns the current authenticated user, or null if not logged in.
 * Uses getUser() (not getSession()) as Supabase recommends for security.
 */
export async function getUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) return null
  return user
}

/**
 * Requires an authenticated admin user.
 * Redirects to /admin/login if the session is missing.
 * Use this at the top of admin Server Components and API routes.
 */
export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/admin/login')
  return user
}
