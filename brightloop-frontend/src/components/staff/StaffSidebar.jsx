import { NavLink, useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, LogOut, X } from 'lucide-react'
import Brand from '../Brand'
import { ROLE_LABELS } from '../../config/roles'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../lib/adminFormat'

function navClassName({ isActive }) {
  return `group flex items-center gap-3 rounded border px-3 py-2.5 text-[13px] font-medium transition-colors ${
    isActive
      ? 'border-[#bae6fd] bg-[#f0f9ff] text-[#005374]'
      : 'border-transparent text-slate-600 hover:bg-[#f8fafc] hover:text-slate-900'
  }`
}

export default function StaffSidebar({
  open,
  onClose,
  demo = false,
  nav,
  user,
  base,
  root,
  workspaceLabel,
  fallbackRoleLabel,
  sidebarId,
  navLabel,
}) {
  const navigate = useNavigate()
  const { firebaseUser, profile, role, logout } = useAuth()

  const displayName = demo
    ? user.fullName
    : profile?.fullName || firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'Staff'
  const email = demo ? user.email : profile?.email || firebaseUser?.email || ''
  const displayRole = demo ? user.role : role

  const handleSessionAction = () => {
    if (demo) {
      navigate('/login')
      return
    }
    logout()
  }

  const navTo = (path) => (demo ? path.replace(root, base) : path)

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-[1px] transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        id={sidebarId}
        aria-label={navLabel}
        className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="grid h-8 w-8 place-items-center rounded border border-slate-200 text-slate-500 transition-colors hover:bg-[#f8fafc] hover:text-slate-900 lg:hidden"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="px-4 pt-5">
          <div className="flex items-start gap-2.5 rounded-lg border border-[#bae6fd] bg-[#f0f9ff] px-3 py-2.5">
            <BriefcaseBusiness
              className="mt-0.5 h-4 w-4 shrink-0 text-[#146c94]"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#005374]">
                {demo ? 'Demo workspace' : 'Staff workspace'}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                {demo ? 'Dev-only - Authentication bypassed' : workspaceLabel}
              </p>
            </div>
          </div>
        </div>

        <nav aria-label={`${navLabel} sections`} className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Workspace
          </p>
          <ul className="mt-2 space-y-1">
            {nav.map(({ label, to, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={navTo(to)} end={end} onClick={onClose} className={navClassName}>
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 ${
                          isActive ? 'text-[#146c94]' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-slate-200 p-3">
          <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-[#f8fafc] p-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-[#146c94]">
              {getInitials(displayName)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-slate-900">{displayName}</p>
              <p className="truncate text-[11px] text-slate-500">{email || 'Verified session'}</p>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 px-1">
            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.04em] text-[#0f766e]">
              {ROLE_LABELS[displayRole] ?? fallbackRoleLabel}
            </span>
            <button
              type="button"
              onClick={handleSessionAction}
              className="inline-flex items-center gap-1.5 rounded px-1.5 py-1 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              {demo ? 'Exit demo' : 'Log out'}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
