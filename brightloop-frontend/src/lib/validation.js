export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(value.trim())
}

export const PASSWORD_RULES = Object.freeze([
  {
    id: 'length',
    label: 'More than 8 characters',
    test: (value) => value.length > 8,
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter',
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: 'special',
    label: 'At least one special character',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
])

export function getPasswordChecks(value) {
  return PASSWORD_RULES.map((rule) => ({
    ...rule,
    met: rule.test(value),
  }))
}

export function isStrongPassword(value) {
  return PASSWORD_RULES.every((rule) => rule.test(value))
}
