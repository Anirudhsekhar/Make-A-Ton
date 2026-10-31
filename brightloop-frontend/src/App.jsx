import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/admin/AdminLayout'
import AdminPreviewRoute from './components/admin/AdminPreviewRoute'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { ROLES } from './config/roles'
import DashboardPlaceholder from './pages/DashboardPlaceholder'
import ForgotPassword from './pages/ForgotPassword'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminModulePlaceholder from './pages/admin/AdminModulePlaceholder'
import AdminOverview from './pages/admin/AdminOverview'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<AdminPreviewRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminOverview />} />
          <Route
            path="staff"
            element={
              <AdminModulePlaceholder
                title="Staff"
                description="Invite internal staff, manage access and keep support roles current."
              />
            }
          />
          <Route
            path="products"
            element={
              <AdminModulePlaceholder
                title="Products"
                description="Define services, software and add-ons, including their variants and pricing."
              />
            }
          />
          <Route
            path="plans"
            element={
              <AdminModulePlaceholder
                title="Plans"
                description="Build billing plans, connect them to products and control availability."
              />
            }
          />
          <Route
            path="taxes"
            element={
              <AdminModulePlaceholder
                title="Taxes"
                description="Maintain tax rules and keep billing calculations consistent."
              />
            }
          />
          <Route
            path="discounts"
            element={
              <AdminModulePlaceholder
                title="Discounts"
                description="Create discount codes with clear limits, scopes and validity windows."
              />
            }
          />
        </Route>
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
