import { DEMO_MODE_ENABLED } from './demoMode'
import { ROLES } from './roles'

export { DEMO_MODE_ENABLED }

export const DEMO_FINANCE_BASE = '/demo/finance'
export const FINANCE_ROOT = '/finance'

export const DEMO_FINANCE_USER = Object.freeze({
  id: 'finance-demo',
  fullName: 'Daniel Mensah',
  email: 'daniel.mensah@brightloop.demo',
  role: ROLES.FINANCE_LEAD,
})

export function toDemoFinancePath(path) {
  return path.replace(/^\/finance/, DEMO_FINANCE_BASE)
}

export function fromDemoFinancePath(pathname) {
  return pathname.replace(/^\/demo\/finance/, FINANCE_ROOT)
}
