import { DEMO_MODE_ENABLED } from './demoMode'
import { ROLES } from './roles'

export { DEMO_MODE_ENABLED }

export const DEMO_CUSTOMER_BASE = '/demo/customer'

export const DEMO_CUSTOMER_USER = Object.freeze({
  id: 'customer-demo',
  fullName: 'Amara Osei',
  email: 'amara.osei@northwind.demo',
  companyName: 'Northwind Studio',
  role: ROLES.CUSTOMER,
})

export function toDemoCustomerPath(path) {
  return path.replace(/^\/customer/, DEMO_CUSTOMER_BASE)
}

export function fromDemoCustomerPath(pathname) {
  return pathname.replace(/^\/demo\/customer/, '/customer')
}
