import { useMemo, useState } from 'react'
import {
  BadgePercent,
  CalendarDays,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Tag,
} from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
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
import StatusToggle from '../../components/admin/StatusToggle'
import { useAdminDemoData } from '../../context/AdminDemoDataContext'
import { formatCurrency, formatDate } from '../../lib/adminFormat'
import { STATUS_OPTIONS } from '../../data/admin/adminDemoData'

const EMPTY_DISCOUNT = {
  code: '',
  type: 'Percentage',
  value: '',
  minimumType: 'purchase',
  minimumValue: '',
  startDate: '',
  endDate: '',
  usageLimit: '',
  applicability: 'Whole subscription',
  productIds: [],
  status: 'Active',
}

const TYPE_OPTIONS = [
  { value: 'Fixed amount', label: 'Fixed amount' },
  { value: 'Percentage', label: 'Percentage' },
]

function validateDiscount(form) {
  const errors = {}
  if (!form.code.trim()) errors.code = 'Discount name or code is required.'
  if (!form.type) errors.type = 'Select a discount type.'

  const value = Number(form.value)
  if (form.value === '' || Number.isNaN(value)) {
    errors.value = 'Enter a numeric discount value.'
  } else if (form.type === 'Percentage' && (value < 0 || value > 100)) {
    errors.value = 'Percentage must be between 0 and 100.'
  } else if (form.type === 'Fixed amount' && value < 0) {
    errors.value = 'Fixed amount must be zero or greater.'
  }

  const minimumValue = Number(form.minimumValue)
  if (form.minimumValue === '' || Number.isNaN(minimumValue)) {
    errors.minimumValue = 'Enter a minimum value.'
  } else if (form.minimumType === 'purchase' && minimumValue < 0) {
    errors.minimumValue = 'Minimum purchase must be zero or greater.'
  } else if (
    form.minimumType === 'quantity' &&
    (minimumValue < 1 || !Number.isInteger(minimumValue))
  ) {
    errors.minimumValue = 'Minimum quantity must be a whole number of at least 1.'
  }

  if (!form.startDate) errors.startDate = 'Start date is required.'
  if (!form.endDate) errors.endDate = 'End date is required.'
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = 'End date must be on or after the start date.'
  }

  if (form.usageLimit !== '') {
    const usageLimit = Number(form.usageLimit)
    if (Number.isNaN(usageLimit) || usageLimit < 1 || !Number.isInteger(usageLimit)) {
      errors.usageLimit = 'Usage limit must be a whole number of at least 1, or left blank.'
    }
  }

  if (form.applicability === 'Selected products' && form.productIds.length === 0) {
    errors.productIds = 'Select at least one product for this discount.'
  }

  return errors
}

function discountLabel(discount) {
  if (discount.type === 'Percentage') return `${discount.value}% off`
  return `${formatCurrency(discount.value)} off`
}

function minimumLabel(discount) {
  if (discount.minimumType === 'purchase') {
    return `Min. purchase ${formatCurrency(discount.minimumValue)}`
  }
  return `Min. quantity ${discount.minimumValue}`
}

export default function AdminDiscounts() {
  const { discounts, products, createDiscount, updateDiscount, toggleDiscountStatus } =
    useAdminDemoData()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalMode, setModalMode] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_DISCOUNT)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  )

  const filteredDiscounts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return discounts.filter((discount) => {
      const matchesQuery =
        !query ||
        discount.code.toLowerCase().includes(query) ||
        discount.type.toLowerCase().includes(query)
      const matchesType = typeFilter === 'all' || discount.type === typeFilter
      const matchesStatus = statusFilter === 'all' || discount.status === statusFilter
      return matchesQuery && matchesType && matchesStatus
    })
  }, [discounts, search, typeFilter, statusFilter])

  const activeCount = discounts.filter((discount) => discount.status === 'Active').length
  const percentageCount = discounts.filter(
    (discount) => discount.type === 'Percentage',
  ).length
  const limitedCount = discounts.filter((discount) => discount.usageLimit !== null).length

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_DISCOUNT)
    setErrors({})
    setModalMode('add')
  }

  const openEdit = (discount) => {
    setEditingId(discount.id)
    setForm({
      code: discount.code,
      type: discount.type,
      value: String(discount.value),
      minimumType: discount.minimumType,
      minimumValue: String(discount.minimumValue),
      startDate: discount.startDate,
      endDate: discount.endDate,
      usageLimit: discount.usageLimit === null ? '' : String(discount.usageLimit),
      applicability: discount.applicability,
      productIds: [...discount.productIds],
      status: discount.status,
    })
    setErrors({})
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingId(null)
    setForm(EMPTY_DISCOUNT)
    setErrors({})
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => {
      const next = { ...current, [name]: value }
      if (name === 'type') next.value = ''
      if (name === 'minimumType') next.minimumValue = ''
      if (name === 'applicability' && value === 'Whole subscription') next.productIds = []
      return next
    })
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const handleProductToggle = (productId) => {
    setForm((current) => ({
      ...current,
      productIds: current.productIds.includes(productId)
        ? current.productIds.filter((id) => id !== productId)
        : [...current.productIds, productId],
    }))
    setErrors((current) => {
      if (!current.productIds) return current
      const next = { ...current }
      delete next.productIds
      return next
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateDiscount(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const payload = {
      code: form.code.trim(),
      type: form.type,
      value: Number(form.value),
      minimumType: form.minimumType,
      minimumValue: Number(form.minimumValue),
      startDate: form.startDate,
      endDate: form.endDate,
      usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
      applicability: form.applicability,
      productIds: form.applicability === 'Selected products' ? form.productIds : [],
      status: form.status,
    }

    if (editingId) {
      updateDiscount(editingId, payload)
      setNotice(`${payload.code} was updated in the demo discount list.`)
    } else {
      createDiscount(payload)
      setNotice(`${payload.code} was added to the demo discount list.`)
    }

    closeModal()
  }

  const handleToggle = (discount) => {
    toggleDiscountStatus(discount.id)
    setNotice(
      `${discount.code} is now ${discount.status === 'Active' ? 'inactive' : 'active'} in the demo list.`,
    )
  }

  const selectedProductNames = form.productIds
    .map((id) => productMap.get(id)?.name)
    .filter(Boolean)

  const formEligibility =
    form.minimumType === 'purchase'
      ? `minimum purchase of ${form.minimumValue ? formatCurrency(Number(form.minimumValue)) : '—'}`
      : `minimum quantity of ${form.minimumValue || '—'}`

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Billing"
        title="Discounts"
        description="Create discount codes with clear limits, validity windows and product scope. Enforcement and usage tracking belong to the backend."
        actions={
          <>
            <SampleDataBadge className="hidden sm:inline-flex" />
            <AdminButton variant="primary" icon={Plus} onClick={openAdd}>
              Add discount
            </AdminButton>
          </>
        }
      />

      {notice && <AdminFlashMessage onDismiss={() => setNotice('')}>{notice}</AdminFlashMessage>}

      <AdminSummaryCards
        items={[
          { label: 'Discounts', value: discounts.length, hint: 'Configured codes', icon: Tag, tone: 'sky' },
          { label: 'Active', value: activeCount, hint: 'Currently available', icon: BadgePercent, tone: 'teal' },
          { label: 'Percentage offers', value: percentageCount, hint: 'Rate-based discounts', icon: ShoppingBag, tone: 'slate' },
          { label: 'Usage limited', value: limitedCount, hint: 'Codes with a cap', icon: CalendarDays, tone: 'amber' },
        ]}
      />

      <Panel
        title="Discount rules"
        description="Eligibility is summarized here. Expiry, usage tracking and invoice application are handled by the billing service."
        bodyClassName="p-0"
        actions={<span className="text-[11px] text-slate-500">{filteredDiscounts.length} shown</span>}
      >
        <div className="grid gap-3 border-b border-[#f1f5f9] px-4 py-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_170px_170px]">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search discount codes"
              aria-label="Search discounts"
              className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-[12.5px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#146c94] focus:ring-1 focus:ring-[#146c94]"
            />
          </div>
          <AdminSelect
            id="discount-type-filter"
            label="Type filter"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="all">All types</option>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect
            id="discount-status-filter"
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
        </div>

        <AdminDataTable
          rows={filteredDiscounts}
          getRowId={(row) => row.id}
          emptyTitle="No discounts match your filters"
          emptyDescription="Try a different search or filter, or create a new discount code."
          emptyAction={
            <AdminButton className="mt-2" icon={Plus} onClick={openAdd}>
              Add discount
            </AdminButton>
          }
          columns={[
            {
              key: 'code',
              header: 'Code',
              render: (row) => (
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold uppercase tracking-[0.02em] text-slate-900">
                    {row.code}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-slate-500">{row.type}</p>
                </div>
              ),
            },
            {
              key: 'value',
              header: 'Value',
              render: (row) => (
                <span className="text-[12.5px] font-semibold text-slate-900 tabular-nums">
                  {discountLabel(row)}
                </span>
              ),
            },
            {
              key: 'eligibility',
              header: 'Eligibility',
              render: (row) => (
                <div className="text-[11.5px] text-slate-600">
                  <p>{minimumLabel(row)}</p>
                  <p className="text-slate-500">
                    {row.usageLimit === null ? 'Unlimited uses' : `${row.usageLimit} use limit`}
                  </p>
                </div>
              ),
            },
            {
              key: 'validity',
              header: 'Validity',
              render: (row) => (
                <div className="text-[11.5px] tabular-nums text-slate-600">
                  <p>{formatDate(row.startDate)}</p>
                  <p className="text-slate-500">to {formatDate(row.endDate)}</p>
                </div>
              ),
            },
            {
              key: 'applies',
              header: 'Applies to',
              render: (row) => {
                if (row.applicability === 'Whole subscription') {
                  return <span className="text-[11.5px] text-slate-600">Whole subscription</span>
                }
                const names = row.productIds
                  .map((id) => productMap.get(id)?.name)
                  .filter(Boolean)
                return (
                  <div className="max-w-[180px] text-[11.5px] text-slate-600">
                    {names.length === 0 ? (
                      <span className="text-rose-600">No products selected</span>
                    ) : (
                      <>
                        <p className="line-clamp-1">{names[0]}</p>
                        {names.length > 1 && (
                          <p className="text-slate-500">+{names.length - 1} more</p>
                        )}
                      </>
                    )}
                  </div>
                )
              },
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <StatusToggle
                  status={row.status}
                  label={row.code}
                  onToggle={() => handleToggle(row)}
                />
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              align: 'right',
              render: (row) => (
                <AdminButton size="sm" icon={Pencil} onClick={() => openEdit(row)}>
                  Edit
                </AdminButton>
              ),
            },
          ]}
        />
      </Panel>

      <SampleDataNotice>
        Discount rules are demo data. The eligibility summary is descriptive only; expiry, usage
        limits, product eligibility and invoice application must be enforced server-side.
      </SampleDataNotice>

      <AdminModal
        open={modalMode !== null}
        onClose={closeModal}
        size="xl"
        title={modalMode === 'edit' ? 'Edit discount' : 'Add discount'}
        description="Define the offer, its minimum eligibility and when it can be used."
        footer={
          <>
            <AdminButton onClick={closeModal}>Cancel</AdminButton>
            <AdminButton variant="primary" type="submit" form="discount-form">
              {modalMode === 'edit' ? 'Save changes' : 'Add discount'}
            </AdminButton>
          </>
        }
      >
        <form id="discount-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              id="discount-code"
              name="code"
              label="Name / code"
              required
              value={form.code}
              onChange={handleChange}
              error={errors.code}
              placeholder="e.g. WELCOME15"
              hint="Shown to admins and used as the demo identifier."
            />
            <AdminSelect
              id="discount-type"
              name="type"
              label="Discount type"
              required
              value={form.type}
              onChange={handleChange}
              error={errors.type}
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AdminSelect>
            <AdminInput
              id="discount-value"
              name="value"
              type="number"
              min="0"
              max={form.type === 'Percentage' ? '100' : undefined}
              step="0.01"
              inputMode="decimal"
              label={form.type === 'Percentage' ? 'Percentage (%)' : 'Fixed amount (USD)'}
              required
              value={form.value}
              onChange={handleChange}
              error={errors.value}
              placeholder="0.00"
            />
            <AdminSelect
              id="discount-minimum-type"
              name="minimumType"
              label="Minimum requirement"
              required
              value={form.minimumType}
              onChange={handleChange}
            >
              <option value="purchase">Minimum purchase amount</option>
              <option value="quantity">Minimum quantity</option>
            </AdminSelect>
            <AdminInput
              id="discount-minimum-value"
              name="minimumValue"
              type="number"
              min={form.minimumType === 'quantity' ? '1' : '0'}
              step={form.minimumType === 'quantity' ? '1' : '0.01'}
              inputMode="decimal"
              label={
                form.minimumType === 'quantity' ? 'Minimum quantity' : 'Minimum purchase (USD)'
              }
              required
              value={form.minimumValue}
              onChange={handleChange}
              error={errors.minimumValue}
              placeholder={form.minimumType === 'quantity' ? '1' : '0.00'}
            />
            <AdminInput
              id="discount-usage-limit"
              name="usageLimit"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              label="Usage limit"
              value={form.usageLimit}
              onChange={handleChange}
              error={errors.usageLimit}
              placeholder="Leave blank for unlimited"
              hint="Optional. Must be a whole number of at least 1 when set."
            />
            <AdminInput
              id="discount-start-date"
              name="startDate"
              type="date"
              label="Valid from"
              required
              value={form.startDate}
              onChange={handleChange}
              error={errors.startDate}
            />
            <AdminInput
              id="discount-end-date"
              name="endDate"
              type="date"
              label="Valid until"
              required
              value={form.endDate}
              onChange={handleChange}
              error={errors.endDate}
            />
            <AdminSelect
              id="discount-applicability"
              name="applicability"
              label="Applicability"
              required
              value={form.applicability}
              onChange={handleChange}
            >
              <option value="Whole subscription">Whole subscription</option>
              <option value="Selected products">Selected products</option>
            </AdminSelect>
            <AdminSelect
              id="discount-status"
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
          </div>

          {form.applicability === 'Selected products' && (
            <fieldset className="space-y-2 rounded-lg border border-slate-200 bg-[#f8fafc] p-3">
              <legend className="px-1 text-[12.5px] font-semibold text-slate-900">
                Selected products
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {products.map((product) => (
                  <AdminCheckbox
                    key={product.id}
                    id={`discount-product-${product.id}`}
                    label={product.name}
                    description={`${product.type} · ${formatCurrency(product.salesPrice)}`}
                    checked={form.productIds.includes(product.id)}
                    onChange={() => handleProductToggle(product.id)}
                  />
                ))}
              </div>
              {errors.productIds && (
                <p role="alert" className="text-[11.5px] font-medium text-rose-700">
                  {errors.productIds}
                </p>
              )}
            </fieldset>
          )}

          <div className="rounded-lg border border-[#bae6fd] bg-[#f0f9ff] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#005374]">
              Eligibility summary
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-700">
              {form.type === 'Percentage'
                ? `${form.value || '0'}% off`
                : `${form.value ? formatCurrency(Number(form.value)) : '—'} off`}{' '}
              with a {formEligibility}. Valid {form.startDate ? formatDate(form.startDate) : '—'} to{' '}
              {form.endDate ? formatDate(form.endDate) : '—'}.{' '}
              {form.usageLimit ? `Limited to ${form.usageLimit} uses.` : 'Unlimited uses.'}{' '}
              {form.applicability === 'Selected products'
                ? selectedProductNames.length > 0
                  ? `Applies to ${selectedProductNames.join(', ')}.`
                  : 'Select at least one product.'
                : 'Applies to the whole subscription.'}
            </p>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}
