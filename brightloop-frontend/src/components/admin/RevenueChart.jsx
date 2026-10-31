import { TrendingUp } from 'lucide-react'
import Panel from './Panel'
import SampleDataBadge from './SampleDataBadge'
import { AdminEmptyState, AdminLoadingState } from './AdminState'
import { formatCompactCurrency, formatCurrency } from '../../lib/adminFormat'

function niceMax(value) {
  if (!value || value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const step =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10
  return step * magnitude
}

export default function RevenueChart({ revenue, loading = false }) {
  const points = revenue?.points ?? []
  const currency = revenue?.currency ?? 'USD'
  const maxValue = niceMax(Math.max(...points.map((point) => point.value), 1))
  const ticks = Array.from({ length: 5 }, (_, index) => (maxValue / 4) * (4 - index))

  return (
    <Panel
      title="Revenue"
      description="Monthly recurring revenue over the last 12 months"
      actions={<SampleDataBadge />}
      footer="Chart values are simulated for layout review only."
    >
      {loading ? (
        <AdminLoadingState />
      ) : points.length === 0 ? (
        <AdminEmptyState
          title="No revenue history yet"
          description="Revenue will appear here once subscriptions begin billing."
        />
      ) : (
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Current MRR
              </p>
              <p className="mt-1 font-display text-[28px] font-medium leading-none tracking-[-0.02em] text-slate-900 tabular-nums">
                {formatCurrency(revenue?.total, currency)}
              </p>
            </div>
            {typeof revenue?.change === 'number' && (
              <span className="inline-flex items-center gap-1 rounded border border-[#ccfbf1] bg-[#f0fdfa] px-2 py-1 text-[11px] font-semibold tabular-nums text-[#0f766e]">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                +{revenue.change.toFixed(1)}%
                <span className="font-medium text-[#0f766e]/75">{revenue.changeLabel}</span>
              </span>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <div
              aria-hidden="true"
              className="flex h-[220px] w-12 shrink-0 flex-col justify-between pb-6 text-right text-[10px] tabular-nums text-slate-400"
            >
              {ticks.map((tick) => (
                <span key={tick}>{formatCompactCurrency(tick, currency)}</span>
              ))}
            </div>

            <div className="min-w-0 flex-1">
              <div className="relative h-[220px]">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between"
                >
                  {ticks.map((tick) => (
                    <span key={tick} className="border-t border-[#f1f5f9]" />
                  ))}
                </div>

                <div className="absolute inset-x-0 top-0 bottom-6 flex items-end gap-1 sm:gap-1.5">
                  {points.map((point, index) => {
                    const height = Math.max((point.value / maxValue) * 100, 2)
                    const isCurrent = index === points.length - 1

                    return (
                      <div
                        key={`${point.label}-${index}`}
                        className="group relative flex h-full flex-1 items-end justify-center"
                      >
                        <div
                          role="img"
                          aria-label={`${point.label}: ${formatCurrency(point.value, currency)}`}
                          title={`${point.label}: ${formatCurrency(point.value, currency)}`}
                          style={{ height: `${height}%` }}
                          className={`relative w-full max-w-[38px] rounded-t-[3px] transition-colors ${
                            isCurrent
                              ? 'bg-[#0284c7] group-hover:bg-[#026aa1]'
                              : 'bg-[#146c94] group-hover:bg-[#0e4d6a]'
                          }`}
                        >
                          <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-700 shadow-[0_4px_12px_-2px_rgba(15,23,42,0.06)] group-hover:block">
                            {formatCompactCurrency(point.value, currency)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="absolute inset-x-0 bottom-0 flex gap-1 sm:gap-1.5">
                  {points.map((point, index) => (
                    <span
                      key={`${point.label}-label-${index}`}
                      className={`flex-1 text-center text-[10px] font-medium text-slate-500 ${
                        index % 2 === 1 ? 'invisible sm:visible' : ''
                      }`}
                    >
                      {point.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Panel>
  )
}
