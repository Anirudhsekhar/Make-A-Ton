import { FlaskConical } from 'lucide-react'
import { ADMIN_PREVIEW_ENABLED } from '../../config/adminPreview'

export default function DemoModeBadge({ className = '', demo = false }) {
  if (!demo && !ADMIN_PREVIEW_ENABLED) {
    return null
  }

  return (
    <span
      title="Development-only preview. Firebase authentication is bypassed and all dashboard data is mocked."
      className={`inline-flex h-[22px] items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-amber-700 ${className}`}
    >
      <FlaskConical className="h-3 w-3" aria-hidden="true" />
      DEMO MODE
    </span>
  )
}
