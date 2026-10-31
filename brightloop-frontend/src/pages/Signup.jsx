import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Briefcase, Loader2, Mail, UserRound, UserRoundPlus } from 'lucide-react'
import AuthHeader from '../components/auth/AuthHeader'
import AuthLayout from '../components/auth/AuthLayout'
import AuthNotice from '../components/auth/AuthNotice'
import FirebaseConfigNotice from '../components/auth/FirebaseConfigNotice'
import FormField from '../components/auth/FormField'
import GoogleButton from '../components/auth/GoogleButton'
import PasswordChecklist from '../components/auth/PasswordChecklist'
import PasswordInput from '../components/auth/PasswordInput'
import SelectField from '../components/auth/SelectField'
import { ROLE_HOME } from '../config/roles'
import { useAuth } from '../context/AuthContext'
import { isValidEmail, isStrongPassword } from '../lib/validation'

const BUSINESS_TYPES = [
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'student', label: 'Student' },
  { value: 'small-business', label: 'Small Business' },
  { value: 'startup', label: 'Startup' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'other', label: 'Other' },
]

function validateSignup(values) {
  const errors = {}
  const email = values.email.trim()

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.'
  }

  if (!email) {
    errors.email = 'Email address is required.'
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.businessType) {
    errors.businessType = 'Select your business type.'
  }

  if (!values.password) {
    errors.password = 'Create a password.'
  } else if (!isStrongPassword(values.password)) {
    errors.password = 'Your password must meet all four requirements.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export default function Signup() {
  const navigate = useNavigate()
  const { signUpCustomer, signUpWithGoogle, status, message } = useAuth()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    businessType: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [pendingNotice, setPendingNotice] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const sessionNotice =
    status === 'pending' || status === 'error'
      ? {
          variant: status === 'error' ? 'error' : 'warning',
          title: status === 'error' ? 'Account setup failed' : 'Account setup pending',
          message,
        }
      : null

  const notice = pendingNotice ?? sessionNotice
  const confirmMismatch =
    form.confirmPassword && form.confirmPassword !== form.password
      ? 'Passwords do not match.'
      : undefined

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
      navigate(ROLE_HOME[result.role] ?? '/customer/dashboard', { replace: true })
      return
    }

    if (result.reason === 'pending' || result.reason === 'error') {
      setPendingNotice({
        variant: result.reason === 'error' ? 'error' : 'warning',
        title: result.reason === 'error' ? 'Account setup failed' : 'Account setup pending',
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

    const errors = validateSignup(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    const result = await signUpCustomer({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      businessType: form.businessType,
      password: form.password,
    })
    setSubmitting(false)
    handleResult(result)
  }

  const handleGoogle = async () => {
    setFormError('')
    setPendingNotice(null)
    setGoogleLoading(true)
    const result = await signUpWithGoogle()
    setGoogleLoading(false)
    handleResult(result)
  }

  const busy = submitting || googleLoading

  return (
    <AuthLayout>
      <AuthHeader
        icon={UserRoundPlus}
        eyebrow="Customer accounts"
        title="Create your account"
        subtitle="Start managing plans and recurring billing in minutes."
      />

      <div className="mt-5">
        <AuthNotice variant="info" title="Customer sign-up only">
          Public sign-up creates Customer accounts. Admin and Internal Staff accounts are created
          by an administrator.
        </AuthNotice>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <FirebaseConfigNotice />

          {notice && (
            <AuthNotice variant={notice.variant} title={notice.title}>
              {notice.message}
            </AuthNotice>
          )}

          {formError && (
            <AuthNotice variant="error" title="Account creation failed">
              {formError}
            </AuthNotice>
          )}

          <FormField
            id="signup-name"
            label="Full name"
            type="text"
            value={form.fullName}
            onChange={updateField('fullName')}
            error={fieldErrors.fullName}
            icon={UserRound}
            placeholder="Jane Cooper"
            autoComplete="name"
            disabled={busy}
            required
          />

          <FormField
            id="signup-email"
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

          <SelectField
            id="signup-business-type"
            label="Business type"
            value={form.businessType}
            onChange={updateField('businessType')}
            error={fieldErrors.businessType}
            icon={Briefcase}
            options={BUSINESS_TYPES}
            placeholder="Select your business type"
            disabled={busy}
            required
          />

          <PasswordInput
            id="signup-password"
            label="Password"
            value={form.password}
            onChange={updateField('password')}
            error={fieldErrors.password}
            placeholder="Create a strong password"
            autoComplete="new-password"
            disabled={busy}
            required
          />

          <PasswordChecklist password={form.password} />

          <PasswordInput
            id="signup-confirm-password"
            label="Confirm password"
            value={form.confirmPassword}
            onChange={updateField('confirmPassword')}
            error={fieldErrors.confirmPassword || confirmMismatch}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            disabled={busy}
            required
          />

          <button type="submit" disabled={busy} aria-busy={submitting} className="btn-primary">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Creating account…
              </>
            ) : (
              <>
                Create account
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

        <GoogleButton
          onClick={handleGoogle}
          loading={googleLoading}
          disabled={busy}
          label="Sign up with Google"
        />

        <p className="mt-6 text-center text-[13px] text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="rounded font-semibold text-[#146c94] transition-colors hover:text-[#0e4d6a] hover:underline"
          >
            Sign in
          </Link>
        </p>
    </AuthLayout>
  )
}
