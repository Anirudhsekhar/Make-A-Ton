import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2, LogOut, RefreshCw, ShieldAlert, ShieldX } from 'lucide-react'
import Brand from '../../components/Brand'
import AccessStatusScreen from '../../components/auth/AccessStatusScreen'
import { ADMIN_PREVIEW_ENABLED } from '../../config/adminPreview'
import { ROLE_HOME, ROLE_LABELS, ROLES, isKnownRole } from '../../config/roles'
import { useAuth } from '../../context/AuthContext'

function SessionLoader() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="art-grid absolute inset-0 opacity-30" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-loop/15 blur-[100px]" />
      </div>
      <div className="relative z-10">
        <Brand />
      </div>
      <div className="relative z-10 flex items-center gap-2.5 text-[12px] font-medium text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin text-loop-bright" aria-hidden="true" />
        Verifying your secure session…
      </div>
    </div>
  )
}

export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation()
  const { status, role, message, refreshProfile, logout } = useAuth()

  const isAdminArea =
    location.pathname === '/admin' || location.pathname.startsWith('/admin/')

  if (ADMIN_PREVIEW_ENABLED && (allowedRoles.includes(ROLES.ADMIN) || isAdminArea)) {
    return <Outlet />
  }

  if (status === 'loading' || status === 'resolving') {
    return <SessionLoader />
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (status === 'pending' || status === 'error') {
    return (
      <AccessStatusScreen
        icon={ShieldAlert}
        tone={status === 'error' ? 'error' : 'warning'}
        eyebrow="Access locked"
        title="Verified profile required"
        description={
          message ||
          'Firebase sign-in succeeded, but Brightloop could not verify a trusted account profile. Dashboard access stays locked until that profile service is connected.'
        }
      >
        <button type="button" onClick={refreshProfile} className="btn-primary">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry verification
        </button>
        <button type="button" onClick={() => logout()} className="btn-secondary">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
        <p className="pt-1 text-[10.5px] leading-relaxed text-slate-500">
          A successful Firebase login never grants permissions by itself. Only a role returned by
          the trusted profile service can unlock this area.
        </p>
      </AccessStatusScreen>
    )
  }

  if (!role || !isKnownRole(role)) {
    return (
      <AccessStatusScreen
        icon={ShieldX}
        tone="error"
        title="Role could not be verified"
        description="Your account profile does not contain a recognized Brightloop role. Contact your administrator before trying again."
      >
        <button type="button" onClick={() => logout()} className="btn-primary">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </AccessStatusScreen>
    )
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const allowedLabel = allowedRoles.map((item) => ROLE_LABELS[item] ?? item).join(' or ')

    return (
      <AccessStatusScreen
        icon={ShieldX}
        tone="error"
        title="You don't have access to this area"
        description={`Your verified role is ${ROLE_LABELS[role]}. This workspace is reserved for ${allowedLabel} accounts.`}
      >
        <Link to={ROLE_HOME[role] ?? '/login'} className="btn-primary">
          Go to my workspace
        </Link>
        <button type="button" onClick={() => logout()} className="btn-secondary">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </AccessStatusScreen>
    )
  }

  return <Outlet />
}
