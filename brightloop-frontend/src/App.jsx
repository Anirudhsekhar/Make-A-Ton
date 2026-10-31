import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { ROLES } from './config/roles'
import DashboardPlaceholder from './pages/DashboardPlaceholder'
import ForgotPassword from './pages/ForgotPassword'
import Login from './pages/Login'
import Signup from './pages/Signup'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route
          path="/admin/dashboard"
          element={
            <DashboardPlaceholder
              title="Admin"
              description="Manage plans, customers, staff access and platform-wide billing operations from one control center."
            />
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]} />}>
        <Route
          path="/customer/dashboard"
          element={
            <DashboardPlaceholder
              title="Customer"
              description="View your subscription plan, invoices, payment methods and billing history."
            />
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.STAFF]} />}>
        <Route
          path="/staff/dashboard"
          element={
            <DashboardPlaceholder
              title="Internal Staff"
              description="Support customers, review subscriptions and resolve billing requests."
            />
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
