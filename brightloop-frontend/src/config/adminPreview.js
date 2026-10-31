import { ROLES } from './roles'

function readBooleanFlag(value) {
  return typeof value === 'string' && value.trim().toLowerCase() === 'true'
}

// `import.meta.env.DEV` is compiled to `false` for production builds, so this
// preview escape hatch can never become active in a production bundle even if
// VITE_ENABLE_ADMIN_PREVIEW is accidentally left set.
export const ADMIN_PREVIEW_ENABLED =
  import.meta.env.DEV === true && readBooleanFlag(import.meta.env.VITE_ENABLE_ADMIN_PREVIEW)

export const ADMIN_PREVIEW_USER = Object.freeze({
  id: 'admin-preview',
  fullName: 'Preview Admin',
  email: 'preview.admin@brightloop.demo',
  role: ROLES.ADMIN,
})
