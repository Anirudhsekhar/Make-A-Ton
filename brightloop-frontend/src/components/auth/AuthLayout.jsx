import {
  BarChart3,
  CheckCircle2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  ShieldQuestion,
} from 'lucide-react'
import Brand from '../Brand'

const FEATURES = [
  {
    icon: RefreshCw,
    title: 'Recurring billing, automated',
    description: 'Invoices and payment retries run on schedule.',
  },
  {
    icon: BarChart3,
    title: 'Revenue clarity in real time',
    description: 'Track MRR, churn and growth at a glance.',
  },
  {
    icon: ShieldCheck,
    title: 'Access you can trust',
    description: 'Every role is verified against your profile.',
  },
]

const CHART_BARS = [34, 52, 41, 66, 49, 78, 62, 88]

function SignalCard() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          Network anomaly filter
        </p>
        <p className="text-[12px] font-semibold tabular-nums text-emerald-700">
          99.998% <span className="font-medium text-emerald-700/80">Clean</span>
        </p>
      </div>
      <div className="mt-3 flex h-8 items-end gap-1.5">
        {CHART_BARS.map((height, index) => (
          <span
            key={`${height}-${index}`}
            className={`flex-1 rounded-sm ${
              index === CHART_BARS.length - 1 ? 'bg-[#146c94]' : 'bg-[#c6e7ff]'
            }`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function AuthLayout({ children }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-6 sm:px-6 lg:px-10 xl:px-14">
      <div className="flex items-center justify-between">
        <Brand />
        <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.02em] text-slate-600">
          <LockKeyhole className="h-3 w-3 text-[#146c94]" aria-hidden="true" />
          Encrypted authentication
        </span>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-6 lg:mt-8 lg:grid lg:grid-cols-[0.82fr_1.18fr] xl:gap-8">
        <aside className="relative hidden flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] lg:flex xl:p-10">
          <div className="flex items-start justify-between gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-lg border border-[#bae6fd] bg-[#f0f9ff]">
              <ShieldCheck className="h-5 w-5 text-[#146c94]" aria-hidden="true" />
            </span>
            <span className="inline-flex items-center rounded border border-slate-200 bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.03em] text-slate-600">
              Tier-1 Security
            </span>
          </div>

          <div className="mt-7 flex flex-1 flex-col justify-center">
            <h1 className="font-display text-[clamp(2rem,2.6vw,2.75rem)] font-medium leading-[1.12] tracking-[-0.02em] text-slate-900">
              Subscriptions, simplified.
            </h1>
            <p className="mt-3 max-w-[400px] text-[14px] leading-relaxed text-slate-500">
              One powerful platform to manage plans, recurring billing, and business growth.
            </p>

            <ul className="mt-8 max-w-[440px] space-y-4">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#146c94]" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold leading-snug text-slate-900">{title}</p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-500">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-9 max-w-[440px]">
              <SignalCard />
            </div>
          </div>

          <div className="mt-9 flex items-start gap-3 rounded-lg bg-[#eaf1f9] px-4 py-3.5">
            <ShieldQuestion className="mt-0.5 h-4 w-4 shrink-0 text-[#0f766e]" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-semibold text-slate-900">Trusted workspace access</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">
                Role privileges are cryptographically verified after every authentication attempt.
              </p>
            </div>
          </div>
        </aside>

        <main className="flex flex-1 flex-col">
          <div className="auth-card w-full max-w-[720px] flex-1 p-6 sm:p-8 xl:p-10">{children}</div>
        </main>
      </div>

      <div className="mt-7 flex flex-col items-center justify-between gap-2 text-[11px] text-slate-500 sm:flex-row">
        <p>© 2026 Brightloop · Subscription management, made calm.</p>
        <p className="inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-[#0f766e]" aria-hidden="true" />
            SOC2 Type II Certified
          </span>
          <span aria-hidden="true">·</span>
          <span>TLS 1.3 / AES-256</span>
        </p>
      </div>
    </div>
  )
}
