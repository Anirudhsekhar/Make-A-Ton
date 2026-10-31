import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, LogIn, Mail, ShieldCheck } from 'lucide-react'
import AuthHeader from '../components/auth/AuthHeader'
import AuthLayout from '../components/auth/AuthLayout'
import AuthNotice from '../components/auth/AuthNotice'
import FirebaseConfigNotice from '../components/auth/FirebaseConfigNotice'
import FormField from '../components/auth/FormField'
import GoogleButton from '../components/auth/GoogleButton'
import PasswordInput from '../components/auth/PasswordInput'
import RoleSelect from '../components/auth/RoleSelect'
import { ROLE_HOME } from '../config/roles'
import { useAuth } from '../context/AuthContext'
import { isValidEmail } from '../lib/validation'

function validateLogin(values) {
  const errors = {}
  const email = values.email.trim()

  if (!email) {
    errors.email = 'Email address is required.'
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  }

  if (!values.role) {
    errors.role = 'Select the role you use to access Brightloop.'
  }

  return errors
}

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, status, message } = useAuth()

  const [form, setForm] = useState({ email: '', password: '', role: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [pendingNotice, setPendingNotice] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const sessionNotice =
    status === 'pending' || status === 'error'
      ? {
          variant: status === 'error' ? 'error' : 'warning',
          title: status === 'error' ? 'Access could not be verified' : 'Verified access pending',
          message,
        }
      : null

  const notice = pendingNotice ?? sessionNotice

  const updateField = (field) => (event) => {
    const { value } = event.target
    setForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
    setFormError('')
    setPendingNotice(null)
  }

  const handleResult = (result) => {
    if (result.ok) {
      navigate(ROLE_HOME[result.role] ?? '/login', { replace: true })
      return
    }

    if (result.reason === 'pending' || result.reason === 'error') {
      setPendingNotice({
        variant: result.reason === 'error' ? 'error' : 'warning',
        title: result.reason === 'error' ? 'Access could not be verified' : 'Verified access pending',
        message: result.message,
      })
      return
    }

    setFormError(result.message)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setPendingNotice(null)

    const errors = validateLogin(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    const result = await signIn({
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    })
    setSubmitting(false)
    handleResult(result)
  }

  const handleGoogle = async () => {
    setFormError('')
    setPendingNotice(null)

    if (!form.role) {
      setFieldErrors((current) => ({
        ...current,
        role: 'Select your role before continuing with Google.',
      }))
      return
    }

    setGoogleLoading(true)
    const result = await signInWithGoogle(form.role)
    setGoogleLoading(false)
    handleResult(result)
  }

  const busy = submitting || googleLoading

  return (
    <AuthLayout>
      <AuthHeader
        icon={LogIn}
        eyebrow="Welcome back"
        title="Sign in to Brightloop"
        subtitle="Manage plans, billing and customers from one calm workspace."
      />

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
        <FirebaseConfigNotice />

        {notice && (
          <AuthNotice variant={notice.variant} title={notice.title}>
            {notice.message}
          </AuthNotice>
        )}

        {formError && (
          <AuthNotice variant="error" title="Sign-in failed">
            {formError}
          </AuthNotice>
        )}

        <FormField
          id="login-email"
          label="Email address"
          type="email"
          value={form.email}
          onChange={updateField('email')}
          error={fieldErrors.email}
          icon={Mail}
          placeholder="you@company.com"
          autoComplete="email"
          inputMode="email"
          disabled={busy}
          required
        />

        <PasswordInput
          id="login-password"
          label="Password"
          value={form.password}
          onChange={updateField('password')}
          error={fieldErrors.password}
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={busy}
          required
        />

        <div className="-mt-1 flex justify-end">
          <Link
            to="/forgot-password"
            className="rounded text-[12.5px] font-semibold text-[#146c94] transition-colors hover:text-[#0e4d6a] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <RoleSelect
          id="login-role"
          label="Sign in as"
          value={form.role}
          onChange={updateField('role')}
          error={fieldErrors.role}
          hint="Your role never grants access on its own. Brightloop verifies it against your trusted account profile after sign-in."
          disabled={busy}
          required
        />

        <button type="submit" disabled={busy} aria-busy={submitting} className="btn-primary">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            or
          </span>
        </div>
      </div>

      <GoogleButton onClick={handleGoogle} loading={googleLoading} disabled={busy} />

      <p className="mt-6 text-center text-[13px] text-slate-500">
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          className="rounded font-semibold text-[#146c94] transition-colors hover:text-[#0e4d6a] hover:underline"
        >
          Create account
        </Link>
      </p>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        Role access is verified after authentication.
      </p>
    </AuthLayout>
  )
}
