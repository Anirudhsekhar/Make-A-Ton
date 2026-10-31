import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'lg',
}) {
  const panelRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-xl border border-slate-200 bg-white shadow-[0_12px_28px_-4px_rgba(15,23,42,0.18),0_4px_8px_-2px_rgba(15,23,42,0.08)] outline-none sm:rounded-lg ${SIZES[size] ?? SIZES.lg}`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#f1f5f9] px-5 py-4">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-display text-[22px] font-medium leading-tight tracking-[-0.015em] text-slate-900"
            >
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-8 w-8 shrink-0 place-items-center rounded border border-slate-200 text-slate-500 transition-colors hover:bg-[#f8fafc] hover:text-slate-900"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#f1f5f9] bg-[#f8fafc] px-5 py-3 sm:flex-row sm:justify-end">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}
