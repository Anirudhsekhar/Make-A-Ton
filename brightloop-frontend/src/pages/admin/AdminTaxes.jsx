import { useMemo, useState } from 'react'
import { Calculator, Percent, Pencil, Plus, Search } from 'lucide-react'
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
import StatusToggle from '../../components/admin/StatusToggle'
import { useAdminDemoData } from '../../context/AdminDemoDataContext'
import { formatCurrency, formatDate } from '../../lib/adminFormat'
import { STATUS_OPTIONS } from '../../data/admin/adminDemoData'

const EMPTY_TAX = {
  name: '',
  rate: '',
  description: '',
  status: 'Active',
}

const PREVIEW_SUBTOTAL = 1000

function validateTax(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Tax name is required.'

  const rate = Number(form.rate)
  if (form.rate === '' || Number.isNaN(rate)) {
    errors.rate = 'Enter a numeric tax rate.'
  } else if (rate < 0 || rate > 100) {
    errors.rate = 'Tax rate must be between 0 and 100.'
  }

  if (!form.status) errors.status = 'Status is required.'
  return errors
}

export default function AdminTaxes() {
  const { taxes, createTax, updateTax, toggleTaxStatus } = useAdminDemoData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalMode, setModalMode] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_TAX)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')

  const filteredTaxes = useMemo(() => {
    const query = search.trim().toLowerCase()
    return taxes.filter((tax) => {
      const matchesQuery =
        !query ||
        tax.name.toLowerCase().includes(query) ||
        tax.description.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || tax.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [taxes, search, statusFilter])

  const activeCount = taxes.filter((tax) => tax.status === 'Active').length
  const averageRate =
    taxes.length === 0 ? 0 : taxes.reduce((total, tax) => total + tax.rate, 0) / taxes.length
  const highestRate = taxes.length === 0 ? 0 : Math.max(...taxes.map((tax) => tax.rate))
  const previewRate = Number(form.rate)
  const previewTax = Number.isNaN(previewRate) ? 0 : (PREVIEW_SUBTOTAL * previewRate) / 100

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_TAX)
    setErrors({})
    setModalMode('add')
  }

  const openEdit = (tax) => {
    setEditingId(tax.id)
    setForm({
      name: tax.name,
      rate: String(tax.rate),
      description: tax.description,
      status: tax.status,
    })
    setErrors({})
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingId(null)
    setForm(EMPTY_TAX)
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
    const nextErrors = validateTax(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const payload = {
      name: form.name.trim(),
      rate: Number(form.rate),
      description: form.description.trim(),
      status: form.status,
    }

    if (editingId) {
      updateTax(editingId, payload)
      setNotice(`${payload.name} was updated in the demo tax list.`)
    } else {
      createTax(payload)
      setNotice(`${payload.name} was added to the demo tax list.`)
    }

    closeModal()
  }

  const handleToggle = (tax) => {
    toggleTaxStatus(tax.id)
    setNotice(
      `${tax.name} is now ${tax.status === 'Active' ? 'inactive' : 'active'} in the demo list.`,
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Billing"
        title="Taxes"
        description="Maintain tax rules and preview how a rate affects a sample subtotal. Invoice calculations remain a backend responsibility."
        actions={
          <>
            <SampleDataBadge className="hidden sm:inline-flex" />
            <AdminButton variant="primary" icon={Plus} onClick={openAdd}>
              Add tax rule
            </AdminButton>
          </>
        }
      />

      {notice && <AdminFlashMessage onDismiss={() => setNotice('')}>{notice}</AdminFlashMessage>}

      <AdminSummaryCards
        items={[
          { label: 'Tax rules', value: taxes.length, hint: 'Configured rates', icon: Percent, tone: 'sky' },
          { label: 'Active', value: activeCount, hint: 'Available for invoicing', icon: Calculator, tone: 'teal' },
          { label: 'Average rate', value: `${averageRate.toFixed(2)}%`, hint: 'Across all rules', icon: Percent, tone: 'slate' },
          { label: 'Highest rate', value: `${highestRate.toFixed(2)}%`, hint: 'Current maximum', icon: Percent, tone: 'amber' },
        ]}
      />

      <Panel
        title="Tax rules"
        description="Search, edit or toggle a tax rate. The preview uses a $1,000 subtotal for illustration only."
        bodyClassName="p-0"
        actions={<span className="text-[11px] text-slate-500">{filteredTaxes.length} shown</span>}
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
              placeholder="Search tax names or descriptions"
              aria-label="Search tax rules"
              className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-[12.5px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#146c94] focus:ring-1 focus:ring-[#146c94]"
            />
          </div>
          <AdminSelect
            id="tax-status-filter"
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
          rows={filteredTaxes}
          getRowId={(row) => row.id}
          emptyTitle="No tax rules match your filters"
          emptyDescription="Try a different search or status, or add a new tax rule."
          emptyAction={
            <AdminButton className="mt-2" icon={Plus} onClick={openAdd}>
              Add tax rule
            </AdminButton>
          }
          columns={[
            {
              key: 'name',
              header: 'Tax rule',
              render: (row) => (
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-slate-900">{row.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-[11.5px] text-slate-500">
                    {row.description}
                  </p>
                </div>
              ),
            },
            {
              key: 'rate',
              header: 'Rate',
              render: (row) => (
                <span className="tabular-nums text-[13px] font-semibold text-slate-900">
                  {row.rate.toFixed(2)}%
                </span>
              ),
            },
            {
              key: 'preview',
              header: `Preview on ${formatCurrency(PREVIEW_SUBTOTAL)}`,
              render: (row) => {
                const taxAmount = (PREVIEW_SUBTOTAL * row.rate) / 100
                return (
                  <div className="tabular-nums text-[11.5px]">
                    <p className="font-medium text-slate-700">{formatCurrency(taxAmount)} tax</p>
                    <p className="text-slate-500">
                      Total {formatCurrency(PREVIEW_SUBTOTAL + taxAmount)}
                    </p>
                  </div>
                )
              },
            },
            {
              key: 'updated',
              header: 'Updated',
              render: (row) => (
                <span className="tabular-nums text-[11.5px] text-slate-500">
                  {formatDate(row.updatedAt)}
                </span>
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
                <AdminButton size="sm" icon={Pencil} onClick={() => openEdit(row)}>
                  Edit
                </AdminButton>
              ),
            },
          ]}
        />
      </Panel>

      <SampleDataNotice>
        Tax rules are demo data. The calculation preview is a frontend illustration only; real
        invoice tax calculation, rounding and jurisdictional rules must live in the backend.
      </SampleDataNotice>

      <AdminModal
        open={modalMode !== null}
        onClose={closeModal}
        title={modalMode === 'edit' ? 'Edit tax rule' : 'Add tax rule'}
        description="Set a percentage rate between 0 and 100. Inactive rules remain visible but should not be applied to invoices."
        footer={
          <>
            <AdminButton onClick={closeModal}>Cancel</AdminButton>
            <AdminButton variant="primary" type="submit" form="tax-form">
              {modalMode === 'edit' ? 'Save changes' : 'Add tax rule'}
            </AdminButton>
          </>
        }
      >
        <form id="tax-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              id="tax-name"
              name="name"
              label="Tax name"
              required
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g. Standard VAT"
            />
            <AdminInput
              id="tax-rate"
              name="rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              inputMode="decimal"
              label="Rate (%)"
              required
              value={form.rate}
              onChange={handleChange}
              error={errors.rate}
              placeholder="0.00"
            />
          </div>
          <AdminTextarea
            id="tax-description"
            name="description"
            label="Description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe where this tax applies."
          />
          <AdminSelect
            id="tax-status"
            name="status"
            label="Status"
            required
            value={form.status}
            onChange={handleChange}
            error={errors.status}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AdminSelect>

          <div className="rounded-lg border border-[#bae6fd] bg-[#f0f9ff] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#005374]">
              Calculation preview
            </p>
            <div className="mt-2 grid gap-2 text-[12px] tabular-nums text-slate-700 sm:grid-cols-3">
              <div>
                <p className="text-[11px] text-slate-500">Sample subtotal</p>
                <p className="font-semibold">{formatCurrency(PREVIEW_SUBTOTAL)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Tax at {form.rate || 0}%</p>
                <p className="font-semibold">{formatCurrency(previewTax)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Total</p>
                <p className="font-semibold">{formatCurrency(PREVIEW_SUBTOTAL + previewTax)}</p>
              </div>
            </div>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}
