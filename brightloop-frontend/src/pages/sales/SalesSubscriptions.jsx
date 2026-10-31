import { useMemo, useState } from 'react'
import { ArrowRight, Layers, Plus, Search } from 'lucide-react'
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
import { formatDate, formatMoney, subscriptionStatusTone } from '../../lib/customerFormat'

const viewButtonClass =
  'inline-flex h-8 items-center justify-center rounded border border-slate-200 bg-white px-2.5 text-[11.5px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-[#f8fafc]'

export default function SalesSubscriptions() {
  const {
    customers,
    quotationTemplates,
    subscriptions,
    createSubscriptionFromTemplate,
    advanceSubscriptionStatus,
  } = useStaffDemoData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ customerId: '', templateId: '' })
  const [notice, setNotice] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return subscriptions.filter((subscription) => {
      const matchesQuery =
        !query ||
        subscription.subscriptionNumber.toLowerCase().includes(query) ||
        subscription.customerName.toLowerCase().includes(query) ||
        subscription.planName.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [subscriptions, search, statusFilter])

  const openCreate = () => {
    setForm({
      customerId: customers[0]?.id ?? '',
      templateId: quotationTemplates[0]?.id ?? '',
    })
    setCreateOpen(true)
  }

  const handleCreate = () => {
    const result = createSubscriptionFromTemplate(form.templateId, form.customerId)
    setNotice(result.message)
    if (result.ok) setCreateOpen(false)
  }

  const handleAdvance = (subscription) => {
    const result = advanceSubscriptionStatus(subscription.id)
    setNotice(result.message)
  }

  const statuses = Array.from(new Set(subscriptions.map((subscription) => subscription.status)))

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Sales Rep portal"
        title="Subscriptions"
        description="Create subscriptions from quotation templates and move them through the sales lifecycle."
        actions={
          <>
            <SampleDataBadge className="hidden sm:inline-flex" />
            <AdminButton variant="primary" icon={Plus} onClick={openCreate}>
              Create from template
            </AdminButton>
          </>
        }
      />

      {notice && <AdminFlashMessage onDismiss={() => setNotice('')}>{notice}</AdminFlashMessage>}

      <AdminSummaryCards
        items={[
          {
            label: 'Subscriptions',
            value: subscriptions.length,
            hint: 'In the demo workspace',
            icon: Layers,
            tone: 'sky',
          },
          {
            label: 'Active',
            value: subscriptions.filter((item) => item.status === 'Active').length,
            hint: 'Currently billing',
            icon: Layers,
            tone: 'teal',
          },
          {
            label: 'In progress',
            value: subscriptions.filter((item) =>
              ['Draft', 'Quotation', 'Confirmed'].includes(item.status),
            ).length,
            hint: 'Not yet active',
            icon: Layers,
            tone: 'amber',
          },
          {
            label: 'Paused',
            value: subscriptions.filter((item) => item.status === 'Paused').length,
            hint: 'Temporarily stopped',
            icon: Layers,
            tone: 'slate',
          },
        ]}
      />

      <Panel
        title="Subscription list"
        description="Sales can manage lifecycle status but cannot edit customer records or invoices."
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
              placeholder="Search number, customer or plan"
              aria-label="Search subscriptions"
              className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-[12.5px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#146c94] focus:ring-1 focus:ring-[#146c94]"
            />
          </div>
          <AdminSelect
            id="sales-subscription-status-filter"
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
          emptyTitle="No subscriptions match your filters"
          emptyDescription="Try another search or status filter."
          columns={[
            {
              key: 'number',
              header: 'Subscription',
              render: (row) => (
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold text-slate-900 tabular-nums">
                    {row.subscriptionNumber}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-slate-500">{row.planName}</p>
                </div>
              ),
            },
            {
              key: 'customer',
              header: 'Customer',
              render: (row) => (
                <div className="min-w-0 text-[11.5px] text-slate-600">
                  <p className="truncate">{row.customerName}</p>
                  <p className="truncate text-slate-500">{row.companyName}</p>
                </div>
              ),
            },
            {
              key: 'term',
              header: 'Term',
              render: (row) => (
                <div className="text-[11.5px] tabular-nums text-slate-600">
                  <p>{formatDate(row.startDate)}</p>
                  <p className="text-slate-500">to {formatDate(row.endDate)}</p>
                </div>
              ),
            },
            {
              key: 'price',
              header: 'Price',
              render: (row) => (
                <div className="text-[12.5px] font-semibold text-slate-900 tabular-nums">
                  <p>{formatMoney(row.price, row.currency)}</p>
                  <p className="text-[11px] font-normal text-slate-500">{row.billingFrequency}</p>
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <StatusBadge tone={subscriptionStatusTone(row.status)}>{row.status}</StatusBadge>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              align: 'right',
              render: (row) => (
                <div className="flex items-center justify-end gap-1.5">
                  <button type="button" onClick={() => setSelected(row)} className={viewButtonClass}>
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdvance(row)}
                    className={viewButtonClass}
                  >
                    Advance
                    <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Panel>

      <StaffDemoNotice>
        Sales lifecycle changes are simulated in local state. Production actions must respect plan
        pause, renewal and early-close policies and be authorized by the backend.
      </StaffDemoNotice>

      <AdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create subscription from template"
        description="Choose an existing customer and quotation template. The new subscription starts as a draft."
        footer={
          <>
            <AdminButton onClick={() => setCreateOpen(false)}>Cancel</AdminButton>
            <AdminButton variant="primary" onClick={handleCreate}>
              Create subscription
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <AdminSelect
            id="sales-subscription-customer"
            label="Customer"
            value={form.customerId}
            onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}
            required
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.fullName} - {customer.companyName}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect
            id="sales-subscription-template"
            label="Quotation template"
            value={form.templateId}
            onChange={(event) => setForm((current) => ({ ...current, templateId: event.target.value }))}
            required
          >
            {quotationTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.planName}
              </option>
            ))}
          </AdminSelect>
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.subscriptionNumber ?? 'Subscription'}
        description={
          selected ? `${selected.customerName} - ${selected.planName}` : undefined
        }
        footer={<AdminButton onClick={() => setSelected(null)}>Close</AdminButton>}
      >
        {selected && (
          <div className="space-y-5">
            <dl className="grid gap-3 text-[12.5px] sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="mt-1">
                  <StatusBadge tone={subscriptionStatusTone(selected.status)}>
                    {selected.status}
                  </StatusBadge>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Start date</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {formatDate(selected.startDate)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Renewal date</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {formatDate(selected.renewalDate)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Billing</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{selected.billingFrequency}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Payment terms</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{selected.paymentTerms}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Total</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">
                  {formatMoney(selected.totals.total, selected.currency)}
                </dd>
              </div>
            </dl>

            <div>
              <h3 className="text-[13px] font-semibold text-slate-900">Line items</h3>
              <ul className="mt-2 divide-y divide-[#f1f5f9] rounded border border-slate-200">
                {selected.lineItems.map((line) => (
                  <li
                    key={line.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-[12px]"
                  >
                    <span className="font-medium text-slate-900">
                      {line.productName} x {line.quantity}
                    </span>
                    <span className="tabular-nums text-slate-600">
                      {formatMoney(line.amount, selected.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-slate-900">Status history</h3>
              <ul className="mt-2 space-y-2 text-[12px]">
                {selected.statusHistory.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <span className="w-24 shrink-0 tabular-nums text-slate-500">
                      {formatDate(entry.date)}
                    </span>
                    <span className="min-w-0">
                      <span className="font-semibold text-slate-900">{entry.status}</span>
                      <span className="block text-slate-500">{entry.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  )
}
