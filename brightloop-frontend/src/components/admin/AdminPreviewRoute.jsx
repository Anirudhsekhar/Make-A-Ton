import { ROLES } from '../../config/roles'
import ProtectedRoute from '../auth/ProtectedRoute'

export default function AdminPreviewRoute() {
  return <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />
}
