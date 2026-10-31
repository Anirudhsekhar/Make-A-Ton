import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import SampleDataBadge from '../../components/admin/SampleDataBadge'

export default function AdminModulePlaceholder({ title, description }) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin workspace"
        title={title}
        description={description}
        actions={<SampleDataBadge />}
      />

      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg border border-[#bae6fd] bg-[#f0f9ff]">
          <Sparkles className="h-5 w-5 text-[#146c94]" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-display text-[26px] font-medium tracking-[-0.02em] text-slate-900">
          Ready for the next phase
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-slate-500">
          The {title.toLowerCase()} module is intentionally not implemented yet. This route and the
          admin shell are in place so the page can be added without reworking navigation or layout.
        </p>
        <Link
          to="/admin/dashboard"
          className="mt-6 inline-flex h-9 items-center gap-1.5 rounded border border-[#146c94] bg-[#146c94] px-3 text-[12px] font-semibold text-white transition-colors hover:bg-[#0e4d6a]"
        >
          Back to overview
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
