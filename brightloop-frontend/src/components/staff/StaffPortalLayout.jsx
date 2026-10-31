import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { StaffDemoDataProvider } from '../../context/StaffDemoDataContext'
import StaffSidebar from './StaffSidebar'
import StaffTopbar from './StaffTopbar'

export default function StaffPortalLayout({
  demo = false,
  nav,
  user,
  base,
  root,
  workspace,
  workspaceLabel,
  fallbackRoleLabel,
  sidebarId,
  navLabel,
}) {
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [navOpen])

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <StaffSidebar
        open={navOpen}
        onClose={() => setNavOpen(false)}
        demo={demo}
        nav={nav}
        user={user}
        base={base}
        root={root}
        workspaceLabel={workspaceLabel}
        fallbackRoleLabel={fallbackRoleLabel}
        sidebarId={sidebarId}
        navLabel={navLabel}
      />

      <div className="lg:pl-[264px]">
        <StaffTopbar
          onOpenNav={() => setNavOpen(true)}
          demo={demo}
          nav={nav}
          base={base}
          root={root}
          workspace={workspace}
          sidebarId={sidebarId}
        />
        <main className="mx-auto w-full max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <StaffDemoDataProvider>
            <Outlet />
          </StaffDemoDataProvider>
        </main>
      </div>
    </div>
  )
}
