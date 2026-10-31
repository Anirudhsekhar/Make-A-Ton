import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

const VARIANTS = {
  error: {
    icon: AlertCircle,
    wrapper: 'border-rose-200 bg-rose-50',
    iconClass: 'text-rose-600',
    titleClass: 'text-rose-900',
    bodyClass: 'text-rose-700',
    role: 'alert',
  },
  warning: {
    icon: AlertTriangle,
    wrapper: 'border-amber-200 bg-amber-50',
    iconClass: 'text-amber-600',
    titleClass: 'text-amber-900',
    bodyClass: 'text-amber-800',
    role: 'alert',
  },
  info: {
    icon: Info,
    wrapper: 'border-[#bae6fd] bg-[#f0f9ff]',
    iconClass: 'text-[#146c94]',
    titleClass: 'text-slate-900',
    bodyClass: 'text-slate-600',
    role: 'status',
  },
  success: {
    icon: CheckCircle2,
    wrapper: 'border-[#ccfbf1] bg-[#f0fdfa]',
    iconClass: 'text-[#0f766e]',
    titleClass: 'text-slate-900',
    bodyClass: 'text-slate-600',
    role: 'status',
  },
}

export default function AuthNotice({ variant = 'info', title, children, className = '' }) {
  const style = VARIANTS[variant] ?? VARIANTS.info
  const Icon = style.icon

  return (
    <div
      role={style.role}
      className={`flex gap-2.5 rounded-lg border px-3.5 py-3 ${style.wrapper} ${className}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.iconClass}`} aria-hidden="true" />
      <div className="min-w-0 space-y-0.5">
        {title && <p className="text-[13px] font-semibold text-slate-900">{title}</p>}
        <div className={`text-[12px] leading-relaxed ${style.bodyClass}`}>{children}</div>
      </div>
    </div>
  )
}
