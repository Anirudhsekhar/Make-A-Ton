const TONES = {
  sky: 'border-[#bae6fd] bg-[#f0f9ff] text-[#0284c7]',
  teal: 'border-[#ccfbf1] bg-[#f0fdfa] text-[#0f766e]',
  slate: 'border-slate-200 bg-[#f1f5f9] text-[#146c94]',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
}

export default function AdminSummaryCards({ items }) {
  return (
    <section aria-label="Module summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ id, label, value, hint, icon: Icon, tone = 'slate' }) => (
        <div
          key={id ?? label}
          className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3.5 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]"
        >
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              {label}
            </p>
            <p className="mt-1.5 font-display text-[24px] font-medium leading-none tracking-[-0.02em] text-slate-900 tabular-nums">
              {value}
            </p>
            {hint && <p className="mt-1.5 text-[11px] text-slate-500">{hint}</p>}
          </div>
          {Icon && (
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border ${TONES[tone] ?? TONES.slate}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
        </div>
      ))}
    </section>
  )
}
