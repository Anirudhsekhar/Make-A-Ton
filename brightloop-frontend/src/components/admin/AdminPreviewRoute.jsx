import { Outlet } from 'react-router-dom'
import { ADMIN_PREVIEW_ENABLED } from '../../config/adminPreview'
import { ROLES } from '../../config/roles'
import ProtectedRoute from '../auth/ProtectedRoute'

export default function AdminPreviewRoute() {
  if (ADMIN_PREVIEW_ENABLED) {
    return <Outlet />
  }

  return <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />
}
