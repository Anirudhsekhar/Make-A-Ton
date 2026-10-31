import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminDemoDataProvider } from '../../context/AdminDemoDataContext'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'

export default function AdminLayout({ demo = false }) {
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [navOpen])

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} demo={demo} />

      <div className="lg:pl-[264px]">
        <AdminTopbar onOpenNav={() => setNavOpen(true)} demo={demo} />
        <main className="mx-auto w-full max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AdminDemoDataProvider>
            <Outlet />
          </AdminDemoDataProvider>
        </main>
      </div>
    </div>
  )
}
