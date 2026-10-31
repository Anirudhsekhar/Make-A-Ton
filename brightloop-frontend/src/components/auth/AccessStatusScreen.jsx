import { AlertTriangle, ShieldCheck } from 'lucide-react'
import Brand from '../Brand'

const TONES = {
  warning: {
    icon: 'bg-amber-400/10 text-amber-400 ring-amber-400/20',
    glow: 'bg-amber-400/10',
  },
  error: {
    icon: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',
    glow: 'bg-rose-500/10',
  },
  info: {
    icon: 'bg-[#f0f9ff] text-[#146c94] ring-[#bae6fd]',
    glow: 'bg-[#bae6fd]/40',
  },
}

export default function AccessStatusScreen({
  icon: Icon = AlertTriangle,
  tone = 'warning',
  eyebrow = 'Protected area',
  title,
  description,
  children,
}) {
  const style = TONES[tone] ?? TONES.warning

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden px-5 py-7 sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="art-grid absolute inset-0 opacity-40" />
        <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-loop/15 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-aqua/[0.07] blur-[120px]" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <Brand />
        <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          <ShieldCheck className="h-3 w-3 text-[#146c94]" aria-hidden="true" />
          {eyebrow}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center py-10">
        <div className="auth-card w-full max-w-[440px] p-7 text-center sm:p-9">
          <div
            className={`relative mx-auto mb-5 grid h-16 w-16 place-items-center rounded-[22px] ring-1 ring-inset ${style.icon}`}
          >
            <Icon className="h-7 w-7" aria-hidden="true" />
            <span
              aria-hidden="true"
              className={`absolute -inset-2 -z-10 rounded-[28px] blur-xl ${style.glow}`}
            />
          </div>

          <h1 className="font-display text-[26px] font-medium leading-tight tracking-[-0.015em] text-slate-900">
            {title}
          </h1>
          <p className="mx-auto mt-2.5 max-w-[340px] text-[13px] leading-relaxed text-slate-500">
            {description}
          </p>

          {children && <div className="mt-6 space-y-3">{children}</div>}
        </div>
      </div>

      <p className="relative z-10 text-center text-[11px] text-slate-600">
        Brightloop never grants access from a selected role or client-side storage.
      </p>
    </div>
  )
}
