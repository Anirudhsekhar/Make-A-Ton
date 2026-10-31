import { useMemo, useState } from 'react'
import { FileText, Plus, Search } from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
import AdminDataTable from '../../components/admin/AdminDataTable'
import { AdminInput, AdminSelect } from '../../components/admin/AdminField'
import AdminFlashMessage from '../../components/admin/AdminFlashMessage'
import AdminModal from '../../components/admin/AdminModal'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminSummaryCards from '../../components/admin/AdminSummaryCards'
import Panel from '../../components/admin/Panel'
import SampleDataBadge from '../../components/admin/SampleDataBadge'
import StatusBadge from '../../components/admin/StatusBadge'
import StaffDemoNotice from '../../components/staff/StaffDemoNotice'
import { useStaffDemoData } from '../../context/StaffDemoDataContext'
import { formatDate, formatMoney } from '../../lib/adminFormat'

const PLAN_OPTIONS = [
  'Starter - Monthly',
  'Growth - Monthly',
  'Scale - Monthly',
  'Scale - Yearly',
]

const EMPTY_FORM = {
  name: '',
  planName: PLAN_OPTIONS[1],
  validityDays: '30',
  productName: '',
  quantity: '1',
  unitPrice: '',
  taxRate: '20',
}

const viewButtonClass =
  'inline-flex h-8 items-center justify-center rounded border border-slate-200 bg-white px-2.5 text-[11.5px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-[#f8fafc]'

function templateTotal(template) {
  return template.productLines.reduce((total, line) => total + line.amount, 0)
}

export default function SalesQuotations() {
  const { quotationTemplates, createQuotationTemplate } = useStaffDemoData()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return quotationTemplates.filter(
      (template) =>
        !query ||
        template.name.toLowerCase().includes(query) ||
        template.planName.toLowerCase().includes(query),
    )
  }, [quotationTemplates, search])

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

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const closeCreate = () => {
    setModalOpen(false)
    setForm(EMPTY_FORM)
    setErrors({})
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Template name is required.'
    if (!form.productName.trim()) nextErrors.productName = 'Product line name is required.'
    if (!form.unitPrice || Number(form.unitPrice) < 0) {
      nextErrors.unitPrice = 'Unit price must be zero or greater.'
    }
    if (!form.validityDays || Number(form.validityDays) < 1) {
      nextErrors.validityDays = 'Validity must be at least one day.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const created = createQuotationTemplate({
      name: form.name,
      planName: form.planName,
      validityDays: form.validityDays,
      productLines: [
        {
          productName: form.productName,
          quantity: form.quantity,
          unitPrice: form.unitPrice,
          taxRate: form.taxRate,
        },
      ],
    })

    closeCreate()
    setNotice(`${created.name} was added to the demo quotation templates.`)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Sales Rep portal"
        title="Quotation Templates"
        description="Reusable quotation baselines for existing plans and product lines."
        actions={
          <>
            <SampleDataBadge className="hidden sm:inline-flex" />
            <AdminButton variant="primary" icon={Plus} onClick={openCreate}>
              New template
            </AdminButton>
          </>
        }
      />

      {notice && <AdminFlashMessage onDismiss={() => setNotice('')}>{notice}</AdminFlashMessage>}

      <AdminSummaryCards
        items={[
          {
            label: 'Templates',
            value: quotationTemplates.length,
            hint: 'Available to sales reps',
            icon: FileText,
            tone: 'sky',
          },
          {
            label: 'Active',
            value: quotationTemplates.filter((template) => template.status === 'Active').length,
            hint: 'Ready to use',
            icon: FileText,
            tone: 'teal',
          },
          {
            label: 'Drafts',
            value: quotationTemplates.filter((template) => template.status === 'Draft').length,
            hint: 'Not yet published',
            icon: FileText,
            tone: 'amber',
          },
          {
            label: 'Plans covered',
            value: new Set(quotationTemplates.map((template) => template.planName)).size,
            hint: 'Distinct plan names',
            icon: FileText,
            tone: 'slate',
          },
        ]}
      />

      <Panel
        title="Template library"
        description="Templates reference existing plans and product lines only. Pricing rules remain server-owned."
        bodyClassName="p-0"
        actions={<span className="text-[11px] text-slate-500">{filtered.length} shown</span>}
      >
        <div className="border-b border-[#f1f5f9] px-4 py-3">
          <div className="relative max-w-md">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search template or plan"
              aria-label="Search quotation templates"
              className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-[12.5px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#146c94] focus:ring-1 focus:ring-[#146c94]"
            />
          </div>
        </div>

        <AdminDataTable
          rows={filtered}
          getRowId={(row) => row.id}
          emptyTitle="No templates match your search"
          emptyDescription="Try another search or create a new quotation template."
          columns={[
            {
              key: 'name',
              header: 'Template',
              render: (row) => (
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold text-slate-900">{row.name}</p>
                  <p className="mt-0.5 text-[11.5px] text-slate-500">
                    Updated {formatDate(row.updatedAt)}
                  </p>
                </div>
              ),
            },
            { key: 'plan', header: 'Plan', render: (row) => row.planName },
            {
              key: 'lines',
              header: 'Product lines',
              render: (row) => (
                <span className="text-[12px] tabular-nums text-slate-600">
                  {row.productLines.length}
                </span>
              ),
            },
            {
              key: 'validity',
              header: 'Validity',
              render: (row) => `${row.validityDays} days`,
            },
            {
              key: 'total',
              header: 'Base value',
              align: 'right',
              render: (row) => (
                <span className="font-semibold tabular-nums text-slate-900">
                  {formatMoney(templateTotal(row))}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <StatusBadge tone={row.status === 'Active' ? 'success' : 'neutral'}>
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
        Quotation templates can be created and reviewed here. Creating a subscription from a
        template is simulated locally and does not change any live plan or customer record.
      </StaffDemoNotice>

      <AdminModal
        open={modalOpen}
        onClose={closeCreate}
        title="New quotation template"
        description="Select an existing plan and add a product line. Nothing is saved outside the demo session."
        footer={
          <>
            <AdminButton onClick={closeCreate}>Cancel</AdminButton>
            <AdminButton variant="primary" onClick={handleSubmit}>
              Create template
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AdminInput
            id="quotation-name"
            label="Template name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Growth rollout - standard"
            required
          />
          <AdminSelect
            id="quotation-plan"
            label="Existing plan"
            name="planName"
            value={form.planName}
            onChange={handleChange}
            required
          >
            {PLAN_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </AdminSelect>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              id="quotation-product"
              label="Product line"
              name="productName"
              value={form.productName}
              onChange={handleChange}
              error={errors.productName}
              placeholder="Brightloop Core"
              required
            />
            <AdminInput
              id="quotation-validity"
              label="Validity (days)"
              name="validityDays"
              type="number"
              min="1"
              value={form.validityDays}
              onChange={handleChange}
              error={errors.validityDays}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminInput
              id="quotation-quantity"
              label="Quantity"
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
            />
            <AdminInput
              id="quotation-unit-price"
              label="Unit price"
              name="unitPrice"
              type="number"
              min="0"
              value={form.unitPrice}
              onChange={handleChange}
              error={errors.unitPrice}
              placeholder="249"
              required
            />
            <AdminInput
              id="quotation-tax"
              label="Tax rate (%)"
              name="taxRate"
              type="number"
              min="0"
              max="100"
              value={form.taxRate}
              onChange={handleChange}
            />
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? 'Quotation template'}
        description={selected?.planName}
        footer={<AdminButton onClick={() => setSelected(null)}>Close</AdminButton>}
      >
        {selected && (
          <div className="space-y-4">
            <dl className="grid gap-3 text-[12.5px] sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">Validity</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{selected.validityDays} days</dd>
              </div>
              <div>
                <dt className="text-slate-500">Updated</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {formatDate(selected.updatedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="mt-1">
                  <StatusBadge tone={selected.status === 'Active' ? 'success' : 'neutral'}>
                    {selected.status}
                  </StatusBadge>
                </dd>
              </div>
            </dl>

            <div className="overflow-x-auto rounded border border-slate-200">
              <table className="w-full min-w-[520px] text-left text-[12px]">
                <thead>
                  <tr className="border-b border-[#f1f5f9] bg-[#f8fafc] text-[10.5px] uppercase tracking-[0.07em] text-slate-500">
                    <th className="px-3 py-2 font-semibold">Product</th>
                    <th className="px-3 py-2 text-right font-semibold">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold">Unit price</th>
                    <th className="px-3 py-2 text-right font-semibold">Tax</th>
                    <th className="px-3 py-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.productLines.map((line) => (
                    <tr key={line.id} className="border-b border-[#f1f5f9] last:border-0">
                      <td className="px-3 py-2 font-medium text-slate-900">{line.productName}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{line.quantity}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatMoney(line.unitPrice)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{line.taxRate}%</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-900">
                        {formatMoney(line.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  )
}
