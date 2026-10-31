import { useMemo, useState } from 'react'
import { Pencil, Search, UserCheck, UserPlus, UserX, Users } from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
import AdminDataTable from '../../components/admin/AdminDataTable'
import { AdminInput, AdminSelect } from '../../components/admin/AdminField'
import AdminFlashMessage from '../../components/admin/AdminFlashMessage'
import AdminModal from '../../components/admin/AdminModal'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminSummaryCards from '../../components/admin/AdminSummaryCards'
import Panel from '../../components/admin/Panel'
import SampleDataBadge from '../../components/admin/SampleDataBadge'
import SampleDataNotice from '../../components/admin/SampleDataNotice'
import StatusBadge from '../../components/admin/StatusBadge'
import StatusToggle from '../../components/admin/StatusToggle'
import PasswordChecklist from '../../components/auth/PasswordChecklist'
import { useAdminDemoData } from '../../context/AdminDemoDataContext'
import { formatDate, getInitials } from '../../lib/adminFormat'
import { isStrongPassword, isValidEmail } from '../../lib/validation'
import { STATUS_OPTIONS } from '../../data/admin/adminDemoData'

const EMPTY_FORM = {
  fullName: '',
  email: '',
  password: '',
  status: 'Active',
}

function validateStaff(form, staff, editingId) {
  const errors = {}
  if (!form.fullName.trim()) errors.fullName = 'Full name is required.'

  if (!form.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Enter a valid email address.'
  } else {
    const duplicate = staff.some(
      (member) =>
        member.id !== editingId &&
        member.email.toLowerCase() === form.email.trim().toLowerCase(),
    )
    if (duplicate) errors.email = 'A staff member with this email already exists.'
  }

  if (!editingId) {
    if (!form.password) {
      errors.password = 'An initial password is required when adding staff.'
    } else if (!isStrongPassword(form.password)) {
      errors.password = 'Password does not meet all requirements yet.'
    }
  }

  if (!form.status) errors.status = 'Status is required.'
  return errors
}

export default function AdminStaff() {
  const { staff, createStaff, updateStaff, toggleStaffStatus } = useAdminDemoData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalMode, setModalMode] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase()
    return staff.filter((member) => {
      const matchesQuery =
        !query ||
        member.fullName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [staff, search, statusFilter])

  const activeCount = staff.filter((member) => member.status === 'Active').length
  const inactiveCount = staff.length - activeCount
  const recentCount = staff.filter((member) => member.createdAt >= '2026-07-01').length

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalMode('add')
  }

  const openEdit = (member) => {
    setEditingId(member.id)
    setForm({
      fullName: member.fullName,
      email: member.email,
      password: '',
      status: member.status,
    })
    setErrors({})
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingId(null)
    setForm(EMPTY_FORM)
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
    const nextErrors = validateStaff(form, staff, editingId)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      status: form.status,
    }

    if (editingId) {
      updateStaff(editingId, payload)
      setNotice(`${payload.fullName} was updated in the demo staff list.`)
    } else {
      createStaff(payload)
      setNotice(
        `${payload.fullName} was added to the demo staff list. The initial password was validated but not stored.`,
      )
    }

    closeModal()
  }

  const handleToggle = (member) => {
    toggleStaffStatus(member.id)
    setNotice(
      `${member.fullName} is now ${member.status === 'Active' ? 'inactive' : 'active'} in the demo list.`,
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin workspace"
        title="Staff"
        description="Manage internal staff access, keep roles fixed to Internal Staff and review who can support customers."
        actions={
          <>
            <SampleDataBadge className="hidden sm:inline-flex" />
            <AdminButton variant="primary" icon={UserPlus} onClick={openAdd}>
              Add staff
            </AdminButton>
          </>
        }
      />

      {notice && <AdminFlashMessage onDismiss={() => setNotice('')}>{notice}</AdminFlashMessage>}

      <AdminSummaryCards
        items={[
          { label: 'Total staff', value: staff.length, hint: 'Internal support team', icon: Users, tone: 'sky' },
          { label: 'Active', value: activeCount, hint: 'Can sign in and assist', icon: UserCheck, tone: 'teal' },
          { label: 'Inactive', value: inactiveCount, hint: 'Access suspended', icon: UserX, tone: 'amber' },
          { label: 'Added recently', value: recentCount, hint: 'Since July 2026', icon: UserPlus, tone: 'slate' },
        ]}
      />

      <Panel
        title="Staff directory"
        description="Search by name or email, filter by status and toggle access in this demo session."
        bodyClassName="p-0"
        actions={<span className="text-[11px] text-slate-500">{filteredStaff.length} shown</span>}
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
              placeholder="Search staff name or email"
              aria-label="Search staff"
              className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-[12.5px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#146c94] focus:ring-1 focus:ring-[#146c94]"
            />
          </div>
          <AdminSelect
            id="staff-status-filter"
            label="Status filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="!h-9"
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
          rows={filteredStaff}
          getRowId={(row) => row.id}
          emptyTitle="No staff match your filters"
          emptyDescription="Try a different search term or status, or add a new staff member."
          emptyAction={
            <AdminButton className="mt-2" icon={UserPlus} onClick={openAdd}>
              Add staff
            </AdminButton>
          }
          columns={[
            {
              key: 'name',
              header: 'Staff member',
              render: (row) => (
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-slate-200 bg-[#f8fafc] text-[10.5px] font-semibold text-[#146c94]">
                    {getInitials(row.fullName)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-slate-900">
                      {row.fullName}
                    </p>
                    <p className="truncate text-[11.5px] text-slate-500">{row.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'role',
              header: 'Role',
              render: () => <StatusBadge tone="accent">Internal Staff</StatusBadge>,
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <StatusToggle
                  status={row.status}
                  label={row.fullName}
                  onToggle={() => handleToggle(row)}
                />
              ),
            },
            {
              key: 'created',
              header: 'Created',
              render: (row) => (
                <span className="tabular-nums text-slate-600">{formatDate(row.createdAt)}</span>
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
        Staff records here are local sample data. Creating a staff account in production must be a
        server-side admin operation that creates the Firebase Auth user and trusted staff profile.
        Plaintext passwords are never stored in this demo list.
      </SampleDataNotice>

      <AdminModal
        open={modalMode !== null}
        onClose={closeModal}
        title={modalMode === 'edit' ? 'Edit staff member' : 'Add staff member'}
        description={
          modalMode === 'edit'
            ? 'Update the name, email or access status. The role stays fixed to Internal Staff.'
            : 'Create a demo staff record. Role is fixed to Internal Staff and the password is not stored.'
        }
        footer={
          <>
            <AdminButton onClick={closeModal}>Cancel</AdminButton>
            <AdminButton variant="primary" type="submit" form="staff-form">
              {modalMode === 'edit' ? 'Save changes' : 'Add staff'}
            </AdminButton>
          </>
        }
      >
        <form id="staff-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
          <AdminInput
            id="staff-full-name"
            name="fullName"
            label="Full name"
            required
            value={form.fullName}
            onChange={handleChange}
            error={errors.fullName}
            placeholder="e.g. Jordan Lee"
            autoComplete="off"
          />
          <AdminInput
            id="staff-email"
            name="email"
            type="email"
            label="Email address"
            required
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="name@brightloop.co"
            autoComplete="off"
          />
          {!editingId && (
            <div className="space-y-2">
              <AdminInput
                id="staff-password"
                name="password"
                type="password"
                label="Initial password"
                required
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Set a temporary password"
                autoComplete="new-password"
                hint="Shared with the staff member through your secure process. Never shown again."
              />
              <PasswordChecklist password={form.password} />
            </div>
          )}
          <AdminSelect
            id="staff-status"
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
          <div className="rounded-lg border border-slate-200 bg-[#f8fafc] px-3 py-2.5">
            <p className="text-[11.5px] leading-relaxed text-slate-500">
              <span className="font-semibold text-slate-700">Role:</span> Internal Staff (fixed). In
              production, role assignment and user creation must be enforced by the backend admin
              service.
            </p>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}
