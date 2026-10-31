import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Boxes,
  CircleDollarSign,
  Layers,
  Pencil,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
import AdminDataTable from '../../components/admin/AdminDataTable'
import { AdminInput, AdminSelect, AdminTextarea } from '../../components/admin/AdminField'
import AdminFlashMessage from '../../components/admin/AdminFlashMessage'
import AdminModal from '../../components/admin/AdminModal'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminSummaryCards from '../../components/admin/AdminSummaryCards'
import Panel from '../../components/admin/Panel'
import SampleDataBadge from '../../components/admin/SampleDataBadge'
import SampleDataNotice from '../../components/admin/SampleDataNotice'
import StatusBadge from '../../components/admin/StatusBadge'
import StatusToggle from '../../components/admin/StatusToggle'
import { createDemoId, useAdminDemoData } from '../../context/AdminDemoDataContext'
import { formatCurrency } from '../../lib/adminFormat'
import { useAdminBasePath } from '../../hooks/useAdminBasePath'
import {
  PRODUCT_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from '../../data/admin/adminDemoData'

const EMPTY_PRODUCT = {
  name: '',
  type: '',
  salesPrice: '',
  costPrice: '',
  notes: '',
  status: 'Active',
  variants: [],
}

function newVariant() {
  return {
    id: createDemoId('var'),
    label: '',
    value: '',
    adjustment: '',
  }
}

function computedPrice(salesPrice, adjustment) {
  if (salesPrice === '' || salesPrice === null || salesPrice === undefined) return null
  if (adjustment === '' || adjustment === null || adjustment === undefined) return null
  const base = Number(salesPrice)
  const delta = Number(adjustment)
  if (Number.isNaN(base) || Number.isNaN(delta)) return null
  return base + delta
}

function validateProduct(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Product name is required.'
  if (!form.type) errors.type = 'Select a product type.'

  const salesPrice = Number(form.salesPrice)
  if (form.salesPrice === '' || Number.isNaN(salesPrice) || salesPrice < 0) {
    errors.salesPrice = 'Sales price must be zero or greater.'
  }

  const costPrice = Number(form.costPrice)
  if (form.costPrice === '' || Number.isNaN(costPrice) || costPrice < 0) {
    errors.costPrice = 'Cost price must be zero or greater.'
  }

  form.variants.forEach((variant, index) => {
    if (!variant.label.trim()) errors[`variants.${index}.label`] = 'Label is required.'
    if (!variant.value.trim()) errors[`variants.${index}.value`] = 'Value is required.'
    if (variant.adjustment === '' || Number.isNaN(Number(variant.adjustment))) {
      errors[`variants.${index}.adjustment`] = 'Enter a number.'
    } else if (computedPrice(form.salesPrice, variant.adjustment) < 0) {
      errors[`variants.${index}.adjustment`] = 'Adjusted price cannot be negative.'
    }
  })

  return errors
}

export default function AdminProducts() {
  const basePath = useAdminBasePath()
  const { products, plans, createProduct, updateProduct, toggleProductStatus } =
    useAdminDemoData()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalMode, setModalMode] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')

  const planCountByProduct = useMemo(() => {
    const counts = new Map()
    plans.forEach((plan) => {
      counts.set(plan.productId, (counts.get(plan.productId) ?? 0) + 1)
    })
    return counts
  }, [plans])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.notes.toLowerCase().includes(query)
      const matchesType = typeFilter === 'all' || product.type === typeFilter
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter
      return matchesQuery && matchesType && matchesStatus
    })
  }, [products, search, typeFilter, statusFilter])

  const activeCount = products.filter((product) => product.status === 'Active').length
  const variantCount = products.reduce((total, product) => total + product.variants.length, 0)
  const needsPlanCount = products.filter((product) => !planCountByProduct.get(product.id)).length

  const openAdd = () => {
    setEditingId(null)
    setForm({ ...EMPTY_PRODUCT, variants: [newVariant()] })
    setErrors({})
    setModalMode('add')
  }

  const openEdit = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      type: product.type,
      salesPrice: String(product.salesPrice),
      costPrice: String(product.costPrice),
      notes: product.notes,
      status: product.status,
      variants: product.variants.map((variant) => ({
        ...variant,
        adjustment: String(variant.adjustment),
      })),
    })
    setErrors({})
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingId(null)
    setForm(EMPTY_PRODUCT)
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

  const handleVariantChange = (index, field, value) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant,
      ),
    }))
    const errorKey = `variants.${index}.${field}`
    setErrors((current) => {
      if (!current[errorKey]) return current
      const next = { ...current }
      delete next[errorKey]
      return next
    })
  }

  const addVariant = () => {
    setForm((current) => ({ ...current, variants: [...current.variants, newVariant()] }))
  }

  const removeVariant = (index) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.filter((_, variantIndex) => variantIndex !== index),
    }))
    setErrors((current) => {
      const next = {}
      Object.entries(current).forEach(([key, value]) => {
        if (!key.startsWith('variants.')) {
          next[key] = value
        }
      })
      return next
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateProduct(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const payload = {
      name: form.name.trim(),
      type: form.type,
      salesPrice: Number(form.salesPrice),
      costPrice: Number(form.costPrice),
      notes: form.notes.trim(),
      status: form.status,
      variants: form.variants.map((variant) => ({
        id: variant.id,
        label: variant.label.trim(),
        value: variant.value.trim(),
        adjustment: Number(variant.adjustment),
      })),
    }

    if (editingId) {
      updateProduct(editingId, payload)
      setNotice(`${payload.name} was updated in the demo product catalog.`)
    } else {
      createProduct(payload)
      setNotice(`${payload.name} was added to the demo product catalog.`)
    }

    closeModal()
  }

  const handleToggle = (product) => {
    toggleProductStatus(product.id)
    setNotice(
      `${product.name} is now ${product.status === 'Active' ? 'inactive' : 'active'} in the demo catalog.`,
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products & variants"
        description="Define services, software and add-ons, then attach pricing variants and ensure every product has a subscription plan."
        actions={
          <>
            <SampleDataBadge className="hidden sm:inline-flex" />
            <AdminButton variant="primary" icon={Plus} onClick={openAdd}>
              Add product
            </AdminButton>
          </>
        }
      />

      {notice && <AdminFlashMessage onDismiss={() => setNotice('')}>{notice}</AdminFlashMessage>}

      <AdminSummaryCards
        items={[
          { label: 'Products', value: products.length, hint: 'Across all catalog types', icon: Boxes, tone: 'sky' },
          { label: 'Active', value: activeCount, hint: 'Available for new plans', icon: CircleDollarSign, tone: 'teal' },
          { label: 'Variants', value: variantCount, hint: 'Pricing options configured', icon: Layers, tone: 'slate' },
          { label: 'Needs a plan', value: needsPlanCount, hint: 'Create a linked plan', icon: TriangleAlert, tone: 'amber' },
        ]}
      />

      <Panel
        title="Product catalog"
        description="Products without a linked plan are flagged so billing can stay consistent."
        bodyClassName="p-0"
        actions={<span className="text-[11px] text-slate-500">{filteredProducts.length} shown</span>}
      >
        <div className="grid gap-3 border-b border-[#f1f5f9] px-4 py-3 sm:grid-cols-[minmax(0,1fr)_170px_170px]">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products or notes"
              aria-label="Search products"
              className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-[12.5px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#146c94] focus:ring-1 focus:ring-[#146c94]"
            />
          </div>
          <AdminSelect
            id="product-type-filter"
            label="Type filter"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="all">All types</option>
            {PRODUCT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect
            id="product-status-filter"
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
          rows={filteredProducts}
          getRowId={(row) => row.id}
          emptyTitle="No products match your filters"
          emptyDescription="Adjust the search or filters, or add a new product to the catalog."
          emptyAction={
            <AdminButton className="mt-2" icon={Plus} onClick={openAdd}>
              Add product
            </AdminButton>
          }
          columns={[
            {
              key: 'product',
              header: 'Product',
              render: (row) => (
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-slate-900">{row.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-[11.5px] text-slate-500">{row.notes}</p>
                </div>
              ),
            },
            {
              key: 'type',
              header: 'Type',
              render: (row) => <StatusBadge tone="neutral">{row.type}</StatusBadge>,
            },
            {
              key: 'pricing',
              header: 'Pricing',
              render: (row) => (
                <div className="tabular-nums">
                  <p className="text-[12.5px] font-semibold text-slate-900">
                    {formatCurrency(row.salesPrice)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Cost {formatCurrency(row.costPrice)}
                  </p>
                </div>
              ),
            },
            {
              key: 'variants',
              header: 'Variants',
              render: (row) => (
                <div>
                  <p className="text-[12.5px] font-medium text-slate-700">
                    {row.variants.length} {row.variants.length === 1 ? 'variant' : 'variants'}
                  </p>
                  {row.variants[0] && (
                    <p className="text-[11px] text-slate-500">
                      {row.variants[0].value} ·{' '}
                      {formatCurrency(
                        computedPrice(row.salesPrice, row.variants[0].adjustment) ??
                          row.salesPrice,
                      )}
                    </p>
                  )}
                </div>
              ),
            },
            {
              key: 'plans',
              header: 'Plans',
              render: (row) => {
                const count = planCountByProduct.get(row.id) ?? 0
                return count > 0 ? (
                  <Link
                    to={`${basePath}/plans?filter=${row.id}`}
                    className="text-[12px] font-semibold text-[#0284c7] underline-offset-2 hover:underline"
                  >
                    {count} {count === 1 ? 'plan' : 'plans'}
                  </Link>
                ) : (
                  <Link
                    to={`${basePath}/plans?product=${row.id}`}
                    className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.03em] text-amber-800 hover:border-amber-300"
                  >
                    Needs plan
                  </Link>
                )
              },
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
                <AdminButton size="sm" icon={Pencil} onClick={() => openEdit(row)}>
                  Edit
                </AdminButton>
              ),
            },
          ]}
        />
      </Panel>

      <SampleDataNotice>
        Product and variant records are demo data. Plan links navigate to the demo plans module, where
        the selected product is pre-filled. Referential integrity and publishing rules must be
        enforced by the backend before real use.
      </SampleDataNotice>

      <AdminModal
        open={modalMode !== null}
        onClose={closeModal}
        size="xl"
        title={modalMode === 'edit' ? 'Edit product' : 'Add product'}
        description="Base prices and variant adjustments are shown in the catalog currency (USD)."
        footer={
          <>
            <AdminButton onClick={closeModal}>Cancel</AdminButton>
            <AdminButton variant="primary" type="submit" form="product-form">
              {modalMode === 'edit' ? 'Save changes' : 'Add product'}
            </AdminButton>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              id="product-name"
              name="name"
              label="Product name"
              required
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g. Brightloop Core"
            />
            <AdminSelect
              id="product-type"
              name="type"
              label="Product type"
              required
              value={form.type}
              onChange={handleChange}
              error={errors.type}
            >
              <option value="" disabled>
                Select a type
              </option>
              {PRODUCT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AdminSelect>
            <AdminInput
              id="product-sales-price"
              name="salesPrice"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              label="Sales price (USD)"
              required
              value={form.salesPrice}
              onChange={handleChange}
              error={errors.salesPrice}
              placeholder="0.00"
            />
            <AdminInput
              id="product-cost-price"
              name="costPrice"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              label="Cost price (USD)"
              required
              value={form.costPrice}
              onChange={handleChange}
              error={errors.costPrice}
              placeholder="0.00"
            />
          </div>

          <AdminTextarea
            id="product-notes"
            name="notes"
            label="Notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Describe what this product includes and who it is for."
          />

          <AdminSelect
            id="product-status"
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

          <div className="rounded-lg border border-slate-200 bg-[#f8fafc] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[12.5px] font-semibold text-slate-900">Pricing variants</p>
                <p className="text-[11.5px] text-slate-500">
                  Add brand, tier or cadence adjustments. Computed price = base sales price +
                  adjustment.
                </p>
              </div>
              <AdminButton size="sm" icon={Plus} onClick={addVariant}>
                Add variant
              </AdminButton>
            </div>

            {form.variants.length === 0 ? (
              <p className="mt-3 rounded border border-dashed border-slate-300 bg-white px-3 py-4 text-center text-[12px] text-slate-500">
                No variants yet. This product can be sold at its base sales price.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {form.variants.map((variant, index) => (
                  <li
                    key={variant.id}
                    className="rounded border border-slate-200 bg-white p-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_130px_130px_auto] xl:items-end">
                      <AdminInput
                        id={`variant-label-${variant.id}`}
                        label="Label"
                        value={variant.label}
                        onChange={(event) =>
                          handleVariantChange(index, 'label', event.target.value)
                        }
                        error={errors[`variants.${index}.label`]}
                        placeholder="Brand"
                      />
                      <AdminInput
                        id={`variant-value-${variant.id}`}
                        label="Value"
                        value={variant.value}
                        onChange={(event) =>
                          handleVariantChange(index, 'value', event.target.value)
                        }
                        error={errors[`variants.${index}.value`]}
                        placeholder="Odoo"
                      />
                      <AdminInput
                        id={`variant-adjustment-${variant.id}`}
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        label="Adjustment"
                        value={variant.adjustment}
                        onChange={(event) =>
                          handleVariantChange(index, 'adjustment', event.target.value)
                        }
                        error={errors[`variants.${index}.adjustment`]}
                        placeholder="0.00"
                      />
                      <div className="space-y-1.5">
                        <p className="text-[12.5px] font-semibold text-slate-900">Selling price</p>
                        <div className="flex h-9 items-center rounded border border-slate-200 bg-[#f8fafc] px-3 text-[12.5px] font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(computedPrice(form.salesPrice, variant.adjustment))}
                        </div>
                      </div>
                      <AdminButton
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => removeVariant(index)}
                        aria-label={`Remove variant ${index + 1}`}
                        className="self-end"
                      >
                        Remove
                      </AdminButton>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-[11px] text-slate-500">
            Catalog changes are kept in local demo state for this browser session.
          </p>
        </form>
      </AdminModal>
    </div>
  )
}
