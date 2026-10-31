import { AlertCircle, ChevronDown } from 'lucide-react'

const CONTROL_BASE =
  'w-full rounded border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#146c94] focus:ring-1 focus:ring-[#146c94] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60'

function FieldLabel({ id, label, required }) {
  return (
    <label htmlFor={id} className="flex items-center gap-1 text-[12.5px] font-semibold text-slate-900">
      {label}
      {required && (
        <span aria-hidden="true" className="text-rose-600">
          *
        </span>
      )}
    </label>
  )
}

function FieldMessage({ id, error, hint }) {
  if (error) {
    return (
      <p
        id={`${id}-error`}
        role="alert"
        className="flex items-start gap-1.5 text-[11.5px] font-medium text-rose-700"
      >
        <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0 text-rose-600" aria-hidden="true" />
        {error}
      </p>
    )
  }
  if (hint) {
    return (
      <p id={`${id}-hint`} className="text-[11.5px] leading-relaxed text-slate-500">
        {hint}
      </p>
    )
  }
  return null
}

function describedBy(id, error, hint) {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}

export function AdminInput({
  id,
  label,
  error,
  hint,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel id={id} label={label} required={required} />
      <input
        id={id}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${CONTROL_BASE} h-9 ${error ? 'border-rose-400' : ''} ${className}`}
        {...props}
      />
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  )
}

export function AdminSelect({
  id,
  label,
  error,
  hint,
  required = false,
  className = '',
  children,
  ...props
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel id={id} label={label} required={required} />
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`${CONTROL_BASE} h-9 appearance-none pr-8 ${error ? 'border-rose-400' : ''} ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
      </div>
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  )
}

export function AdminTextarea({
  id,
  label,
  error,
  hint,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel id={id} label={label} required={required} />
      <textarea
        id={id}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${CONTROL_BASE} min-h-[84px] resize-y py-2 ${error ? 'border-rose-400' : ''} ${className}`}
        {...props}
      />
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  )
}

export function AdminCheckbox({ id, label, description, checked, onChange, disabled = false }) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-2.5 rounded border border-slate-200 bg-white px-3 py-2.5 transition-colors hover:bg-[#f8fafc] ${
        disabled ? 'cursor-not-allowed opacity-60' : ''
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#146c94]"
      />
      <span className="min-w-0">
        <span className="block text-[12.5px] font-semibold text-slate-900">{label}</span>
        {description && (
          <span className="mt-0.5 block text-[11.5px] leading-relaxed text-slate-500">
            {description}
          </span>
        )}
      </span>
    </label>
  )
}
