import { Infinity as InfinityIcon } from 'lucide-react'

export default function Brand({ className = '', markOnly = false }) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#005374] ring-1 ring-inset ring-[#0e4d6a]/40">
        <InfinityIcon className="h-[19px] w-[19px] text-white" strokeWidth={2.4} aria-hidden="true" />
      </span>
      {!markOnly && (
        <span className="text-[1.2rem] font-bold tracking-[-0.01em] text-slate-900">
          brightloop
        </span>
      )}
    </div>
  )
}
