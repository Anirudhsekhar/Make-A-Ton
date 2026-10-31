import { useMemo, useState } from 'react'
import { CreditCard, Plus, Search } from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
import AdminDataTable from '../../components/admin/AdminDataTable'
import { AdminInput, AdminSelect, AdminTextarea } from '../../components/admin/AdminField'
import AdminFlashMessage from '../../components/admin/AdminFlashMessage'
import AdminModal from '../../components/admin/AdminModal'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminSummaryCards from '../../components/admin/AdminSummaryCards'
import Panel from '../../components/admin/Panel'
import SampleDataBadge from '../../components/admin/SampleDataBadge'
import StaffDemoNotice from '../../components/staff/StaffDemoNotice'
import { useStaffDemoData } from '../../context/StaffDemoDataContext'
import { formatDate, formatMoney } from '../../lib/customerFormat'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function FinancePayments() {
  const { invoices, payments, getPaidAmount, recordPayment } = useStaffDemoData()
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    invoiceId: '',
    method: 'Bank transfer',
    amount: '',
    date: today(),
    note: '',
  })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return payments.filter((payment) => {
      const matchesQuery =
        !query ||
        payment.invoiceNumber.toLowerCase().includes(query) ||
        payment.customerName.toLowerCase().includes(query) ||
        payment.note.toLowerCase().includes(query)
      const matchesMethod = methodFilter === 'all' || payment.method === methodFilter
      return matchesQuery && matchesMethod
    })
  }, [payments, search, methodFilter])

  const selectedInvoice = invoices.find((invoice) => invoice.id === form.invoiceId) ?? null
  const selectedBalance = selectedInvoice
    ? Math.max(selectedInvoice.totals.total - getPaidAmount(selectedInvoice.id), 0)
    : 0
  const methods = Array.from(new Set(payments.map((payment) => payment.method)))

  const openModal = () => {
    const firstOpen = invoices.find((invoice) => invoice.workflowStatus !== 'Paid')
    setForm({
      invoiceId: firstOpen?.id ?? invoices[0]?.id ?? '',
      method: 'Bank transfer',
      amount: '',
      date: today(),
      note: '',
    })
    setErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setErrors({})
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.invoiceId) nextErrors.invoiceId = 'Select an invoice.'
    if (!form.amount || Number(form.amount) <= 0) {
      nextErrors.amount = 'Enter a payment amount greater than zero.'
    } else if (Number(form.amount) > selectedBalance + 0.001) {
      nextErrors.amount = `Payment cannot exceed the balance of ${formatMoney(selectedBalance)}.`
    }
    if (!form.date) nextErrors.date = 'Payment date is required.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const result = recordPayment({
      invoiceId: form.invoiceId,
      method: form.method,
      amount: form.amount,
      date: form.date,
      note: form.note,
    })

    setNotice(result.message)
    if (result.ok) closeModal()
  }

  const totalReceived = payments.reduce((total, payment) => total + Number(payment.amount || 0), 0)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Finance Lead portal"
        title="Payments"
        description="Record invoice payments and review the payment history linked to each invoice."
        actions={
          <>
            <SampleDataBadge className="hidden sm:inline-flex" />
            <AdminButton variant="primary" icon={Plus} onClick={openModal}>
              Record payment
            </AdminButton>
          </>
        }
      />

      {notice && <AdminFlashMessage onDismiss={() => setNotice('')}>{notice}</AdminFlashMessage>}

      <AdminSummaryCards
        items={[
          {
            label: 'Payments',
            value: payments.length,
            hint: 'Recorded in the demo session',
            icon: CreditCard,
            tone: 'sky',
          },
          {
            label: 'Total received',
            value: formatMoney(totalReceived),
            hint: 'Across all invoices',
            icon: CreditCard,
            tone: 'teal',
          },
          {
            label: 'Bank transfers',
            value: payments.filter((payment) => payment.method === 'Bank transfer').length,
            hint: 'Most common method',
            icon: CreditCard,
            tone: 'slate',
          },
          {
            label: 'Card payments',
            value: payments.filter((payment) => payment.method === 'Card').length,
            hint: 'Processed by card',
            icon: CreditCard,
            tone: 'amber',
          },
        ]}
      />

      <Panel
        title="Payment history"
        description="Every payment is linked to an invoice and included in the invoice balance."
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
              placeholder="Search invoice, customer or note"
              aria-label="Search payments"
              className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-[12.5px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#146c94] focus:ring-1 focus:ring-[#146c94]"
            />
          </div>
          <AdminSelect
            id="finance-payment-method-filter"
            label="Method filter"
            value={methodFilter}
            onChange={(event) => setMethodFilter(event.target.value)}
          >
            <option value="all">All methods</option>
            {methods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </AdminSelect>
        </div>

        <AdminDataTable
          rows={filtered}
          getRowId={(row) => row.id}
          emptyTitle="No payments match your filters"
          emptyDescription="Try another search or method filter."
          columns={[
            {
              key: 'invoice',
              header: 'Invoice',
              render: (row) => (
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold text-slate-900 tabular-nums">
                    {row.invoiceNumber}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-slate-500">{row.customerName}</p>
                </div>
              ),
            },
            { key: 'method', header: 'Method', render: (row) => row.method },
            {
              key: 'date',
              header: 'Date',
              render: (row) => (
                <span className="text-[11.5px] tabular-nums text-slate-600">
                  {formatDate(row.date)}
                </span>
              ),
            },
            {
              key: 'amount',
              header: 'Amount',
              align: 'right',
              render: (row) => (
                <span className="font-semibold tabular-nums text-slate-900">
                  {formatMoney(row.amount, row.currency)}
                </span>
              ),
            },
            {
              key: 'note',
              header: 'Note',
              render: (row) => (
                <span className="text-[11.5px] text-slate-600">{row.note}</span>
              ),
            },
          ]}
        />
      </Panel>

      <StaffDemoNotice>
        Payments are simulated in local state. When a payment settles the full invoice balance, the
        linked invoice is marked Paid in this demo workspace only.
      </StaffDemoNotice>

      <AdminModal
        open={modalOpen}
        onClose={closeModal}
        title="Record payment"
        description="Link the payment to an invoice. The invoice balance updates in the demo session."
        footer={
          <>
            <AdminButton onClick={closeModal}>Cancel</AdminButton>
            <AdminButton variant="primary" onClick={handleSubmit}>
              Record payment
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AdminSelect
            id="finance-payment-invoice"
            label="Invoice"
            name="invoiceId"
            value={form.invoiceId}
            onChange={handleChange}
            error={errors.invoiceId}
            required
          >
            {invoices.map((invoice) => {
              const balance = Math.max(invoice.totals.total - getPaidAmount(invoice.id), 0)
              return (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoiceNumber} - {invoice.customerName} -{' '}
                  {formatMoney(balance, invoice.currency)} open
                </option>
              )
            })}
          </AdminSelect>

          {selectedInvoice && (
            <div className="rounded border border-slate-200 bg-[#f8fafc] px-3 py-2.5 text-[12px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Invoice total</span>
                <span className="font-semibold text-slate-900">
                  {formatMoney(selectedInvoice.totals.total, selectedInvoice.currency)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="text-slate-500">Open balance</span>
                <span className="font-semibold text-slate-900">
                  {formatMoney(selectedBalance, selectedInvoice.currency)}
                </span>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              id="finance-payment-amount"
              label="Amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              error={errors.amount}
              placeholder="0.00"
              required
            />
            <AdminInput
              id="finance-payment-date"
              label="Payment date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              error={errors.date}
              required
            />
          </div>

          <AdminSelect
            id="finance-payment-method"
            label="Method"
            name="method"
            value={form.method}
            onChange={handleChange}
          >
            <option value="Bank transfer">Bank transfer</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="Wire">Wire</option>
          </AdminSelect>

          <AdminTextarea
            id="finance-payment-note"
            label="Note"
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Optional payment reference or note"
          />
        </form>
      </AdminModal>
    </div>
  )
}
