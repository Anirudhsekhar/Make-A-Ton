import { ADMIN_PREVIEW_USER } from './adminPreview'

// Vite compiles `import.meta.env.DEV` to `false` in production builds, so the
// demo routes are removed from production bundles and never bypass auth there.
export const DEMO_MODE_ENABLED = import.meta.env.DEV

export const DEMO_ADMIN_BASE = '/demo/admin'

export const DEMO_ADMIN_USER = ADMIN_PREVIEW_USER

export function toDemoPath(path) {
  return path.replace(/^\/admin/, DEMO_ADMIN_BASE)
}

export function fromDemoPath(pathname) {
  return pathname.replace(/^\/demo/, '')
}
