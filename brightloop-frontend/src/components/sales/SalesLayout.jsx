import StaffPortalLayout from '../staff/StaffPortalLayout'
import { SALES_NAV } from '../../config/salesNav'
import {
  DEMO_SALES_BASE,
  DEMO_SALES_USER,
  SALES_ROOT,
} from '../../config/salesDemo'

export default function SalesLayout({ demo = false }) {
  return (
    <StaffPortalLayout
      demo={demo}
      nav={SALES_NAV}
      user={DEMO_SALES_USER}
      base={DEMO_SALES_BASE}
      root={SALES_ROOT}
      workspace="Sales"
      workspaceLabel="Customers, quotations and subscriptions"
      fallbackRoleLabel="Sales Rep"
      sidebarId="sales-sidebar"
      navLabel="Sales Rep"
    />
  )
}
