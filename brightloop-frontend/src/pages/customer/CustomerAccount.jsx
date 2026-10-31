import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  LogOut,
  Save,
  ShieldCheck,
} from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
import { AdminInput, AdminSelect } from '../../components/admin/AdminField'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { AdminErrorState, AdminLoadingState } from '../../components/admin/AdminState'
import Panel from '../../components/admin/Panel'
import SampleDataBadge from '../../components/admin/SampleDataBadge'
import PasswordChecklist from '../../components/auth/PasswordChecklist'
import CustomerDemoNotice from '../../components/customer/CustomerDemoNotice'
import { useAuth } from '../../context/AuthContext'
import { useCustomerPortal } from '../../context/CustomerPortalContext'
import { BUSINESS_TYPE_OPTIONS } from '../../data/customer/customerDemoData'
import { getInitials } from '../../lib/adminFormat'
import { formatDate } from '../../lib/customerFormat'
import { isStrongPassword, isValidEmail } from '../../lib/validation'

const EMPTY_PASSWORD_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

function Feedback({ tone, children }) {
  const success = tone === 'success'
  return (
    <div
      role={success ? 'status' : 'alert'}
      className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 ${
        success
          ? 'border-[#ccfbf1] bg-[#f0fdfa] text-slate-700'
          : 'border-rose-200 bg-rose-50 text-rose-800'
      }`}
    >
      {success ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0f766e]" aria-hidden="true" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
      )}
      <p className="min-w-0 flex-1 text-[12px] leading-relaxed">{children}</p>
    </div>
  )
}

function validateProfile(form) {
  const errors = {}
  if (!form.fullName.trim() || form.fullName.trim().length < 2) {
    errors.fullName = 'Enter your full name.'
  }
  if (!form.email.trim()) errors.email = 'Email is required.'
  else if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address.'
  if (!form.businessType) errors.businessType = 'Select your business type.'
  if (form.phoneNumber.trim() && form.phoneNumber.replace(/\D/g, '').length < 7) {
    errors.phoneNumber = 'Enter a valid phone number with at least 7 digits.'
  }
  return errors
}

export default function CustomerAccount() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const {
    demo,
    status,
    error,
    profile,
    saveProfile,
    changePassword,
    reload,
  } = useCustomerPortal()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    businessType: '',
    phoneNumber: '',
    companyName: '',
    currentPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [profileFeedback, setProfileFeedback] = useState(null)

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM)
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState(null)

  useEffect(() => {
    if (!profile) return
    setForm({
      fullName: profile.fullName ?? '',
      email: profile.email ?? '',
      businessType: profile.businessType ?? '',
      phoneNumber: profile.phoneNumber ?? '',
      companyName: profile.companyName ?? '',
      currentPassword: '',
    })
  }, [profile])

  const emailChanged =
    Boolean(profile?.email) &&
    form.email.trim().toLowerCase() !== String(profile.email).trim().toLowerCase()

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validateProfile(form)
    if (emailChanged && !demo && !form.currentPassword) {
      nextErrors.currentPassword = 'Enter your current password to change your sign-in email.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    setProfileFeedback(null)
    const result = await saveProfile(form)
    setSaving(false)
    setProfileFeedback({ tone: result.ok ? 'success' : 'error', message: result.message })
    if (result.ok) {
      setForm((current) => ({ ...current, currentPassword: '' }))
      setErrors({})
    }
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswordForm((current) => ({ ...current, [name]: value }))
    setPasswordErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!passwordForm.currentPassword) {
      nextErrors.currentPassword = 'Enter your current password.'
    }
    if (!isStrongPassword(passwordForm.newPassword)) {
      nextErrors.newPassword = 'Choose a password that meets every requirement.'
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      nextErrors.newPassword = 'Choose a password different from your current password.'
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors)
      return
    }

    setPasswordSaving(true)
    setPasswordFeedback(null)
    const result = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
    setPasswordSaving(false)
    setPasswordFeedback({ tone: result.ok ? 'success' : 'error', message: result.message })
    if (result.ok) {
      setPasswordForm(EMPTY_PASSWORD_FORM)
      setPasswordErrors({})
    }
  }

  const handleLogout = async () => {
    if (demo) {
      navigate('/login')
      return
    }
    await logout()
    navigate('/login', { replace: true })
  }

  const displayName = profile?.fullName || (demo ? 'Demo customer' : 'Customer')
  const loading = status === 'loading' && !profile

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Customer portal"
        title="My Account"
        description="Keep your contact details current and manage the security of your Brightloop sign-in."
        actions={
          <>
            {demo && <SampleDataBadge className="hidden sm:inline-flex" />}
            <AdminButton variant="danger" icon={LogOut} onClick={handleLogout}>
              {demo ? 'Exit demo' : 'Log out'}
            </AdminButton>
          </>
        }
      />

      {loading ? (
        <Panel bodyClassName="p-0">
          <AdminLoadingState label="Loading your profile…" />
        </Panel>
      ) : status === 'error' && !profile ? (
        <Panel bodyClassName="p-0">
          <AdminErrorState
            title="Profile could not be loaded"
            description={error || 'The customer profile service did not return a response.'}
            onRetry={reload}
          />
        </Panel>
      ) : (
        <>
          {profileFeedback && (
            <Feedback tone={profileFeedback.tone}>{profileFeedback.message}</Feedback>
          )}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <Panel
              title="Profile details"
              description="These details are shown on your subscriptions and invoices."
            >
              <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminInput
                    id="customer-full-name"
                    name="fullName"
                    label="Full name"
                    required
                    value={form.fullName}
                    onChange={handleProfileChange}
                    error={errors.fullName}
                    autoComplete="name"
                  />
                  <AdminInput
                    id="customer-company"
                    name="companyName"
                    label="Company name"
                    value={form.companyName}
                    onChange={handleProfileChange}
                    error={errors.companyName}
                    autoComplete="organization"
                  />
                  <AdminInput
                    id="customer-email"
                    name="email"
                    type="email"
                    label="Email"
                    required
                    value={form.email}
                    onChange={handleProfileChange}
                    error={errors.email}
                    autoComplete="email"
                    hint={
                      demo
                        ? 'Demo only: email changes stay local.'
                        : 'Changing email requires your current password and Firebase verification.'
                    }
                  />
                  <AdminSelect
                    id="customer-business-type"
                    name="businessType"
                    label="Business type"
                    required
                    value={form.businessType}
                    onChange={handleProfileChange}
                    error={errors.businessType}
                  >
                    <option value="">Select your business type</option>
                    {BUSINESS_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </AdminSelect>
                  <AdminInput
                    id="customer-phone"
                    name="phoneNumber"
                    type="tel"
                    label="Phone number"
                    value={form.phoneNumber}
                    onChange={handleProfileChange}
                    error={errors.phoneNumber}
                    autoComplete="tel"
                  />
                  {emailChanged && !demo && (
                    <AdminInput
                      id="customer-email-password"
                      name="currentPassword"
                      type="password"
                      label="Current password"
                      required
                      value={form.currentPassword}
                      onChange={handleProfileChange}
                      error={errors.currentPassword}
                      autoComplete="current-password"
                      hint="Required to reauthenticate before changing your Firebase sign-in email."
                    />
                  )}
                </div>

                {emailChanged && demo && (
                  <p className="rounded border border-[#bae6fd] bg-[#f0f9ff] px-3 py-2 text-[11.5px] leading-relaxed text-slate-600">
                    In production, changing your email triggers Firebase reauthentication and
                    verification. This demo only updates local sample data.
                  </p>
                )}

                <div className="flex justify-end border-t border-[#f1f5f9] pt-4">
                  <AdminButton
                    type="submit"
                    variant="primary"
                    icon={Save}
                    disabled={saving}
                  >
                    {saving ? 'Saving…' : 'Save profile'}
                  </AdminButton>
                </div>
              </form>
            </Panel>

            <div className="space-y-4">
              <Panel title="Account summary">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-slate-200 bg-[#f8fafc] text-[14px] font-semibold text-[#146c94]">
                    {getInitials(displayName)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-slate-900">
                      {displayName}
                    </p>
                    <p className="truncate text-[11.5px] text-slate-500">
                      {form.email || profile?.email || 'No email'}
                    </p>
                  </div>
                </div>
                <dl className="mt-4 space-y-2.5 text-[12px]">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-500">Role</dt>
                    <dd className="inline-flex items-center gap-1 font-semibold text-[#0f766e]">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Customer
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-500">Business type</dt>
                    <dd className="font-medium text-slate-700">
                      {BUSINESS_TYPE_OPTIONS.find((item) => item.value === form.businessType)
                        ?.label ?? '—'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-500">Member since</dt>
                    <dd className="font-medium text-slate-700 tabular-nums">
                      {formatDate(profile?.createdAt)}
                    </dd>
                  </div>
                </dl>
              </Panel>

              <Panel title="Session" description="Signing out always uses the existing auth flow.">
                <p className="text-[12px] leading-relaxed text-slate-600">
                  {demo
                    ? 'Demo sessions never call Firebase sign-out. Exiting takes you back to the login page.'
                    : 'Signing out ends your Firebase session and returns you to the login page.'}
                </p>
                <AdminButton className="mt-3" icon={LogOut} onClick={handleLogout}>
                  {demo ? 'Exit demo' : 'Log out'}
                </AdminButton>
              </Panel>
            </div>
          </div>

          <Panel
            title="Change password"
            description="Passwords are never stored in this portal or in mock profile data."
          >
            {passwordFeedback && (
              <div className="mb-4">
                <Feedback tone={passwordFeedback.tone}>{passwordFeedback.message}</Feedback>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminInput
                  id="customer-current-password"
                  name="currentPassword"
                  type="password"
                  label="Current password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  error={passwordErrors.currentPassword}
                  autoComplete="current-password"
                />
                <div className="hidden sm:block" />
                <AdminInput
                  id="customer-new-password"
                  name="newPassword"
                  type="password"
                  label="New password"
                  required
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  error={passwordErrors.newPassword}
                  autoComplete="new-password"
                />
                <AdminInput
                  id="customer-confirm-password"
                  name="confirmPassword"
                  type="password"
                  label="Confirm new password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  error={passwordErrors.confirmPassword}
                  autoComplete="new-password"
                />
              </div>

              <PasswordChecklist password={passwordForm.newPassword} />

              <div className="flex flex-col gap-2 border-t border-[#f1f5f9] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-[11.5px] leading-relaxed text-slate-500">
                  {demo
                    ? 'Demo mode simulates a successful password change. No password is stored, logged or sent to a server.'
                    : 'Production password changes reauthenticate with Firebase before updating the credential.'}
                </p>
                <AdminButton
                  type="submit"
                  variant="primary"
                  icon={KeyRound}
                  disabled={passwordSaving}
                >
                  {passwordSaving ? 'Updating…' : 'Update password'}
                </AdminButton>
              </div>
            </form>
          </Panel>

          <CustomerDemoNotice demo={demo}>
            Demo profile edits and password changes are local simulations. In production, email and
            password changes use Firebase reauthentication and verification, while other profile
            fields must be saved through the authenticated customer API.
          </CustomerDemoNotice>
        </>
      )}
    </div>
  )
}
