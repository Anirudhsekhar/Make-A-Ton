import { useMemo, useState } from 'react'
import { Plus, Printer, ReceiptText, Search, Send } from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
import AdminDataTable from '../../components/admin/AdminDataTable'
import { AdminSelect } from '../../components/admin/AdminField'
import AdminFlashMessage from '../../components/admin/AdminFlashMessage'
import AdminModal from '../../components/admin/AdminModal'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminSummaryCards from '../../components/admin/AdminSummaryCards'
import Panel from '../../components/admin/Panel'
import SampleDataBadge from '../../components/admin/SampleDataBadge'
import StatusBadge from '../../components/admin/StatusBadge'
import StaffDemoNotice from '../../components/staff/StaffDemoNotice'
import { useStaffDemoData } from '../../context/StaffDemoDataContext'
import {
  formatDate,
  formatMoney,
  invoiceStatusTone,
  invoiceWorkflowTone,
} from '../../lib/customerFormat'

const viewButtonClass =
  'inline-flex h-8 items-center justify-center rounded border border-slate-200 bg-white px-2.5 text-[11.5px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-[#f8fafc]'

export default function FinanceInvoices() {
  const {
    invoices,
    subscriptions,
    payments,
    generateInvoice,
    confirmInvoice,
    cancelInvoice,
    getPaidAmount,
  } = useStaffDemoData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [generateSubscriptionId, setGenerateSubscriptionId] = useState('')
  const [notice, setNotice] = useState('')

  const selected = invoices.find((invoice) => invoice.id === selectedId) ?? null

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return invoices.filter((invoice) => {
      const matchesQuery =
        !query ||
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.customerName.toLowerCase().includes(query) ||
        invoice.companyName.toLowerCase().includes(query)
      const matchesStatus =
        statusFilter === 'all' ||
        invoice.status === statusFilter ||
        invoice.workflowStatus === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [invoices, search, statusFilter])

  const openGenerate = () => {
    setGenerateSubscriptionId(subscriptions[0]?.id ?? '')
    setGenerateOpen(true)
  }

  const handleGenerate = () => {
    const result = generateInvoice(generateSubscriptionId)
    setNotice(result.message)
    if (result.ok) setGenerateOpen(false)
  }

  const handleConfirm = () => {
    const result = confirmInvoice(selected.id)
    setNotice(result.message)
  }

  const handleCancel = () => {
    const result = cancelInvoice(selected.id)
    setNotice(result.message)
  }

  const handleSend = () => {
    setNotice(`Sending ${selected.invoiceNumber} is simulated in the demo session.`)
  }

  const handlePrint = () => {
    setNotice(`Print preview for ${selected.invoiceNumber} is simulated in the demo session.`)
  }

  const selectedPayments = selected
    ? payments.filter((payment) => payment.invoiceId === selected.id)
    : []
  const selectedPaid = selected ? getPaidAmount(selected.id) : 0
  const statuses = Array.from(
    new Set(invoices.flatMap((invoice) => [invoice.status, invoice.workflowStatus])),
  )

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Finance Lead portal"
        title="Invoices"
        description="Generate invoices from subscriptions, confirm or cancel drafts, and review payment history."
        actions={
          <>
            <SampleDataBadge className="hidden sm:inline-flex" />
            <AdminButton variant="primary" icon={Plus} onClick={openGenerate}>
              Generate from subscription
            </AdminButton>
          </>
        }
      />

      {notice && <AdminFlashMessage onDismiss={() => setNotice('')}>{notice}</AdminFlashMessage>}

      <AdminSummaryCards
        items={[
          {
            label: 'Invoices',
            value: invoices.length,
            hint: 'In the demo workspace',
            icon: ReceiptText,
            tone: 'sky',
          },
          {
            label: 'Draft',
            value: invoices.filter((invoice) => invoice.workflowStatus === 'Draft').length,
            hint: 'Awaiting confirmation',
            icon: ReceiptText,
            tone: 'slate',
          },
          {
            label: 'Confirmed',
            value: invoices.filter((invoice) => invoice.workflowStatus === 'Confirmed').length,
            hint: 'Issued to customers',
            icon: ReceiptText,
            tone: 'amber',
          },
          {
            label: 'Paid',
            value: invoices.filter((invoice) => invoice.workflowStatus === 'Paid').length,
            hint: 'Fully settled',
            icon: ReceiptText,
            tone: 'teal',
          },
        ]}
      />

      <Panel
        title="Invoice list"
        description="Draft, confirmed, paid and overdue invoices with their billing status."
        bodyClassName="p-0"
        actions={<span className="text-[11px] text-slate-500">{filtered.length} shown</span>}
      >
        <div className="grid gap-3 border-b border-[#f1f5f9] px-4 py-3 sm:grid-cols-[minmax(0,1fr)_180px]">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice or customer"
              aria-label="Search invoices"
              className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-[12.5px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#146c94] focus:ring-1 focus:ring-[#146c94]"
            />
          </div>
          <AdminSelect
            id="finance-invoice-status-filter"
            label="Status filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </AdminSelect>
        </div>

        <AdminDataTable
          rows={filtered}
          getRowId={(row) => row.id}
          emptyTitle="No invoices match your filters"
          emptyDescription="Try another search or status filter."
          columns={[
            {
              key: 'number',
              header: 'Invoice',
              render: (row) => (
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold text-slate-900 tabular-nums">
                    {row.invoiceNumber}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-slate-500">{row.companyName}</p>
                </div>
              ),
            },
            {
              key: 'customer',
              header: 'Customer',
              render: (row) => row.customerName,
            },
            {
              key: 'due',
              header: 'Due',
              render: (row) => (
                <span className="text-[11.5px] tabular-nums text-slate-600">
                  {formatDate(row.dueDate)}
                </span>
              ),
            },
            {
              key: 'total',
              header: 'Total',
              align: 'right',
              render: (row) => (
                <div className="text-[12.5px] font-semibold text-slate-900 tabular-nums">
                  <p>{formatMoney(row.totals.total, row.currency)}</p>
                  <p className="text-[11px] font-normal text-slate-500">
                    Paid {formatMoney(getPaidAmount(row.id), row.currency)}
                  </p>
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <div className="flex flex-col items-start gap-1">
                  <StatusBadge tone={invoiceStatusTone(row.status)}>{row.status}</StatusBadge>
                  <StatusBadge tone={invoiceWorkflowTone(row.workflowStatus)}>
                    {row.workflowStatus}
                  </StatusBadge>
                </div>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              align: 'right',
              render: (row) => (
                <button
                  type="button"
                  onClick={() => setSelectedId(row.id)}
                  className={viewButtonClass}
                >
                  View
                </button>
              ),
            },
          ]}
        />
      </Panel>

      <StaffDemoNotice>
        Invoice actions are simulated locally. Duplicate-billing checks and payment settlement must
        be enforced by the backend before production use.
      </StaffDemoNotice>

      <AdminModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        title="Generate invoice from subscription"
        description="Select a subscription. Subscriptions that already have an invoice are rejected to avoid duplicate billing."
        footer={
          <>
            <AdminButton onClick={() => setGenerateOpen(false)}>Cancel</AdminButton>
            <AdminButton variant="primary" onClick={handleGenerate}>
              Generate draft
            </AdminButton>
          </>
        }
      >
        <AdminSelect
          id="finance-generate-subscription"
          label="Subscription"
          value={generateSubscriptionId}
          onChange={(event) => setGenerateSubscriptionId(event.target.value)}
          required
        >
          {subscriptions.map((subscription) => (
            <option key={subscription.id} value={subscription.id}>
              {subscription.subscriptionNumber} - {subscription.customerName} - {subscription.planName}
            </option>
          ))}
        </AdminSelect>
      </AdminModal>

      <AdminModal
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.invoiceNumber ?? 'Invoice'}
        description={selected ? `${selected.customerName} - ${selected.companyName}` : undefined}
        footer={
          selected && (
            <>
              <AdminButton onClick={() => setSelectedId(null)}>Close</AdminButton>
              <AdminButton
                icon={Send}
                onClick={handleSend}
                disabled={selected.workflowStatus !== 'Confirmed'}
              >
                Send
              </AdminButton>
              <AdminButton
                icon={Printer}
                onClick={handlePrint}
                disabled={selected.workflowStatus === 'Draft'}
              >
                Print
              </AdminButton>
              <AdminButton
                variant="danger"
                onClick={handleCancel}
                disabled={selected.workflowStatus === 'Paid'}
              >
                Cancel invoice
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={handleConfirm}
                disabled={selected.workflowStatus !== 'Draft'}
              >
                Confirm
              </AdminButton>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-5">
            <dl className="grid gap-3 text-[12.5px] sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">Customer status</dt>
                <dd className="mt-1">
                  <StatusBadge tone={invoiceStatusTone(selected.status)}>
                    {selected.status}
                  </StatusBadge>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Workflow</dt>
                <dd className="mt-1">
                  <StatusBadge tone={invoiceWorkflowTone(selected.workflowStatus)}>
                    {selected.workflowStatus}
                  </StatusBadge>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Total</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">
                  {formatMoney(selected.totals.total, selected.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Issue date</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {formatDate(selected.issueDate)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Due date</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{formatDate(selected.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Balance</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">
                  {formatMoney(
                    Math.max(selected.totals.total - selectedPaid, 0),
                    selected.currency,
                  )}
                </dd>
              </div>
            </dl>

            <div className="overflow-x-auto rounded border border-slate-200">
              <table className="w-full min-w-[520px] text-left text-[12px]">
                <thead>
                  <tr className="border-b border-[#f1f5f9] bg-[#f8fafc] text-[10.5px] uppercase tracking-[0.07em] text-slate-500">
                    <th className="px-3 py-2 font-semibold">Product</th>
                    <th className="px-3 py-2 text-right font-semibold">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold">Tax</th>
                    <th className="px-3 py-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.lineItems.map((line) => (
                    <tr key={line.id} className="border-b border-[#f1f5f9] last:border-0">
                      <td className="px-3 py-2 font-medium text-slate-900">{line.productName}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{line.quantity}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{line.taxRate}%</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-900">
                        {formatMoney(line.amount, selected.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-slate-900">Payment history</h3>
              {selectedPayments.length === 0 ? (
                <p className="mt-2 text-[12px] text-slate-500">
                  No payments are linked to this invoice yet.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-[#f1f5f9] rounded border border-slate-200">
                  {selectedPayments.map((payment) => (
                    <li key={payment.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                      <span className="min-w-0">
                        <span className="block text-[12px] font-medium text-slate-900">
                          {payment.method}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          {formatDate(payment.date)} - {payment.note}
                        </span>
                      </span>
                      <span className="text-[12px] font-semibold tabular-nums text-slate-900">
                        {formatMoney(payment.amount, payment.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="text-[12px] leading-relaxed text-slate-500">{selected.notes}</p>
          </div>
        )}
      </AdminModal>
    </div>
  )
}
