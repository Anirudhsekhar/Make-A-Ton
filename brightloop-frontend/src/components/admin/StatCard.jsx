import { TrendingDown, TrendingUp } from 'lucide-react'

const ICON_TONES = {
  sky: 'border-[#bae6fd] bg-[#f0f9ff] text-[#0284c7]',
  teal: 'border-[#ccfbf1] bg-[#f0fdfa] text-[#0f766e]',
  slate: 'border-slate-200 bg-[#f1f5f9] text-[#146c94]',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
}

function TrendPill({ change }) {
  const positive = change >= 0
  const Icon = positive ? TrendingUp : TrendingDown

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums ${
        positive
          ? 'border-[#ccfbf1] bg-[#f0fdfa] text-[#0f766e]'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      }`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {positive ? '+' : ''}
      {change.toFixed(1)}%
    </span>
  )
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'slate',
  change,
  changeLabel,
  hint,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between gap-3">
          <span className="mt-1 h-2.5 w-24 animate-pulse rounded bg-slate-100" />
          <span className="h-9 w-9 animate-pulse rounded-md bg-slate-100" />
        </div>
        <span className="mt-4 block h-8 w-28 animate-pulse rounded bg-slate-100" />
        <span className="mt-3 block h-2.5 w-36 animate-pulse rounded bg-slate-100" />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_4px_12px_-2px_rgba(15,23,42,0.06),0_2px_4px_-2px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          {label}
        </p>
        {Icon && (
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border ${ICON_TONES[tone] ?? ICON_TONES.slate}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>

      <p className="mt-3 font-display text-[30px] font-medium leading-none tracking-[-0.02em] text-slate-900 tabular-nums">
        {value}
      </p>

      <div className="mt-3 flex min-h-[22px] flex-wrap items-center gap-x-2 gap-y-1">
        {typeof change === 'number' ? (
          <>
            <TrendPill change={change} />
            {changeLabel && (
              <span className="text-[11px] text-slate-500">{changeLabel}</span>
            )}
          </>
        ) : (
          <span className="text-[11px] text-slate-500">{hint}</span>
        )}
      </div>
    </div>
  )
}
