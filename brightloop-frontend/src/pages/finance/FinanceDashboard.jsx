import { Link } from 'react-router-dom'
import { ArrowRight, Banknote, Clock, ReceiptText, TrendingUp } from 'lucide-react'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminSummaryCards from '../../components/admin/AdminSummaryCards'
import Panel from '../../components/admin/Panel'
import RevenueChart from '../../components/admin/RevenueChart'
import SampleDataBadge from '../../components/admin/SampleDataBadge'
import StaffDemoNotice from '../../components/staff/StaffDemoNotice'
import { useStaffDemoData } from '../../context/StaffDemoDataContext'
import { DEMO_FINANCE_BASE } from '../../config/financeDemo'
import { STAFF_DEMO_REVENUE } from '../../data/staff/staffDemoData'
import { formatDate, formatMoney } from '../../lib/customerFormat'

const REPORT_DATE = '2026-10-31'
const AGING_BUCKETS = ['Current', '1-30 days', '31-60 days', '60+ days']

function daysPastDue(dueDate) {
  const due = new Date(`${dueDate}T00:00:00Z`).getTime()
  const report = new Date(`${REPORT_DATE}T00:00:00Z`).getTime()
  if (Number.isNaN(due)) return 0
  return Math.floor((report - due) / (24 * 60 * 60 * 1000))
}

function agingBucket(dueDate) {
  const days = daysPastDue(dueDate)
  if (days <= 0) return 'Current'
  if (days <= 30) return '1-30 days'
  if (days <= 60) return '31-60 days'
  return '60+ days'
}

export default function FinanceDashboard() {
  const { invoices, payments, getPaidAmount } = useStaffDemoData()

  const totalBilled = invoices.reduce((total, invoice) => total + invoice.totals.total, 0)
  const collected = payments.reduce((total, payment) => total + Number(payment.amount || 0), 0)
  const outstanding = invoices.reduce(
    (total, invoice) =>
      total + Math.max(invoice.totals.total - getPaidAmount(invoice.id), 0),
    0,
  )
  const overdue = invoices
    .filter((invoice) => invoice.status === 'Overdue')
    .reduce(
      (total, invoice) =>
        total + Math.max(invoice.totals.total - getPaidAmount(invoice.id), 0),
      0,
    )
  const collectionRate = totalBilled > 0 ? (collected / totalBilled) * 100 : 0

  const openInvoices = invoices
    .map((invoice) => {
      const balance = Math.max(invoice.totals.total - getPaidAmount(invoice.id), 0)
      return { ...invoice, balance }
    })
    .filter((invoice) => invoice.balance > 0)

  const aging = AGING_BUCKETS.map((bucket) => ({
    bucket,
    count: openInvoices.filter((invoice) => agingBucket(invoice.dueDate) === bucket).length,
    amount: openInvoices
      .filter((invoice) => agingBucket(invoice.dueDate) === bucket)
      .reduce((total, invoice) => total + invoice.balance, 0),
  }))

  const customerBalances = Object.values(
    openInvoices.reduce((groups, invoice) => {
      const key = invoice.customerId
      const current = groups[key] ?? {
        id: key,
        customerName: invoice.customerName,
        companyName: invoice.companyName,
        invoices: 0,
        oldestDueDate: invoice.dueDate,
        balance: 0,
      }
      return {
        ...groups,
        [key]: {
          ...current,
          invoices: current.invoices + 1,
          oldestDueDate:
            invoice.dueDate < current.oldestDueDate ? invoice.dueDate : current.oldestDueDate,
          balance: current.balance + invoice.balance,
        },
      }
    }, {}),
  ).sort((a, b) => b.balance - a.balance)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Finance Lead portal"
        title="Finance Dashboard"
        description="Revenue, collections, outstanding balances and invoice aging across the demo workspace."
        actions={<SampleDataBadge className="hidden sm:inline-flex" />}
      />

      <AdminSummaryCards
        items={[
          {
            label: 'Total billed',
            value: formatMoney(totalBilled),
            hint: `${invoices.length} invoices`,
            icon: ReceiptText,
            tone: 'sky',
          },
          {
            label: 'Collected',
            value: formatMoney(collected),
            hint: `${collectionRate.toFixed(1)}% collection rate`,
            icon: Banknote,
            tone: 'teal',
          },
          {
            label: 'Outstanding',
            value: formatMoney(outstanding),
            hint: `${openInvoices.length} open invoices`,
            icon: Clock,
            tone: 'amber',
          },
          {
            label: 'Overdue',
            value: formatMoney(overdue),
            hint: `${invoices.filter((invoice) => invoice.status === 'Overdue').length} overdue invoices`,
            icon: TrendingUp,
            tone: 'slate',
          },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <RevenueChart revenue={STAFF_DEMO_REVENUE} />

        <Panel
          title="Invoice aging"
          description={`Open balances as of ${formatDate(REPORT_DATE)}.`}
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-[#f1f5f9]">
            {aging.map((item) => (
              <li key={item.bucket} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <p className="text-[12.5px] font-semibold text-slate-900">{item.bucket}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{item.count} invoices</p>
                </div>
                <p className="text-[12.5px] font-semibold tabular-nums text-slate-900">
                  {formatMoney(item.amount)}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Outstanding by customer"
        description="Customers with an open invoice balance, highest first."
        bodyClassName="p-0"
        actions={
          <Link
            to={`${DEMO_FINANCE_BASE}/invoices`}
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#00709f] hover:text-[#005374]"
          >
            Open invoices
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        }
      >
        <AdminDataTable
          rows={customerBalances}
          getRowId={(row) => row.id}
          emptyTitle="No outstanding balances"
          emptyDescription="Every invoice in the demo workspace is settled."
          columns={[
            {
              key: 'customer',
              header: 'Customer',
              render: (row) => (
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold text-slate-900">
                    {row.customerName}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-slate-500">{row.companyName}</p>
                </div>
              ),
            },
            {
              key: 'invoices',
              header: 'Open invoices',
              align: 'right',
              render: (row) => (
                <span className="tabular-nums text-slate-600">{row.invoices}</span>
              ),
            },
            {
              key: 'oldest',
              header: 'Oldest due',
              render: (row) => (
                <span className="text-[11.5px] tabular-nums text-slate-600">
                  {formatDate(row.oldestDueDate)}
                </span>
              ),
            },
            {
              key: 'balance',
              header: 'Balance',
              align: 'right',
              render: (row) => (
                <span className="font-semibold tabular-nums text-slate-900">
                  {formatMoney(row.balance)}
                </span>
              ),
            },
          ]}
        />
      </Panel>

      <StaffDemoNotice>
        Finance metrics are computed from local demo fixtures. Revenue history is simulated for
        layout review only.
      </StaffDemoNotice>
    </div>
  )
}
