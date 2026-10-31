import { Sparkles } from 'lucide-react'

export default function SampleDataBadge({ className = '' }) {
  return (
    <span
      title="Figures come from an isolated demo dataset. They are not live customer or financial data."
      className={`inline-flex h-[22px] items-center gap-1.5 rounded border border-[#bae6fd] bg-[#f0f9ff] px-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#0284c7] ${className}`}
    >
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      Sample data
    </span>
  )
}
