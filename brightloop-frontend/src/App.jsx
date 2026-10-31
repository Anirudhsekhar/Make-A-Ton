import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/admin/AdminLayout'
import AdminPreviewRoute from './components/admin/AdminPreviewRoute'
import ProtectedRoute from './components/auth/ProtectedRoute'
import CustomerLayout from './components/customer/CustomerLayout'
import { DEMO_MODE_ENABLED } from './config/demoMode'
import { ROLES } from './config/roles'
import DashboardPlaceholder from './pages/DashboardPlaceholder'
import ForgotPassword from './pages/ForgotPassword'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDiscounts from './pages/admin/AdminDiscounts'
import AdminOverview from './pages/admin/AdminOverview'
import AdminPlans from './pages/admin/AdminPlans'
import AdminProducts from './pages/admin/AdminProducts'
import AdminStaff from './pages/admin/AdminStaff'
import AdminTaxes from './pages/admin/AdminTaxes'
import CustomerAccount from './pages/customer/CustomerAccount'
import CustomerInvoiceDetail from './pages/customer/CustomerInvoiceDetail'
import CustomerInvoices from './pages/customer/CustomerInvoices'
import CustomerOverview from './pages/customer/CustomerOverview'
import CustomerSubscriptionDetail from './pages/customer/CustomerSubscriptionDetail'
import CustomerSubscriptions from './pages/customer/CustomerSubscriptions'

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
          <Route path="staff" element={<AdminStaff />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="taxes" element={<AdminTaxes />} />
          <Route path="discounts" element={<AdminDiscounts />} />
        </Route>
      </Route>

      {DEMO_MODE_ENABLED && (
        <Route path="/demo/admin" element={<AdminLayout demo />}>
          <Route index element={<Navigate to="/demo/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="taxes" element={<AdminTaxes />} />
          <Route path="discounts" element={<AdminDiscounts />} />
        </Route>
      )}

      {DEMO_MODE_ENABLED && (
        <Route path="/demo/customer" element={<CustomerLayout demo />}>
          <Route index element={<Navigate to="/demo/customer/dashboard" replace />} />
          <Route path="dashboard" element={<CustomerOverview />} />
          <Route path="subscriptions" element={<CustomerSubscriptions />} />
          <Route path="subscriptions/:subscriptionId" element={<CustomerSubscriptionDetail />} />
          <Route path="invoices" element={<CustomerInvoices />} />
          <Route path="invoices/:invoiceId" element={<CustomerInvoiceDetail />} />
          <Route path="account" element={<CustomerAccount />} />
        </Route>
      )}

      <Route element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]} />}>
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="dashboard" element={<CustomerOverview />} />
          <Route path="subscriptions" element={<CustomerSubscriptions />} />
          <Route path="subscriptions/:subscriptionId" element={<CustomerSubscriptionDetail />} />
          <Route path="invoices" element={<CustomerInvoices />} />
          <Route path="invoices/:invoiceId" element={<CustomerInvoiceDetail />} />
          <Route path="account" element={<CustomerAccount />} />
        </Route>
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
