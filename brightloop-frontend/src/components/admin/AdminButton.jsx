const VARIANTS = {
  primary:
    'border-[#146c94] bg-[#146c94] text-white hover:border-[#0e4d6a] hover:bg-[#0e4d6a]',
  secondary:
    'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-[#f8fafc]',
  ghost: 'border-transparent bg-transparent text-slate-600 hover:bg-[#f1f5f9] hover:text-slate-900',
  danger: 'border-rose-200 bg-white text-rose-700 hover:border-rose-300 hover:bg-rose-50',
}

const SIZES = {
  sm: 'h-8 px-2.5 text-[11.5px]',
  md: 'h-9 px-3 text-[12px]',
}

export default function AdminButton({
  children,
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${VARIANTS[variant] ?? VARIANTS.secondary} ${SIZES[size] ?? SIZES.md} ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </button>
  )
}
