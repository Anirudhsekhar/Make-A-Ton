export default function StatusToggle({ status, onToggle, label = 'item' }) {
  const active = status === 'Active'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={`${active ? 'Deactivate' : 'Activate'} ${label}`}
      title={active ? 'Click to deactivate' : 'Click to activate'}
      onClick={onToggle}
      className={`inline-flex h-[24px] items-center gap-1.5 rounded border px-2 text-[10px] font-semibold uppercase tracking-[0.03em] transition-colors ${
        active
          ? 'border-[#ccfbf1] bg-[#f0fdfa] text-[#0f766e] hover:border-[#99f6e4]'
          : 'border-slate-200 bg-[#f1f5f9] text-slate-600 hover:border-slate-300 hover:bg-slate-100'
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-[#0f766e]' : 'bg-slate-400'}`}
      />
      {active ? 'Active' : 'Inactive'}
    </button>
  )
}
