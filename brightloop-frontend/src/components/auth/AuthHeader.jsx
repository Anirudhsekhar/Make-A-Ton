export default function AuthHeader({ icon: Icon, eyebrow, title, subtitle }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-slate-50">
            <Icon className="h-4 w-4 text-[#146c94]" aria-hidden="true" />
          </span>
        )}
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#005374]">
          {eyebrow}
        </p>
      </div>
      <h1 className="mt-3 font-display text-[30px] font-medium leading-[1.2] tracking-[-0.015em] text-slate-900 sm:text-[34px]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2.5 max-w-[480px] text-[14px] leading-relaxed text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  )
}
