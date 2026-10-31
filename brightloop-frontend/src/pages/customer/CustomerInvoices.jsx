import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileWarning,
  ReceiptText,
  RefreshCw,
  Search,
  Wallet,
} from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
import AdminDataTable from '../../components/admin/AdminDataTable'
import { AdminSelect } from '../../components/admin/AdminField'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { AdminErrorState } from '../../components/admin/AdminState'
import AdminSummaryCards from '../../components/admin/AdminSummaryCards'
import Panel from '../../components/admin/Panel'
import SampleDataBadge from '../../components/admin/SampleDataBadge'
import StatusBadge from '../../components/admin/StatusBadge'
import CustomerDemoNotice from '../../components/customer/CustomerDemoNotice'
import { useCustomerPortal } from '../../context/CustomerPortalContext'
import { useCustomerBasePath } from '../../hooks/useCustomerBasePath'
import {
  INVOICE_STATUS_OPTIONS,
  formatDate,
  formatMoney,
  invoiceStatusTone,
  invoiceWorkflowTone,
} from '../../lib/customerFormat'

const viewButtonClass =
  'inline-flex h-8 items-center justify-center rounded border border-slate-200 bg-white px-2.5 text-[11.5px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-[#f8fafc]'

export default function CustomerInvoices() {
  const base = useCustomerBasePath()
  const { demo, status, error, invoices, downloadInvoice, reload } = useCustomerPortal()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [busyId, setBusyId] = useState('')
  const [feedback, setFeedback] = useState(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return invoices.filter((invoice) => {
      const matchesQuery =
        !query ||
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.subscriptionNumber?.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [invoices, search, statusFilter])

  const paidCount = invoices.filter((invoice) => invoice.status === 'Paid').length
  const outstanding = invoices.filter((invoice) => invoice.status === 'Outstanding')
  const overdue = invoices.filter((invoice) => invoice.status === 'Overdue')
  const outstandingTotal = [...outstanding, ...overdue].reduce(
    (total, invoice) => total + (invoice.totals?.total ?? 0),
    0,
  )

  const handleDownload = async (invoice) => {
    setBusyId(invoice.id)
    setFeedback(null)
    const result = await downloadInvoice(invoice)
    setBusyId('')
    setFeedback({ tone: result.ok ? 'success' : 'error', message: result.message })
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Customer portal"
        title="My Invoices"
        description="Invoice history, payment status and downloadable documents for your account."
        actions={
          <>
            {demo && <SampleDataBadge className="hidden sm:inline-flex" />}
            <AdminButton
              icon={RefreshCw}
              onClick={reload}
              disabled={status === 'loading'}
              aria-busy={status === 'loading'}
            >
              Refresh
            </AdminButton>
          </>
        }
      />

      {status === 'error' ? (
        <Panel bodyClassName="p-0">
          <AdminErrorState
            title="Invoices could not be loaded"
            description={error || 'The customer invoices service did not return a response.'}
            onRetry={reload}
          />
        </Panel>
      ) : (
        <>
          {feedback && (
            <div
              role={feedback.tone === 'success' ? 'status' : 'alert'}
              className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 ${
                feedback.tone === 'success'
                  ? 'border-[#ccfbf1] bg-[#f0fdfa] text-slate-700'
                  : 'border-rose-200 bg-rose-50 text-rose-800'
              }`}
            >
              {feedback.tone === 'success' ? (
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#0f766e]"
                  aria-hidden="true"
                />
              ) : (
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-600"
                  aria-hidden="true"
                />
              )}
              <p className="min-w-0 flex-1 text-[12px] leading-relaxed">{feedback.message}</p>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-[11px] font-semibold underline-offset-2 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <AdminSummaryCards
            items={[
              {
                label: 'Invoices',
                value: invoices.length,
                hint: 'Issued to your account',
                icon: ReceiptText,
                tone: 'sky',
              },
              {
                label: 'Paid',
                value: paidCount,
                hint: 'Settled invoices',
                icon: CheckCircle2,
                tone: 'teal',
              },
              {
                label: 'Outstanding',
                value: formatMoney(outstandingTotal),
                hint: `${outstanding.length + overdue.length} open invoices`,
                icon: Wallet,
                tone: 'amber',
              },
              {
                label: 'Overdue',
                value: overdue.length,
                hint: 'Past the due date',
                icon: FileWarning,
                tone: 'slate',
              },
            ]}
          />

          <Panel
            title="Invoice list"
            description="Customer status and invoice workflow state are shown separately."
            bodyClassName="p-0"
            actions={<span className="text-[11px] text-slate-500">{filtered.length} shown</span>}
          >
            <div className="grid gap-3 border-b border-[#f1f5f9] px-4 py-3 sm:grid-cols-[minmax(0,1fr)_190px]">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search invoice or subscription number"
                  aria-label="Search invoices"
                  className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-[12.5px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#146c94] focus:ring-1 focus:ring-[#146c94]"
                />
              </div>
              <AdminSelect
                id="customer-invoice-status-filter"
                label="Status filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                {INVOICE_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </AdminSelect>
            </div>

            <AdminDataTable
              rows={filtered}
              loading={status === 'loading'}
              loadingRows={4}
              getRowId={(row) => row.id}
              emptyTitle="No invoices match your filters"
              emptyDescription="Try a different search or status filter. New invoices will appear here once they are issued."
              columns={[
                {
                  key: 'number',
                  header: 'Invoice',
                  render: (row) => (
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-semibold text-slate-900 tabular-nums">
                        {row.invoiceNumber}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-slate-500">
                        {row.subscriptionNumber || 'No subscription linked'}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'issued',
                  header: 'Issued',
                  render: (row) => (
                    <span className="text-[11.5px] tabular-nums text-slate-600">
                      {formatDate(row.issueDate)}
                    </span>
                  ),
                },
                {
                  key: 'due',
                  header: 'Due date',
                  render: (row) => (
                    <span className="text-[11.5px] tabular-nums text-slate-600">
                      {formatDate(row.dueDate)}
                    </span>
                  ),
                },
                {
                  key: 'total',
                  header: 'Total',
                  render: (row) => (
                    <span className="text-[12.5px] font-semibold text-slate-900 tabular-nums">
                      {formatMoney(row.totals.total, row.currency)}
                    </span>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row) => (
                    <div className="flex flex-wrap gap-1">
                      <StatusBadge tone={invoiceStatusTone(row.status)}>{row.status}</StatusBadge>
                      <StatusBadge tone={invoiceWorkflowTone(row.workflowState)}>
                        {row.workflowState}
                      </StatusBadge>
                    </div>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  align: 'right',
                  render: (row) => (
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`${base}/invoices/${row.id}`} className={viewButtonClass}>
                        View
                      </Link>
                      <AdminButton
                        size="sm"
                        icon={Download}
                        disabled={busyId === row.id}
                        onClick={() => handleDownload(row)}
                        title={
                          demo
                            ? 'Download a locally generated sample PDF'
                            : 'Download the invoice PDF from the backend'
                        }
                      >
                        {busyId === row.id ? '…' : 'PDF'}
                      </AdminButton>
                    </div>
                  ),
                },
              ]}
            />
          </Panel>

          <CustomerDemoNotice demo={demo}>
            Demo invoice downloads generate a clearly labelled sample PDF in your browser. No real
            invoice document is fetched from a billing service.
          </CustomerDemoNotice>
        </>
      )}
    </div>
  )
}
