import { useLocation } from 'react-router-dom'
import { ChevronRight, Menu } from 'lucide-react'
import Brand from '../Brand'
import DemoModeBadge from '../admin/DemoModeBadge'
import SampleDataBadge from '../admin/SampleDataBadge'

export default function StaffTopbar({
  onOpenNav,
  demo = false,
  nav,
  base,
  root,
  workspace,
  sidebarId,
}) {
  const { pathname } = useLocation()
  const canonical = demo ? pathname.replace(base, root) : pathname
  const current = nav.find(
    (item) => canonical === item.to || canonical.startsWith(`${item.to}/`),
  )

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation"
          aria-controls={sidebarId}
          className="grid h-9 w-9 place-items-center rounded border border-slate-200 text-slate-600 transition-colors hover:bg-[#f8fafc] hover:text-slate-900 lg:hidden"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="lg:hidden">
          <Brand markOnly />
        </div>

        <div className="hidden min-w-0 items-center gap-2 lg:flex">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {workspace}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
          <span className="truncate text-[12.5px] font-semibold text-slate-900">
            {current?.label ?? 'Overview'}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <DemoModeBadge demo={demo} />
          {demo && <SampleDataBadge />}
        </div>
      </div>
    </header>
  )
}
