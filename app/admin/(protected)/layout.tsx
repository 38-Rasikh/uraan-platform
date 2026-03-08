import { requireAuth } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/Sidebar'
import { AdminHeader } from '@/components/admin/Header'

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()

  return (
    <div className="dark flex h-screen overflow-hidden bg-zinc-950">
      {/* Fixed sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader userEmail={user.email} />
        <main className="flex-1 overflow-y-auto bg-zinc-900 p-6">{children}</main>
      </div>
    </div>
  )
}
