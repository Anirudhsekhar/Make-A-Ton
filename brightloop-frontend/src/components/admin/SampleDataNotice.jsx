import { Sparkles } from 'lucide-react'

export default function SampleDataNotice({ children }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-[#bae6fd] bg-[#f0f9ff] px-4 py-3">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#0284c7]" aria-hidden="true" />
      <p className="text-[12px] leading-relaxed text-slate-600">
        <span className="font-semibold text-slate-900">Sample data only.</span>{' '}
        {children ??
          'These figures come from an isolated demo dataset. They are not live customer or financial data.'}
      </p>
    </div>
  )
}
