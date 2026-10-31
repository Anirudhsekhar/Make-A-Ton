export default function Panel({
  title,
  description,
  actions,
  children,
  footer,
  className = '',
  bodyClassName = 'p-5',
}) {
  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] ${className}`}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f1f5f9] px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[15px] font-semibold leading-6 tracking-[-0.005em] text-slate-900">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
      {footer && (
        <footer className="border-t border-[#f1f5f9] px-5 py-3 text-[11.5px] text-slate-500">
          {footer}
        </footer>
      )}
    </section>
  )
}
