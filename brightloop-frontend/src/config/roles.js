export const ROLES = Object.freeze({
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  STAFF: 'staff',
})

export const ROLE_LABELS = Object.freeze({
  [ROLES.ADMIN]: 'Admin',
  [ROLES.CUSTOMER]: 'Customer',
  [ROLES.STAFF]: 'Internal Staff',
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
})

export const KNOWN_ROLES = Object.freeze(Object.values(ROLES))

export function isKnownRole(role) {
  return KNOWN_ROLES.includes(role)
}
