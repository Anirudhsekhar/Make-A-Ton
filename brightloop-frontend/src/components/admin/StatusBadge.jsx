const TONES = {
  neutral: 'border-slate-200 bg-[#f1f5f9] text-slate-600',
  accent: 'border-[#bae6fd] bg-[#f0f9ff] text-[#0284c7]',
  success: 'border-[#ccfbf1] bg-[#f0fdfa] text-[#0f766e]',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
}

export default function StatusBadge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex h-[22px] items-center rounded border px-2 text-[10px] font-semibold uppercase tracking-[0.03em] ${TONES[tone] ?? TONES.neutral} ${className}`}
    >
      {children}
    </span>
  )
}
