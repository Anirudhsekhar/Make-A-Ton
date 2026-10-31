import { useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
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
import { formatDate } from '../../lib/adminFormat'
import { formatMoney, subscriptionStatusTone } from '../../lib/customerFormat'

const viewButtonClass =
  'inline-flex h-8 items-center justify-center rounded border border-slate-200 bg-white px-2.5 text-[11.5px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-[#f8fafc]'

export default function SalesCustomers() {
  const { customers, subscriptions } = useStaffDemoData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return customers.filter((customer) => {
      const matchesQuery =
        !query ||
        customer.fullName.toLowerCase().includes(query) ||
        customer.companyName.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [customers, search, statusFilter])

  const selectedSubscriptions = selected
    ? subscriptions.filter((subscription) => subscription.customerId === selected.id)
    : []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Sales Rep portal"
        title="Customers"
        description="Read-only customer directory. Sales Reps can review accounts but cannot add, edit or delete customer records."
        actions={<SampleDataBadge className="hidden sm:inline-flex" />}
      />

      <AdminSummaryCards
        items={[
          {
            label: 'Customers',
            value: customers.length,
            hint: 'In the demo directory',
            icon: Users,
            tone: 'sky',
          },
          {
            label: 'Active',
            value: customers.filter((customer) => customer.status === 'Active').length,
            hint: 'Active accounts',
            icon: Users,
            tone: 'teal',
          },
          {
            label: 'Prospects',
            value: customers.filter((customer) => customer.status === 'Prospect').length,
            hint: 'Not yet subscribed',
            icon: Users,
            tone: 'amber',
          },
          {
            label: 'Subscriptions',
            value: subscriptions.length,
            hint: 'Across all customers',
            icon: Users,
            tone: 'slate',
          },
        ]}
      />

      <Panel
        title="Customer directory"
        description="View-only list. No customer create, edit or delete actions are available to this role."
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
              placeholder="Search customer, company or email"
              aria-label="Search customers"
              className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-[12.5px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#146c94] focus:ring-1 focus:ring-[#146c94]"
            />
          </div>
          <AdminSelect
            id="sales-customer-status-filter"
            label="Status filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Prospect">Prospect</option>
          </AdminSelect>
        </div>

        <AdminDataTable
          rows={filtered}
          getRowId={(row) => row.id}
          emptyTitle="No customers match your filters"
          emptyDescription="Try a different search or status filter."
          columns={[
            {
              key: 'name',
              header: 'Customer',
              render: (row) => (
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold text-slate-900">
                    {row.fullName}
                  </p>
                  <p className="mt-0.5 truncate text-[11.5px] text-slate-500">{row.companyName}</p>
                </div>
              ),
            },
            {
              key: 'contact',
              header: 'Contact',
              render: (row) => (
                <div className="min-w-0 text-[11.5px] text-slate-600">
                  <p className="truncate">{row.email}</p>
                  <p className="text-slate-500">{row.phoneNumber}</p>
                </div>
              ),
            },
            { key: 'industry', header: 'Industry', render: (row) => row.industry },
            {
              key: 'subscriptions',
              header: 'Subscriptions',
              render: (row) => (
                <span className="text-[12px] tabular-nums text-slate-600">
                  {subscriptions.filter((item) => item.customerId === row.id).length}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <StatusBadge tone={row.status === 'Active' ? 'success' : 'warning'}>
                  {row.status}
                </StatusBadge>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              align: 'right',
              render: (row) => (
                <button type="button" onClick={() => setSelected(row)} className={viewButtonClass}>
                  View details
                </button>
              ),
            },
          ]}
        />
      </Panel>

      <StaffDemoNotice>
        Customer detail is read-only for the Sales Rep role. Editing customer records requires the
        Admin role and must be enforced by the backend.
      </StaffDemoNotice>

      <AdminModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.fullName ?? 'Customer'}
        description={selected?.companyName}
        footer={<AdminButton onClick={() => setSelected(null)}>Close</AdminButton>}
      >
        {selected && (
          <div className="space-y-5">
            <dl className="grid gap-3 text-[12.5px] sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{selected.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{selected.phoneNumber}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Industry</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{selected.industry}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Account owner</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{selected.owner}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Customer since</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {formatDate(selected.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="mt-1">
                  <StatusBadge tone={selected.status === 'Active' ? 'success' : 'warning'}>
                    {selected.status}
                  </StatusBadge>
                </dd>
              </div>
            </dl>

            <div>
              <h3 className="text-[13px] font-semibold text-slate-900">Subscriptions</h3>
              {selectedSubscriptions.length === 0 ? (
                <p className="mt-2 text-[12px] text-slate-500">
                  No subscriptions are linked to this customer yet.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-[#f1f5f9] rounded border border-slate-200">
                  {selectedSubscriptions.map((subscription) => (
                    <li
                      key={subscription.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
                    >
                      <span className="min-w-0">
                        <span className="block text-[12px] font-semibold text-slate-900">
                          {subscription.subscriptionNumber}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          {subscription.planName}
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold tabular-nums text-slate-900">
                          {formatMoney(subscription.price, subscription.currency)}
                        </span>
                        <StatusBadge tone={subscriptionStatusTone(subscription.status)}>
                          {subscription.status}
                        </StatusBadge>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  )
}
