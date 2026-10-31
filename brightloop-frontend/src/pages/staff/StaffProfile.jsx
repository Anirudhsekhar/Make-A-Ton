import { useLocation } from 'react-router-dom'
import { Mail, ShieldCheck, UserRound } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import Panel from '../../components/admin/Panel'
import SampleDataBadge from '../../components/admin/SampleDataBadge'
import StaffDemoNotice from '../../components/staff/StaffDemoNotice'
import { DEMO_FINANCE_USER } from '../../config/financeDemo'
import { DEMO_SALES_USER } from '../../config/salesDemo'
import { ROLE_LABELS } from '../../config/roles'

export default function StaffProfile() {
  const { pathname } = useLocation()
  const isFinance = pathname.startsWith('/demo/finance') || pathname.startsWith('/finance')
  const user = isFinance ? DEMO_FINANCE_USER : DEMO_SALES_USER
  const workspace = isFinance ? 'Finance Lead portal' : 'Sales Rep portal'

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={workspace}
        title="Profile"
        description="Your demo staff identity. Access and permissions are verified by the trusted profile service in production."
        actions={<SampleDataBadge className="hidden sm:inline-flex" />}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Panel title="Staff identity">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-[#bae6fd] bg-[#f0f9ff] text-[#0284c7]">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-slate-900">{user.fullName}</p>
              <p className="mt-0.5 truncate text-[12px] text-slate-500">{user.email}</p>
            </div>
          </div>

          <dl className="mt-5 space-y-3 text-[12.5px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Role</dt>
              <dd className="font-semibold text-slate-900">{ROLE_LABELS[user.role]}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Workspace</dt>
              <dd className="font-medium text-slate-700">{workspace}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Demo ID</dt>
              <dd className="font-medium tabular-nums text-slate-700">{user.id}</dd>
            </div>
          </dl>
        </Panel>

        <Panel
          title="Access notes"
          description="Role access is never inferred from the URL, demo navigation or local storage."
        >
          <ul className="space-y-3 text-[12.5px] leading-relaxed text-slate-600">
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0f766e]" aria-hidden="true" />
              Production routes must verify the Firebase token and trusted stored role before any
              workspace data is returned.
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#146c94]" aria-hidden="true" />
              Profile and password changes remain owned by the existing authentication services and
              are not simulated on this page.
            </li>
          </ul>
        </Panel>
      </div>

      <StaffDemoNotice>
        This profile is sample data for the development-only demo workspace. Exiting the demo
        returns to the login screen without calling Firebase sign-out.
      </StaffDemoNotice>
    </div>
  )
}
