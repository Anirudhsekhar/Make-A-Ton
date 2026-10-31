export const ROLES = Object.freeze({
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  STAFF: 'staff',
  SALES_REP: 'sales_rep',
  FINANCE_LEAD: 'finance_lead',
})

export const ROLE_LABELS = Object.freeze({
  [ROLES.ADMIN]: 'Admin',
  [ROLES.CUSTOMER]: 'Customer',
  [ROLES.STAFF]: 'Internal Staff',
  [ROLES.SALES_REP]: 'Sales Rep',
  [ROLES.FINANCE_LEAD]: 'Finance Lead',
})

export const ROLE_OPTIONS = Object.freeze([
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.CUSTOMER, label: 'Customer' },
  { value: ROLES.STAFF, label: 'Internal Staff' },
])

export const ROLE_HOME = Object.freeze({
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.CUSTOMER]: '/customer/dashboard',
  [ROLES.STAFF]: '/staff/dashboard',
  [ROLES.SALES_REP]: '/sales/dashboard',
  [ROLES.FINANCE_LEAD]: '/finance/dashboard',
})

export const KNOWN_ROLES = Object.freeze(Object.values(ROLES))

export function isKnownRole(role) {
  return KNOWN_ROLES.includes(role)
}
