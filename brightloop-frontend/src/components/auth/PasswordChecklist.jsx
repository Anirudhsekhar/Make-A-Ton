import { Check, Circle } from 'lucide-react'
import { getPasswordChecks } from '../../lib/validation'

export default function PasswordChecklist({ password }) {
  const checks = getPasswordChecks(password)
  const metCount = checks.filter((check) => check.met).length

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[12px] font-semibold text-slate-700">Password requirements</p>
        <div className="flex gap-1" aria-hidden="true">
          {checks.map((check) => (
            <span
              key={check.id}
              className={`h-1 w-5 rounded-full transition-colors duration-300 ${
                check.met ? 'bg-[#0f766e]' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>

      <ul className="grid gap-1.5 sm:grid-cols-2" aria-live="polite">
        {checks.map((check) => (
          <li
            key={check.id}
            className={`flex items-center gap-1.5 text-[12px] leading-snug transition-colors duration-200 ${
              check.met ? 'font-medium text-[#0f766e]' : 'text-slate-500'
            }`}
          >
            <span
              className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full ${
                check.met ? 'bg-[#0f766e]/10' : 'bg-slate-200'
              }`}
              aria-hidden="true"
            >
              {check.met ? (
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              ) : (
                <Circle className="h-2 w-2" />
              )}
            </span>
            {check.label}
            <span className="sr-only">{check.met ? 'met' : 'not met'}</span>
          </li>
        ))}
      </ul>

      <p className="sr-only" aria-live="polite">
        {metCount} of {checks.length} password requirements met.
      </p>
    </div>
  )
}
