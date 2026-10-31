import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock,
  CheckCircle2,
  FileClock,
  Layers,
  RefreshCw,
  Search,
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
  SUBSCRIPTION_STATUS_OPTIONS,
  formatDate,
  formatMoney,
  subscriptionStatusTone,
} from '../../lib/customerFormat'

const viewButtonClass =
  'inline-flex h-8 items-center justify-center rounded border border-slate-200 bg-white px-2.5 text-[11.5px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-[#f8fafc]'

export default function CustomerSubscriptions() {
  const base = useCustomerBasePath()
  const { demo, status, error, subscriptions, reload } = useCustomerPortal()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return subscriptions.filter((subscription) => {
      const matchesQuery =
        !query ||
        subscription.subscriptionNumber.toLowerCase().includes(query) ||
        subscription.planName.toLowerCase().includes(query) ||
        subscription.productName.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [subscriptions, search, statusFilter])

  const activeCount = subscriptions.filter((item) => item.status === 'Active').length
  const pendingCount = subscriptions.filter((item) =>
    ['Quotation', 'Confirmed', 'Draft'].includes(item.status),
  ).length
  const renewalCount = subscriptions.filter(
    (item) => item.status === 'Active' && item.renewalDate,
  ).length

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Customer portal"
        title="My Subscriptions"
        description="Every subscription attached to your account, with plan policy, renewal dates and self-service actions."
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
            title="Subscriptions could not be loaded"
            description={error || 'The customer subscriptions service did not return a response.'}
            onRetry={reload}
          />
        </Panel>
      ) : (
        <>
          <AdminSummaryCards
            items={[
              {
                label: 'Subscriptions',
                value: subscriptions.length,
                hint: 'Owned by your account',
                icon: Layers,
                tone: 'sky',
              },
              {
                label: 'Active',
                value: activeCount,
                hint: 'Currently in service',
                icon: CheckCircle2,
                tone: 'teal',
              },
              {
                label: 'In progress',
                value: pendingCount,
                hint: 'Draft, quotation or confirmed',
                icon: FileClock,
                tone: 'amber',
              },
              {
                label: 'Scheduled renewals',
                value: renewalCount,
                hint: 'Active with a renewal date',
                icon: CalendarClock,
                tone: 'slate',
              },
            ]}
          />

          <Panel
            title="Subscription list"
            description="Only subscriptions returned for your authenticated customer account are shown."
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
                  placeholder="Search subscription number, plan or product"
                  aria-label="Search subscriptions"
                  className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-[12.5px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#146c94] focus:ring-1 focus:ring-[#146c94]"
                />
              </div>
              <AdminSelect
                id="customer-subscription-status-filter"
                label="Status filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                {SUBSCRIPTION_STATUS_OPTIONS.map((option) => (
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
              emptyTitle="No subscriptions match your filters"
              emptyDescription="Try a different search or status filter. New subscriptions will appear here once they are assigned to your account."
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
                  key: 'product',
                  header: 'Product',
                  render: (row) => (
                    <div className="min-w-0 text-[11.5px] text-slate-600">
                      <p className="truncate">{row.productName}</p>
                      <p className="text-slate-500">Qty {row.quantity}</p>
                    </div>
                  ),
                },
                {
                  key: 'dates',
                  header: 'Term',
                  render: (row) => (
                    <div className="text-[11.5px] tabular-nums text-slate-600">
                      <p>{formatDate(row.startDate)}</p>
                      <p className="text-slate-500">to {formatDate(row.endDate)}</p>
                    </div>
                  ),
                },
                {
                  key: 'renewal',
                  header: 'Renewal',
                  render: (row) => (
                    <span className="text-[11.5px] tabular-nums text-slate-600">
                      {formatDate(row.renewalDate)}
                    </span>
                  ),
                },
                {
                  key: 'price',
                  header: 'Price',
                  render: (row) => (
                    <div className="text-[12.5px] font-semibold text-slate-900 tabular-nums">
                      <p>{formatMoney(row.price, row.currency)}</p>
                      <p className="text-[11px] font-normal text-slate-500">
                        {row.billingFrequency}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row) => (
                    <StatusBadge tone={subscriptionStatusTone(row.status)}>
                      {row.status}
                    </StatusBadge>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  align: 'right',
                  render: (row) => (
                    <Link to={`${base}/subscriptions/${row.id}`} className={viewButtonClass}>
                      View details
                    </Link>
                  ),
                },
              ]}
            />
          </Panel>

          <CustomerDemoNotice demo={demo}>
            Demo subscriptions are local sample records. Actions on a subscription detail page only
            simulate pause, renewal and cancellation; production changes must be authorized by the
            backend.
          </CustomerDemoNotice>
        </>
      )}
    </div>
  )
}
