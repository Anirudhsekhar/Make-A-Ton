import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Loader2,
  Mail,
  MailCheck,
  Send,
  ShieldCheck,
} from 'lucide-react'
import AuthHeader from '../components/auth/AuthHeader'
import AuthLayout from '../components/auth/AuthLayout'
import AuthNotice from '../components/auth/AuthNotice'
import FirebaseConfigNotice from '../components/auth/FirebaseConfigNotice'
import FormField from '../components/auth/FormField'
import { useAuth } from '../context/AuthContext'
import { isValidEmail } from '../lib/validation'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleChange = (event) => {
    setEmail(event.target.value)
    setFieldError('')
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFieldError('')
    setFormError('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setFieldError('Email address is required.')
      return
    }
    if (!isValidEmail(trimmedEmail)) {
      setFieldError('Enter a valid email address.')
      return
    }

    setSubmitting(true)
    const result = await resetPassword(trimmedEmail)
    setSubmitting(false)

    if (!result.ok) {
      setFormError(result.message)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout>
        <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-lg border border-[#ccfbf1] bg-[#f0fdfa]">
            <MailCheck className="h-7 w-7 text-[#0f766e]" aria-hidden="true" />
          </div>

          <h1 className="mt-5 font-display text-[30px] font-medium leading-tight tracking-[-0.015em] text-slate-900">
            Check your inbox
          </h1>
          <p className="mt-2.5 max-w-[340px] text-[13.5px] leading-relaxed text-slate-500">
            If an account exists for{' '}
            <span className="font-semibold text-slate-900">{email.trim()}</span>, a password reset
            link is on its way. It may take a minute to arrive.
          </p>

          <Link to="/login" className="btn-primary mt-7">
            Back to sign in
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-4 rounded text-[12.5px] font-semibold text-[#146c94] transition-colors hover:text-[#0e4d6a] hover:underline"
          >
            Use a different email
          </button>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          For your security, account existence is never revealed.
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthHeader
        icon={KeyRound}
        eyebrow="Account recovery"
        title="Reset your password"
        subtitle="Enter your account email and we'll send you a secure reset link."
      />

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
        <FirebaseConfigNotice />

        {formError && (
          <AuthNotice variant="error" title="Reset link not sent">
            {formError}
          </AuthNotice>
        )}

        <FormField
          id="forgot-email"
          label="Work email address"
          type="email"
          value={email}
          onChange={handleChange}
          error={fieldError}
          icon={Mail}
          placeholder="you@company.com"
          autoComplete="email"
          inputMode="email"
          disabled={submitting}
          required
        />

        <p className="flex items-start gap-1.5 text-[12px] leading-relaxed text-slate-500">
          <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          For your security, we never confirm whether an email is registered with Brightloop.
        </p>

        <button type="submit" disabled={submitting} aria-busy={submitting} className="btn-primary">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending reset link…
            </>
          ) : (
            <>
              Send reset link
              <Send className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className="mt-7 flex justify-center border-t border-slate-200 pt-5">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 rounded text-[13px] font-semibold text-[#146c94] transition-colors hover:text-[#0e4d6a] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        Reset links are handled securely by Firebase Authentication.
      </p>
    </AuthLayout>
  )
}
