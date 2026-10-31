import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { CustomerPortalProvider } from '../../context/CustomerPortalContext'
import CustomerSidebar from './CustomerSidebar'
import CustomerTopbar from './CustomerTopbar'

export default function CustomerLayout({ demo = false }) {
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [navOpen])

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <CustomerSidebar open={navOpen} onClose={() => setNavOpen(false)} demo={demo} />

      <div className="lg:pl-[264px]">
        <CustomerTopbar onOpenNav={() => setNavOpen(true)} demo={demo} />
        <main className="mx-auto w-full max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <CustomerPortalProvider demo={demo}>
            <Outlet />
          </CustomerPortalProvider>
        </main>
      </div>
    </div>
  )
}
