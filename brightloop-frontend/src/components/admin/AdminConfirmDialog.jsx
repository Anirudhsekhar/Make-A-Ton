import { AlertTriangle } from 'lucide-react'
import AdminButton from './AdminButton'
import AdminModal from './AdminModal'

export default function AdminConfirmDialog({
  open,
  title = 'Confirm action',
  description = 'This action cannot be undone in the demo session.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
}) {
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <AdminButton onClick={onClose}>{cancelLabel}</AdminButton>
          <AdminButton variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </AdminButton>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-rose-200 bg-rose-50">
          <AlertTriangle className="h-4 w-4 text-rose-600" aria-hidden="true" />
        </span>
        <p className="text-[12.5px] leading-relaxed text-slate-600">{description}</p>
      </div>
    </AdminModal>
  )
}
