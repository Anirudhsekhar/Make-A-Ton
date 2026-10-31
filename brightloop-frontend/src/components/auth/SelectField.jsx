import { AlertCircle, ChevronDown } from 'lucide-react'

export default function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  icon: Icon,
  error,
  hint,
  disabled = false,
  required = false,
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-1 text-[13px] font-semibold text-slate-900">
        {label}
        {required && (
          <span aria-hidden="true" className="text-rose-600">
            *
          </span>
        )}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
        )}
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`field-input pr-9 ${Icon ? 'pl-9' : ''} ${
            value ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
      </div>

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-[12px] font-medium text-rose-700"
        >
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0 text-rose-600" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[12px] leading-relaxed text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
