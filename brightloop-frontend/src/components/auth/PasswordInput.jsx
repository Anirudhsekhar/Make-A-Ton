import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import FormField from './FormField'

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  autoComplete = 'current-password',
  placeholder = 'Enter your password',
  disabled = false,
  required = false,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <FormField
      id={id}
      label={label}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      error={error}
      hint={hint}
      icon={Lock}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={disabled}
      required={required}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      }
    />
  )
}
