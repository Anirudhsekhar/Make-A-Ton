import { useMemo, useState } from 'react'
import { ReceiptText, Search } from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
import AdminDataTable from '../../components/admin/AdminDataTable'
import { AdminSelect } from '../../components/admin/AdminField'
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

export default function SalesInvoices() {
  const { invoices } = useStaffDemoData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return invoices.filter((invoice) => {
      const matchesQuery =
        !query ||
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.customerName.toLowerCase().includes(query) ||
        invoice.companyName.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [invoices, search, statusFilter])

  const statuses = Array.from(new Set(invoices.map((invoice) => invoice.status)))

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Sales Rep portal"
        title="Invoices"
        description="Read-only invoice list. Sales Reps can review status and totals but cannot edit invoices or access payment controls."
        actions={<SampleDataBadge className="hidden sm:inline-flex" />}
      />

      <AdminSummaryCards
        items={[
          {
            label: 'Invoices',
            value: invoices.length,
            hint: 'Read-only billing view',
            icon: ReceiptText,
            tone: 'sky',
          },
          {
            label: 'Outstanding',
            value: invoices.filter((invoice) => invoice.status === 'Outstanding').length,
            hint: 'Awaiting payment',
            icon: ReceiptText,
            tone: 'amber',
          },
          {
            label: 'Overdue',
            value: invoices.filter((invoice) => invoice.status === 'Overdue').length,
            hint: 'Past due date',
            icon: ReceiptText,
            tone: 'amber',
          },
          {
            label: 'Paid',
            value: invoices.filter((invoice) => invoice.status === 'Paid').length,
            hint: 'Settled invoices',
            icon: ReceiptText,
            tone: 'teal',
          },
        ]}
      />

      <Panel
        title="Invoice list"
        description="No create, edit, payment or finance actions are available to the Sales Rep role."
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
            id="sales-invoice-status-filter"
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
              key: 'dates',
              header: 'Dates',
              render: (row) => (
                <div className="text-[11.5px] tabular-nums text-slate-600">
                  <p>Issued {formatDate(row.issueDate)}</p>
                  <p className="text-slate-500">Due {formatDate(row.dueDate)}</p>
                </div>
              ),
            },
            {
              key: 'total',
              header: 'Total',
              align: 'right',
              render: (row) => (
                <span className="font-semibold tabular-nums text-slate-900">
                  {formatMoney(row.totals.total, row.currency)}
                </span>
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
                <button type="button" onClick={() => setSelected(row)} className={viewButtonClass}>
                  View
                </button>
              ),
            },
          ]}
        />
      </Panel>

      <StaffDemoNotice>
        Invoice data is read-only for the Sales Rep role. Invoice generation, confirmation, sending
        and payment recording belong to the Finance Lead role.
      </StaffDemoNotice>

      <AdminModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.invoiceNumber ?? 'Invoice'}
        description={selected ? `${selected.customerName} - ${selected.companyName}` : undefined}
        footer={<AdminButton onClick={() => setSelected(null)}>Close</AdminButton>}
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
                <dt className="text-slate-500">Subscription</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {selected.subscriptionId ?? 'Not linked'}
                </dd>
              </div>
            </dl>

            <div className="overflow-x-auto rounded border border-slate-200">
              <table className="w-full min-w-[480px] text-left text-[12px]">
                <thead>
                  <tr className="border-b border-[#f1f5f9] bg-[#f8fafc] text-[10.5px] uppercase tracking-[0.07em] text-slate-500">
                    <th className="px-3 py-2 font-semibold">Product</th>
                    <th className="px-3 py-2 text-right font-semibold">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.lineItems.map((line) => (
                    <tr key={line.id} className="border-b border-[#f1f5f9] last:border-0">
                      <td className="px-3 py-2 font-medium text-slate-900">{line.productName}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{line.quantity}</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-900">
                        {formatMoney(line.amount, selected.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[12px] leading-relaxed text-slate-500">{selected.notes}</p>
          </div>
        )}
      </AdminModal>
    </div>
  )
}
