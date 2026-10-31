import { DEMO_MODE_ENABLED } from './demoMode'
import { ROLES } from './roles'

export { DEMO_MODE_ENABLED }

export const DEMO_SALES_BASE = '/demo/sales'
export const SALES_ROOT = '/sales'

export const DEMO_SALES_USER = Object.freeze({
  id: 'sales-demo',
  fullName: 'Priya Nair',
  email: 'priya.nair@brightloop.demo',
  role: ROLES.SALES_REP,
})

export function toDemoSalesPath(path) {
  return path.replace(/^\/sales/, DEMO_SALES_BASE)
}

export function fromDemoSalesPath(pathname) {
  return pathname.replace(/^\/demo\/sales/, SALES_ROOT)
}
