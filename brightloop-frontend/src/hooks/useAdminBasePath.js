import { useLocation } from 'react-router-dom'
import { DEMO_ADMIN_BASE } from '../config/demoMode'

export function useAdminBasePath() {
  const { pathname } = useLocation()
  return pathname.startsWith(DEMO_ADMIN_BASE) ? DEMO_ADMIN_BASE : '/admin'
}
