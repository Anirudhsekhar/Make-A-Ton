import { AlertCircle, Inbox, Loader2, RefreshCw } from 'lucide-react'

export function AdminLoadingState({ label = 'Loading sample data…' }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 px-5 py-10 text-center">
      <Loader2 className="h-5 w-5 animate-spin text-[#146c94]" aria-hidden="true" />
      <p className="text-[12.5px] font-medium text-slate-500">{label}</p>
    </div>
  )
}

export function AdminEmptyState({
  title = 'Nothing to show yet',
  description = 'New activity will appear here once it is available.',
  icon: Icon = Inbox,
  action,
}) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 px-5 py-10 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-[#f8fafc]">
        <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
      </span>
      <p className="text-[13px] font-semibold text-slate-900">{title}</p>
      <p className="max-w-sm text-[12px] leading-relaxed text-slate-500">{description}</p>
      {action}
    </div>
  )
}

export function AdminErrorState({
  title = 'Could not load this section',
  description = 'The sample data adapter did not return a response. Try again in a moment.',
  onRetry,
}) {
  return (
    <div
      role="alert"
      className="flex min-h-[180px] flex-col items-center justify-center gap-2 px-5 py-10 text-center"
    >
      <span className="grid h-10 w-10 place-items-center rounded-md border border-rose-200 bg-rose-50">
        <AlertCircle className="h-4 w-4 text-rose-600" aria-hidden="true" />
      </span>
      <p className="text-[13px] font-semibold text-slate-900">{title}</p>
      <p className="max-w-sm text-[12px] leading-relaxed text-slate-500">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex h-9 items-center gap-1.5 rounded border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-[#f8fafc]"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  )
}
