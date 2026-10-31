import { CheckCircle2, X } from 'lucide-react'

export default function AdminFlashMessage({ children, onDismiss }) {
  return (
    <div
      role="status"
      className="flex items-start gap-2.5 rounded-lg border border-[#ccfbf1] bg-[#f0fdfa] px-4 py-3"
    >
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0f766e]" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-[12px] leading-relaxed text-slate-700">
        <span className="font-semibold text-slate-900">Demo update.</span> {children}
      </p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="grid h-6 w-6 shrink-0 place-items-center rounded text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
