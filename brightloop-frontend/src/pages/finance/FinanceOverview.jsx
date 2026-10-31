import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Layers,
  ReceiptText,
  RefreshCw,
  Wallet,
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
import { DEMO_FINANCE_BASE } from '../../config/financeDemo'
import {
  formatDate,
  formatMoney,
  invoiceStatusTone,
  invoiceWorkflowTone,
} from '../../lib/customerFormat'

const QUICK_ACTIONS = [
  {
    to: `${DEMO_FINANCE_BASE}/subscriptions`,
    label: 'Subscriptions',
    description: 'Review customer subscriptions in read-only mode.',
    icon: Layers,
  },
  {
    to: `${DEMO_FINANCE_BASE}/invoices`,
    label: 'Invoices',
    description: 'Generate, confirm and send customer invoices.',
    icon: ReceiptText,
  },
  {
    to: `${DEMO_FINANCE_BASE}/payments`,
    label: 'Payments',
    description: 'Record payments and settle invoice balances.',
    icon: CreditCard,
  },
  {
    to: `${DEMO_FINANCE_BASE}/analytics`,
    label: 'Finance Dashboard',
    description: 'Revenue, outstanding balances and overdue invoices.',
    icon: BarChart3,
  },
]

export default function FinanceOverview() {
  const { status, error, subscriptions, invoices, payments, getPaidAmount, reload } =
    useStaffDemoData()

  const loading = status === 'loading'
  const outstanding = invoices
    .filter((invoice) => invoice.workflowStatus !== 'Paid')
    .reduce(
      (total, invoice) =>
        total + Math.max(invoice.totals.total - getPaidAmount(invoice.id), 0),
      0,
    )
  const received = payments.reduce((total, payment) => total + Number(payment.amount || 0), 0)
  const recentInvoices = [...invoices]
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
    .slice(0, 5)
  const recentPayments = [...payments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Finance Lead portal"
        title="Overview"
        description="Subscriptions, invoices and payments from a finance-first perspective."
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
            title="Finance workspace could not be loaded"
            description={error || 'The demo finance adapter did not return a response.'}
            onRetry={reload}
          />
        </Panel>
      ) : (
        <>
          <section aria-label="Finance summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }, (_, index) => <StatCard key={index} loading />)
            ) : (
              <>
                <StatCard
                  label="Active subscriptions"
                  value={subscriptions.filter((item) => item.status === 'Active').length}
                  icon={Layers}
                  tone="sky"
                  hint={`${subscriptions.length} subscriptions in total`}
                />
                <StatCard
                  label="Revenue received"
                  value={formatMoney(received)}
                  icon={Wallet}
                  tone="teal"
                  hint={`${payments.length} recorded payments`}
                />
                <StatCard
                  label="Outstanding"
                  value={formatMoney(outstanding)}
                  icon={ReceiptText}
                  tone="amber"
                  hint={`${invoices.filter((invoice) => invoice.workflowStatus !== 'Paid').length} open invoices`}
                />
                <StatCard
                  label="Overdue invoices"
                  value={invoices.filter((invoice) => invoice.status === 'Overdue').length}
                  icon={ReceiptText}
                  tone="slate"
                  hint="Past the due date"
                />
              </>
            )}
          </section>

          <section aria-label="Finance quick actions" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <Panel
              title="Recent invoices"
              description="Latest invoices and their workflow state."
              bodyClassName="p-0"
              actions={
                <Link
                  to={`${DEMO_FINANCE_BASE}/invoices`}
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
                    <span
                      key={index}
                      className="block h-4 w-full animate-pulse rounded bg-slate-100"
                    />
                  ))}
                </div>
              ) : recentInvoices.length === 0 ? (
                <AdminEmptyState
                  title="No invoices yet"
                  description="Generated invoices will appear here."
                />
              ) : (
                <ul className="divide-y divide-[#f1f5f9]">
                  {recentInvoices.map((invoice) => (
                    <li
                      key={invoice.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-semibold text-slate-900 tabular-nums">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-slate-500">
                          {invoice.customerName} - Due {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[12.5px] font-semibold tabular-nums text-slate-900">
                          {formatMoney(invoice.totals.total, invoice.currency)}
                        </span>
                        <StatusBadge tone={invoiceStatusTone(invoice.status)}>
                          {invoice.status}
                        </StatusBadge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel
              title="Recent payments"
              description="Payments recorded against invoices."
              bodyClassName="p-0"
              actions={
                <Link
                  to={`${DEMO_FINANCE_BASE}/payments`}
                  className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#00709f] hover:text-[#005374]"
                >
                  View all
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              }
            >
              {loading ? (
                <div className="space-y-3 p-5">
                  {Array.from({ length: 3 }, (_, index) => (
                    <span
                      key={index}
                      className="block h-4 w-full animate-pulse rounded bg-slate-100"
                    />
                  ))}
                </div>
              ) : recentPayments.length === 0 ? (
                <AdminEmptyState
                  title="No payments recorded"
                  description="Payments will appear here once finance records them."
                />
              ) : (
                <ul className="divide-y divide-[#f1f5f9]">
                  {recentPayments.map((payment) => (
                    <li key={payment.id} className="px-5 py-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-[12.5px] font-semibold text-slate-900 tabular-nums">
                          {payment.invoiceNumber}
                        </p>
                        <p className="text-[12.5px] font-semibold tabular-nums text-slate-900">
                          {formatMoney(payment.amount, payment.currency)}
                        </p>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {payment.customerName} - {payment.method} - {formatDate(payment.date)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Panel title="Workflow snapshot" description="Invoice states across the finance workspace.">
            <div className="grid gap-3 sm:grid-cols-3">
              {['Draft', 'Confirmed', 'Paid'].map((statusName) => (
                <div
                  key={statusName}
                  className="rounded-lg border border-slate-200 bg-[#f8fafc] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {statusName}
                    </p>
                    <StatusBadge tone={invoiceWorkflowTone(statusName)}>{statusName}</StatusBadge>
                  </div>
                  <p className="mt-2 font-display text-[24px] font-medium tabular-nums text-slate-900">
                    {invoices.filter((invoice) => invoice.workflowStatus === statusName).length}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <StaffDemoNotice>
            Finance demo data is local sample data. Finance Leads can work with invoices and
            payments, but cannot edit subscriptions, quotations, products, taxes, discounts or staff
            records.
          </StaffDemoNotice>
        </>
      )}
    </div>
  )
}
