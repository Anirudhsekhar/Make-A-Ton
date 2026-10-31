import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CalendarDays,
  Layers,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
} from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog'
import AdminDataTable from '../../components/admin/AdminDataTable'
import {
  AdminCheckbox,
  AdminInput,
  AdminSelect,
} from '../../components/admin/AdminField'
import AdminFlashMessage from '../../components/admin/AdminFlashMessage'
import AdminModal from '../../components/admin/AdminModal'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminSummaryCards from '../../components/admin/AdminSummaryCards'
import Panel from '../../components/admin/Panel'
import SampleDataBadge from '../../components/admin/SampleDataBadge'
import SampleDataNotice from '../../components/admin/SampleDataNotice'
import StatusBadge from '../../components/admin/StatusBadge'
import StatusToggle from '../../components/admin/StatusToggle'
import { useAdminDemoData } from '../../context/AdminDemoDataContext'
import { formatCurrency, formatDate } from '../../lib/adminFormat'
import {
  BILLING_PERIOD_OPTIONS,
  STATUS_OPTIONS,
} from '../../data/admin/adminDemoData'

const EMPTY_PLAN = {
  name: '',
  productId: '',
  price: '',
  billingPeriod: 'Monthly',
  minimumQuantity: '1',
  startDate: '',
  endDate: '',
  autoClose: true,
  allowEarlyClose: false,
  allowPause: true,
  allowRenew: true,
  status: 'Active',
}

const PERIOD_SUFFIX = {
  Daily: '/day',
  Weekly: '/week',
  Monthly: '/mo',
  Yearly: '/yr',
}

function validatePlan(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Plan name is required.'
  if (!form.productId) errors.productId = 'Select a linked product.'

  const price = Number(form.price)
  if (form.price === '' || Number.isNaN(price) || price < 0) {
    errors.price = 'Price must be zero or greater.'
  }

  if (!form.billingPeriod) errors.billingPeriod = 'Select a billing period.'

  const minimumQuantity = Number(form.minimumQuantity)
  if (
    form.minimumQuantity === '' ||
    Number.isNaN(minimumQuantity) ||
    minimumQuantity < 1 ||
    !Number.isInteger(minimumQuantity)
  ) {
    errors.minimumQuantity = 'Minimum quantity must be a whole number of at least 1.'
  }

  if (!form.startDate) errors.startDate = 'Start date is required.'
  if (!form.endDate) errors.endDate = 'End date is required.'
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = 'End date must be on or after the start date.'
  }

  return errors
}

export default function AdminPlans() {
  const { products, plans, createPlan, updatePlan, togglePlanStatus, deletePlan } =
    useAdminDemoData()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedProductId = searchParams.get('product')
  const filterProductId = searchParams.get('filter')
  const initialProductId = products.some((product) => product.id === requestedProductId)
    ? requestedProductId
    : ''
  const initialFilterProductId = products.some((product) => product.id === filterProductId)
    ? filterProductId
    : 'all'
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [productFilter, setProductFilter] = useState(initialFilterProductId)
  const [modalMode, setModalMode] = useState(initialProductId ? 'add' : null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(
    initialProductId ? { ...EMPTY_PLAN, productId: initialProductId } : EMPTY_PLAN,
  )
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  )

  useEffect(() => {
    if (requestedProductId || filterProductId) {
      setSearchParams({}, { replace: true })
    }
  }, [requestedProductId, filterProductId, setSearchParams])

  const filteredPlans = useMemo(() => {
    const query = search.trim().toLowerCase()
    return plans.filter((plan) => {
      const productName = productMap.get(plan.productId)?.name ?? ''
      const matchesQuery =
        !query ||
        plan.name.toLowerCase().includes(query) ||
        productName.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || plan.status === statusFilter
      const matchesProduct = productFilter === 'all' || plan.productId === productFilter
      return matchesQuery && matchesStatus && matchesProduct
    })
  }, [plans, productMap, search, statusFilter, productFilter])

  const activeCount = plans.filter((plan) => plan.status === 'Active').length
  const coveredProducts = new Set(plans.map((plan) => plan.productId)).size
  const averagePrice =
    plans.length === 0
      ? 0
      : plans.reduce((total, plan) => total + plan.price, 0) / plans.length

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_PLAN)
    setErrors({})
    setModalMode('add')
  }

  const openEdit = (plan) => {
    setEditingId(plan.id)
    setForm({
      name: plan.name,
      productId: plan.productId,
      price: String(plan.price),
      billingPeriod: plan.billingPeriod,
      minimumQuantity: String(plan.minimumQuantity),
      startDate: plan.startDate,
      endDate: plan.endDate,
      autoClose: plan.autoClose,
      allowEarlyClose: plan.allowEarlyClose,
      allowPause: plan.allowPause,
      allowRenew: plan.allowRenew,
      status: plan.status,
    })
    setErrors({})
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingId(null)
    setForm(EMPTY_PLAN)
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

  const handleToggleField = (field) => {
    setForm((current) => ({ ...current, [field]: !current[field] }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validatePlan(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const payload = {
      name: form.name.trim(),
      productId: form.productId,
      price: Number(form.price),
      billingPeriod: form.billingPeriod,
      minimumQuantity: Number(form.minimumQuantity),
      startDate: form.startDate,
      endDate: form.endDate,
      autoClose: form.autoClose,
      allowEarlyClose: form.allowEarlyClose,
      allowPause: form.allowPause,
      allowRenew: form.allowRenew,
      status: form.status,
    }

    if (editingId) {
      updatePlan(editingId, payload)
      setNotice(`${payload.name} was updated in the demo plan list.`)
    } else {
      createPlan(payload)
      setNotice(`${payload.name} was added to the demo plan list.`)
    }

    closeModal()
  }

  const handleToggle = (plan) => {
    togglePlanStatus(plan.id)
    setNotice(
      `${plan.name} is now ${plan.status === 'Active' ? 'inactive' : 'active'} in the demo list.`,
    )
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deletePlan(deleteTarget.id)
    setNotice(`${deleteTarget.name} was deleted from the demo plan list.`)
    setDeleteTarget(null)
  }

  const policyLabels = (plan) => {
    const labels = []
    if (plan.autoClose) labels.push('Auto-close')
    if (plan.allowEarlyClose) labels.push('Early close')
    if (plan.allowPause) labels.push('Pause')
    if (plan.allowRenew) labels.push('Renew')
    return labels
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Billing"
        title="Subscription plans"
        description="Connect plans to existing products, set billing cadence and control availability, closure and renewal policies."
        actions={
          <>
            <SampleDataBadge className="hidden sm:inline-flex" />
            <AdminButton variant="primary" icon={Plus} onClick={openAdd}>
              Add plan
            </AdminButton>
          </>
        }
      />

      {notice && <AdminFlashMessage onDismiss={() => setNotice('')}>{notice}</AdminFlashMessage>}

      <AdminSummaryCards
        items={[
          { label: 'Plans', value: plans.length, hint: 'Across the catalog', icon: Layers, tone: 'sky' },
          { label: 'Active', value: activeCount, hint: 'Available to subscribe', icon: CalendarDays, tone: 'teal' },
          { label: 'Products covered', value: coveredProducts, hint: `${products.length} products total`, icon: Wallet, tone: 'slate' },
          { label: 'Average price', value: formatCurrency(averagePrice), hint: 'Across all demo plans', icon: Wallet, tone: 'amber' },
        ]}
      />

      <Panel
        title="Plan catalog"
        description="Every plan links to an existing product. Deleting a demo plan asks for confirmation."
        bodyClassName="p-0"
        actions={<span className="text-[11px] text-slate-500">{filteredPlans.length} shown</span>}
      >
        <div className="grid gap-3 border-b border-[#f1f5f9] px-4 py-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_170px_190px_170px]">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search plans or products"
              aria-label="Search plans"
              className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-[12.5px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#146c94] focus:ring-1 focus:ring-[#146c94]"
            />
          </div>
          <AdminSelect
            id="plan-status-filter"
            label="Status filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect
            id="plan-product-filter"
            label="Product filter"
            value={productFilter}
            onChange={(event) => setProductFilter(event.target.value)}
          >
            <option value="all">All products</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </AdminSelect>
          <div className="flex items-end">
            <AdminButton
              className="w-full"
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setProductFilter('all')
              }}
            >
              Clear filters
            </AdminButton>
          </div>
        </div>

        <AdminDataTable
          rows={filteredPlans}
          getRowId={(row) => row.id}
          emptyTitle="No plans match your filters"
          emptyDescription="Try a different search or filter, or create a plan for an existing product."
          emptyAction={
            <AdminButton className="mt-2" icon={Plus} onClick={openAdd}>
              Add plan
            </AdminButton>
          }
          columns={[
            {
              key: 'plan',
              header: 'Plan',
              render: (row) => (
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-slate-900">{row.name}</p>
                  <p className="mt-0.5 truncate text-[11.5px] text-slate-500">
                    {productMap.get(row.productId)?.name ?? 'Unknown product'}
                  </p>
                </div>
              ),
            },
            {
              key: 'billing',
              header: 'Billing period',
              render: (row) => <StatusBadge tone="accent">{row.billingPeriod}</StatusBadge>,
            },
            {
              key: 'price',
              header: 'Price',
              render: (row) => (
                <span className="tabular-nums text-[12.5px] font-semibold text-slate-900">
                  {formatCurrency(row.price)}
                  <span className="font-normal text-slate-500">
                    {PERIOD_SUFFIX[row.billingPeriod] ?? ''}
                  </span>
                </span>
              ),
            },
            {
              key: 'quantity',
              header: 'Min. qty',
              render: (row) => <span className="tabular-nums">{row.minimumQuantity}</span>,
            },
            {
              key: 'availability',
              header: 'Availability',
              render: (row) => (
                <div className="text-[11.5px] tabular-nums text-slate-600">
                  <p>{formatDate(row.startDate)}</p>
                  <p className="text-slate-500">to {formatDate(row.endDate)}</p>
                </div>
              ),
            },
            {
              key: 'policy',
              header: 'Policy',
              render: (row) => (
                <div className="flex max-w-[210px] flex-wrap gap-1">
                  {policyLabels(row).map((label) => (
                    <span
                      key={label}
                      className="rounded border border-slate-200 bg-[#f8fafc] px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <StatusToggle
                  status={row.status}
                  label={row.name}
                  onToggle={() => handleToggle(row)}
                />
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              align: 'right',
              render: (row) => (
                <div className="flex justify-end gap-1.5">
                  <AdminButton size="sm" icon={Pencil} onClick={() => openEdit(row)}>
                    Edit
                  </AdminButton>
                  <AdminButton
                    size="sm"
                    variant="danger"
                    icon={Trash2}
                    onClick={() => setDeleteTarget(row)}
                    aria-label={`Delete ${row.name}`}
                  />
                </div>
              ),
            },
          ]}
        />
      </Panel>

      <SampleDataNotice>
        Plans are local sample data linked to demo products. Deletion only affects this browser
        session. Real deletion must respect backend referential-integrity rules for active
        subscriptions.
      </SampleDataNotice>

      <AdminModal
        open={modalMode !== null}
        onClose={closeModal}
        size="lg"
        title={modalMode === 'edit' ? 'Edit plan' : 'Add plan'}
        description="Prices are in USD. Availability dates control when the plan can be sold."
        footer={
          <>
            <AdminButton onClick={closeModal}>Cancel</AdminButton>
            <AdminButton variant="primary" type="submit" form="plan-form">
              {modalMode === 'edit' ? 'Save changes' : 'Add plan'}
            </AdminButton>
          </>
        }
      >
        <form id="plan-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              id="plan-name"
              name="name"
              label="Plan name"
              required
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g. Core Monthly"
            />
            <AdminSelect
              id="plan-product"
              name="productId"
              label="Linked product"
              required
              value={form.productId}
              onChange={handleChange}
              error={errors.productId}
            >
              <option value="" disabled>
                Select a product
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </AdminSelect>
            <AdminInput
              id="plan-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              label="Price (USD)"
              required
              value={form.price}
              onChange={handleChange}
              error={errors.price}
              placeholder="0.00"
            />
            <AdminSelect
              id="plan-billing-period"
              name="billingPeriod"
              label="Billing period"
              required
              value={form.billingPeriod}
              onChange={handleChange}
              error={errors.billingPeriod}
            >
              {BILLING_PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AdminSelect>
            <AdminInput
              id="plan-minimum-quantity"
              name="minimumQuantity"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              label="Minimum quantity"
              required
              value={form.minimumQuantity}
              onChange={handleChange}
              error={errors.minimumQuantity}
            />
            <AdminSelect
              id="plan-status"
              name="status"
              label="Status"
              required
              value={form.status}
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AdminSelect>
            <AdminInput
              id="plan-start-date"
              name="startDate"
              type="date"
              label="Available from"
              required
              value={form.startDate}
              onChange={handleChange}
              error={errors.startDate}
            />
            <AdminInput
              id="plan-end-date"
              name="endDate"
              type="date"
              label="Available until"
              required
              value={form.endDate}
              onChange={handleChange}
              error={errors.endDate}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-[12.5px] font-semibold text-slate-900">Plan policies</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <AdminCheckbox
                id="plan-auto-close"
                label="Auto-close at end"
                description="Close the subscription automatically when availability ends."
                checked={form.autoClose}
                onChange={() => handleToggleField('autoClose')}
              />
              <AdminCheckbox
                id="plan-early-close"
                label="Allow early close"
                description="Customers may cancel before the end date."
                checked={form.allowEarlyClose}
                onChange={() => handleToggleField('allowEarlyClose')}
              />
              <AdminCheckbox
                id="plan-pause"
                label="Allow pause"
                description="Subscriptions can be paused and resumed."
                checked={form.allowPause}
                onChange={() => handleToggleField('allowPause')}
              />
              <AdminCheckbox
                id="plan-renew"
                label="Allow renew"
                description="Customers can renew when the current term ends."
                checked={form.allowRenew}
                onChange={() => handleToggleField('allowRenew')}
              />
            </div>
          </fieldset>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={deleteTarget !== null}
        title="Delete plan?"
        description={
          deleteTarget
            ? `Delete “${deleteTarget.name}” from the demo plan list? This only affects the current browser session. Real deletion is subject to backend referential-integrity rules.`
            : ''
        }
        confirmLabel="Delete plan"
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
