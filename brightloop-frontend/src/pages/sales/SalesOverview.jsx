import { Link } from 'react-router-dom'
import {
  ArrowRight,
  FileText,
  Layers,
  ReceiptText,
  RefreshCw,
  Users,
} from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { AdminEmptyState, AdminErrorState } from '../../components/admin/AdminState'
import Panel from '../../components/admin/Panel'
import SampleDataBadge from '../../components/admin/SampleDataBadge'
import StatCard from '../../components/admin/StatCard'
import StatusBadge from '../../components/admin/StatusBadge'
import StaffDemoNotice from '../../components/staff/StaffDemoNotice'
import { useStaffDemoData } from '../../context/StaffDemoDataContext'
import { DEMO_SALES_BASE } from '../../config/salesDemo'
import { formatDate, formatMoney, subscriptionStatusTone } from '../../lib/customerFormat'

const QUICK_ACTIONS = [
  {
    to: `${DEMO_SALES_BASE}/customers`,
    label: 'Customers',
    description: 'Search the customer list and open read-only details.',
    icon: Users,
  },
  {
    to: `${DEMO_SALES_BASE}/quotations`,
    label: 'Quotation Templates',
    description: 'Review templates and create a new quotation baseline.',
    icon: FileText,
  },
  {
    to: `${DEMO_SALES_BASE}/subscriptions`,
    label: 'Subscriptions',
    description: 'Create subscriptions from templates and move lifecycle status.',
    icon: Layers,
  },
  {
    to: `${DEMO_SALES_BASE}/invoices`,
    label: 'Invoices',
    description: 'Read-only invoice list and billing status.',
    icon: ReceiptText,
  },
]

export default function SalesOverview() {
  const { status, error, customers, quotationTemplates, subscriptions, invoices, reload } =
    useStaffDemoData()

  const loading = status === 'loading'
  const recent = [...subscriptions]
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Sales Rep portal"
        title="Overview"
        description="Customers, quotation templates and subscription activity for the sales workspace."
        actions={
          <>
            <SampleDataBadge className="hidden sm:inline-flex" />
            <AdminButton icon={RefreshCw} onClick={reload} disabled={loading} aria-busy={loading}>
              Refresh
            </AdminButton>
          </>
        }
      />

      {status === 'error' ? (
        <Panel bodyClassName="p-0">
          <AdminErrorState
            title="Sales workspace could not be loaded"
            description={error || 'The demo staff adapter did not return a response.'}
            onRetry={reload}
          />
        </Panel>
      ) : (
        <>
          <section aria-label="Sales summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }, (_, index) => <StatCard key={index} loading />)
            ) : (
              <>
                <StatCard
                  label="Customers"
                  value={customers.length}
                  icon={Users}
                  tone="sky"
                  hint="Read-only customer directory"
                />
                <StatCard
                  label="Active subscriptions"
                  value={subscriptions.filter((item) => item.status === 'Active').length}
                  icon={Layers}
                  tone="teal"
                  hint={`${subscriptions.length} subscriptions in total`}
                />
                <StatCard
                  label="Quotation templates"
                  value={quotationTemplates.length}
                  icon={FileText}
                  tone="slate"
                  hint={`${quotationTemplates.filter((item) => item.status === 'Active').length} active`}
                />
                <StatCard
                  label="Invoices"
                  value={invoices.length}
                  icon={ReceiptText}
                  tone="amber"
                  hint="Read-only billing view"
                />
              </>
            )}
          </section>

          <section aria-label="Sales quick actions" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {QUICK_ACTIONS.map(({ to, label, description, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_4px_12px_-2px_rgba(15,23,42,0.06),0_2px_4px_-2px_rgba(15,23,42,0.03)]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#bae6fd] bg-[#f0f9ff] text-[#0284c7]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-slate-900">{label}</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-[#146c94]"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-1 block text-[11.5px] leading-relaxed text-slate-500">
                    {description}
                  </span>
                </span>
              </Link>
            ))}
          </section>

          <Panel
            title="Recent subscriptions"
            description="Latest subscription activity linked to sample customers."
            bodyClassName="p-0"
            actions={
              <Link
                to={`${DEMO_SALES_BASE}/subscriptions`}
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#00709f] hover:text-[#005374]"
              >
                View all
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            }
          >
            {loading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 4 }, (_, index) => (
                  <span key={index} className="block h-4 w-full animate-pulse rounded bg-slate-100" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <AdminEmptyState
                title="No subscriptions yet"
                description="Subscriptions created from quotation templates will appear here."
              />
            ) : (
              <ul className="divide-y divide-[#f1f5f9]">
                {recent.map((subscription) => (
                  <li
                    key={subscription.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-semibold text-slate-900">
                        {subscription.customerName}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-slate-500">
                        {subscription.subscriptionNumber} - {subscription.planName} -{' '}
                        {formatDate(subscription.startDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12.5px] font-semibold tabular-nums text-slate-900">
                        {formatMoney(subscription.price, subscription.currency)}
                      </span>
                      <StatusBadge tone={subscriptionStatusTone(subscription.status)}>
                        {subscription.status}
                      </StatusBadge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <StaffDemoNotice>
            Sales demo data is local sample data. In production the Sales Rep role can view
            customers, manage quotations and subscriptions, but cannot edit invoices, record
            payments or access finance controls.
          </StaffDemoNotice>
        </>
      )}
    </div>
  )
}
