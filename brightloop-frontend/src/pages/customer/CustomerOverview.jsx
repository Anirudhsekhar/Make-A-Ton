import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarClock,
  Layers,
  ReceiptText,
  RefreshCw,
  UserRound,
  Wallet,
} from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { AdminEmptyState, AdminErrorState } from '../../components/admin/AdminState'
import Panel from '../../components/admin/Panel'
import SampleDataBadge from '../../components/admin/SampleDataBadge'
import StatCard from '../../components/admin/StatCard'
import StatusBadge from '../../components/admin/StatusBadge'
import CustomerDemoNotice from '../../components/customer/CustomerDemoNotice'
import { useCustomerPortal } from '../../context/CustomerPortalContext'
import { useCustomerBasePath } from '../../hooks/useCustomerBasePath'
import {
  formatDate,
  formatMoney,
  invoiceStatusTone,
} from '../../lib/customerFormat'

const QUICK_ACTIONS = [
  {
    to: '/customer/subscriptions',
    label: 'My Subscriptions',
    description: 'Review plans, renewal dates and plan actions.',
    icon: Layers,
  },
  {
    to: '/customer/invoices',
    label: 'My Invoices',
    description: 'Open invoices, payment history and totals.',
    icon: ReceiptText,
  },
  {
    to: '/customer/account',
    label: 'My Account',
    description: 'Update your profile and security details.',
    icon: UserRound,
  },
]

function InvoiceRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="space-y-2">
        <span className="block h-3 w-32 animate-pulse rounded bg-slate-100" />
        <span className="block h-2.5 w-24 animate-pulse rounded bg-slate-100" />
      </div>
      <span className="h-5 w-20 animate-pulse rounded bg-slate-100" />
    </div>
  )
}

export default function CustomerOverview() {
  const base = useCustomerBasePath()
  const { demo, status, error, overview, subscriptions, reload } = useCustomerPortal()
  const loading = status === 'loading'
  const nextRenewal = overview.nextRenewal

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Customer portal"
        title="Overview"
        description="Your subscriptions, upcoming renewal and invoices in one calm workspace."
        actions={
          <>
            {demo && <SampleDataBadge className="hidden sm:inline-flex" />}
            <AdminButton
              icon={RefreshCw}
              onClick={reload}
              disabled={loading}
              aria-busy={loading}
            >
              Refresh
            </AdminButton>
          </>
        }
      />

      {status === 'error' ? (
        <Panel bodyClassName="p-0">
          <AdminErrorState
            title="Your customer records could not be loaded"
            description={error || 'The customer data service did not return a response.'}
            onRetry={reload}
          />
        </Panel>
      ) : (
        <>
          <section aria-label="Customer summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }, (_, index) => <StatCard key={index} loading />)
            ) : (
              <>
                <StatCard
                  label="Active subscriptions"
                  value={overview.activeSubscriptions}
                  icon={Layers}
                  tone="teal"
                  hint={`${subscriptions.length} subscriptions in total`}
                />
                <StatCard
                  label="Next renewal"
                  value={nextRenewal ? formatDate(nextRenewal.renewalDate) : '—'}
                  icon={CalendarClock}
                  tone="sky"
                  hint={nextRenewal ? nextRenewal.planName : 'No upcoming renewal'}
                />
                <StatCard
                  label="Outstanding amount"
                  value={formatMoney(overview.outstandingAmount)}
                  icon={Wallet}
                  tone={overview.outstandingAmount > 0 ? 'amber' : 'teal'}
                  hint={`${overview.outstandingCount} unpaid invoice${
                    overview.outstandingCount === 1 ? '' : 's'
                  }`}
                />
                <StatCard
                  label="Recent invoices"
                  value={overview.recentInvoices.length}
                  icon={ReceiptText}
                  tone="slate"
                  hint={`${overview.paidCount} paid · ${overview.overdueCount} overdue`}
                />
              </>
            )}
          </section>

          <section aria-label="Quick actions" className="grid gap-3 md:grid-cols-3">
            {QUICK_ACTIONS.map(({ to, label, description, icon: Icon }) => (
              <Link
                key={to}
                to={`${base}${to.replace('/customer', '')}`}
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

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <Panel
              title="Recent invoices"
              description="Latest invoices issued to your account."
              bodyClassName="p-0"
              actions={
                <Link
                  to={`${base}/invoices`}
                  className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#00709f] hover:text-[#005374]"
                >
                  View all
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              }
            >
              {loading ? (
                <div className="divide-y divide-[#f1f5f9]">
                  {Array.from({ length: 3 }, (_, index) => (
                    <InvoiceRowSkeleton key={index} />
                  ))}
                </div>
              ) : overview.recentInvoices.length === 0 ? (
                <AdminEmptyState
                  title="No invoices yet"
                  description="Invoices will appear here once billing issues the first one."
                />
              ) : (
                <ul className="divide-y divide-[#f1f5f9]">
                  {overview.recentInvoices.map((invoice) => (
                    <li key={invoice.id}>
                      <Link
                        to={`${base}/invoices/${invoice.id}`}
                        className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[#f8fafc]"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[12.5px] font-semibold text-slate-900 tabular-nums">
                            {invoice.invoiceNumber}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-slate-500">
                            Issued {formatDate(invoice.issueDate)} · Due{' '}
                            {formatDate(invoice.dueDate)}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-3">
                          <span className="text-[12.5px] font-semibold text-slate-900 tabular-nums">
                            {formatMoney(invoice.totals.total, invoice.currency)}
                          </span>
                          <StatusBadge tone={invoiceStatusTone(invoice.status)}>
                            {invoice.status}
                          </StatusBadge>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel
              title="Upcoming renewal"
              description="The next active subscription due for renewal."
            >
              {loading ? (
                <div className="space-y-3">
                  <span className="block h-4 w-40 animate-pulse rounded bg-slate-100" />
                  <span className="block h-3 w-28 animate-pulse rounded bg-slate-100" />
                  <span className="block h-3 w-32 animate-pulse rounded bg-slate-100" />
                </div>
              ) : nextRenewal ? (
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-slate-900">
                        {nextRenewal.planName}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-slate-500">
                        {nextRenewal.subscriptionNumber}
                      </p>
                    </div>
                    <StatusBadge tone="success">{nextRenewal.status}</StatusBadge>
                  </div>
                  <dl className="mt-4 space-y-2.5 text-[12px]">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-500">Renews on</dt>
                      <dd className="font-semibold text-slate-900">
                        {formatDate(nextRenewal.renewalDate)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-500">Billing</dt>
                      <dd className="font-medium text-slate-700">
                        {nextRenewal.billingFrequency}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-500">Price</dt>
                      <dd className="font-semibold text-slate-900 tabular-nums">
                        {formatMoney(nextRenewal.totals?.total ?? nextRenewal.price)}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    to={`${base}/subscriptions/${nextRenewal.id}`}
                    className="mt-4 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#00709f] hover:text-[#005374]"
                  >
                    View subscription
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              ) : (
                <AdminEmptyState
                  title="No upcoming renewal"
                  description="Active subscriptions with a renewal date will appear here."
                />
              )}
            </Panel>
          </div>

          <CustomerDemoNotice demo={demo} />
        </>
      )}
    </div>
  )
}
