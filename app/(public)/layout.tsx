import { Navbar } from '@/components/public/Navbar'
import { Footer } from '@/components/public/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[--color-bg]">
      <Navbar />
      <main className="flex-1" id="main-content">
        {children}
      </main>
      <Footer />
    </div>
  )
}
