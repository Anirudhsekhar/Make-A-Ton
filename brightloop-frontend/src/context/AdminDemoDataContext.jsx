import { createContext, useContext, useMemo, useState } from 'react'
import {
  DISCOUNTS_DEMO_DATA,
  PLANS_DEMO_DATA,
  PRODUCTS_DEMO_DATA,
  STAFF_DEMO_DATA,
  TAXES_DEMO_DATA,
} from '../data/admin/adminDemoData'

const AdminDemoDataContext = createContext(null)

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function createDemoId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
}

export function AdminDemoDataProvider({ children }) {
  const [staff, setStaff] = useState(() => clone(STAFF_DEMO_DATA))
  const [products, setProducts] = useState(() => clone(PRODUCTS_DEMO_DATA))
  const [plans, setPlans] = useState(() => clone(PLANS_DEMO_DATA))
  const [taxes, setTaxes] = useState(() => clone(TAXES_DEMO_DATA))
  const [discounts, setDiscounts] = useState(() => clone(DISCOUNTS_DEMO_DATA))

  const value = useMemo(
    () => ({
      staff,
      products,
      plans,
      taxes,
      discounts,

      createStaff: (input) => {
        const record = {
          ...input,
          id: createDemoId('staff'),
          role: 'internal_staff',
          createdAt: new Date().toISOString(),
        }
        setStaff((current) => [record, ...current])
        return record
      },
      updateStaff: (id, input) => {
        setStaff((current) =>
          current.map((item) =>
            item.id === id ? { ...item, ...input, id, role: 'internal_staff' } : item,
          ),
        )
      },
      toggleStaffStatus: (id) => {
        setStaff((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
              : item,
          ),
        )
      },

      createProduct: (input) => {
        const record = { ...input, id: createDemoId('prod') }
        setProducts((current) => [record, ...current])
        return record
      },
      updateProduct: (id, input) => {
        setProducts((current) =>
          current.map((item) => (item.id === id ? { ...item, ...input, id } : item)),
        )
      },
      toggleProductStatus: (id) => {
        setProducts((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
              : item,
          ),
        )
      },

      createPlan: (input) => {
        const record = { ...input, id: createDemoId('plan') }
        setPlans((current) => [record, ...current])
        return record
      },
      updatePlan: (id, input) => {
        setPlans((current) =>
          current.map((item) => (item.id === id ? { ...item, ...input, id } : item)),
        )
      },
      togglePlanStatus: (id) => {
        setPlans((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
              : item,
          ),
        )
      },
      deletePlan: (id) => {
        setPlans((current) => current.filter((item) => item.id !== id))
      },

      createTax: (input) => {
        const record = { ...input, id: createDemoId('tax'), updatedAt: new Date().toISOString() }
        setTaxes((current) => [record, ...current])
        return record
      },
      updateTax: (id, input) => {
        setTaxes((current) =>
          current.map((item) =>
            item.id === id ? { ...item, ...input, id, updatedAt: new Date().toISOString() } : item,
          ),
        )
      },
      toggleTaxStatus: (id) => {
        setTaxes((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: item.status === 'Active' ? 'Inactive' : 'Active',
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        )
      },

      createDiscount: (input) => {
        const record = {
          ...input,
          id: createDemoId('disc'),
          createdAt: new Date().toISOString(),
        }
        setDiscounts((current) => [record, ...current])
        return record
      },
      updateDiscount: (id, input) => {
        setDiscounts((current) =>
          current.map((item) => (item.id === id ? { ...item, ...input, id } : item)),
        )
      },
      toggleDiscountStatus: (id) => {
        setDiscounts((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
              : item,
          ),
        )
      },
    }),
    [staff, products, plans, taxes, discounts],
  )

  return <AdminDemoDataContext.Provider value={value}>{children}</AdminDemoDataContext.Provider>
}

export function useAdminDemoData() {
  const context = useContext(AdminDemoDataContext)
  if (!context) {
    throw new Error('useAdminDemoData must be used inside AdminDemoDataProvider')
  }
  return context
}
