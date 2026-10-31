import StaffPortalLayout from '../staff/StaffPortalLayout'
import { FINANCE_NAV } from '../../config/financeNav'
import {
  DEMO_FINANCE_BASE,
  DEMO_FINANCE_USER,
  FINANCE_ROOT,
} from '../../config/financeDemo'

export default function FinanceLayout({ demo = false }) {
  return (
    <StaffPortalLayout
      demo={demo}
      nav={FINANCE_NAV}
      user={DEMO_FINANCE_USER}
      base={DEMO_FINANCE_BASE}
      root={FINANCE_ROOT}
      workspace="Finance"
      workspaceLabel="Subscriptions, invoices and payments"
      fallbackRoleLabel="Finance Lead"
      sidebarId="finance-sidebar"
      navLabel="Finance Lead"
    />
  )
}
