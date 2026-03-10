import { requireAuth } from '@/lib/auth'
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient'

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()

  return <AdminLayoutClient userEmail={user.email}>{children}</AdminLayoutClient>
}
