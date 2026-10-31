import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  STAFF_DEMO_CUSTOMERS,
  STAFF_DEMO_INVOICES,
  STAFF_DEMO_PAYMENTS,
  STAFF_DEMO_QUOTATION_TEMPLATES,
  STAFF_DEMO_SUBSCRIPTIONS,
} from '../data/staff/staffDemoData'

const StaffDemoDataContext = createContext(null)

const INITIAL_STATE = {
  status: 'loading',
  error: '',
  customers: [],
  quotationTemplates: [],
  subscriptions: [],
  invoices: [],
  payments: [],
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return dateString
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function makeSubscriptionNumber(subscriptions) {
  const next = subscriptions.length + 1043
  return `SUB-2026-${next}`
}

export function StaffDemoDataProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    setState({ ...INITIAL_STATE, status: 'loading' })

    const timer = window.setTimeout(() => {
      if (!active) return
      setState({
        status: 'success',
        error: '',
        customers: clone(STAFF_DEMO_CUSTOMERS),
        quotationTemplates: clone(STAFF_DEMO_QUOTATION_TEMPLATES),
        subscriptions: clone(STAFF_DEMO_SUBSCRIPTIONS),
        invoices: clone(STAFF_DEMO_INVOICES),
        payments: clone(STAFF_DEMO_PAYMENTS),
      })
    }, 280)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [reloadKey])

  const reload = useCallback(() => {
    setReloadKey((current) => current + 1)
  }, [])

  const getCustomer = useCallback(
    (customerId) => state.customers.find((customer) => customer.id === customerId) ?? null,
    [state.customers],
  )

  const getSubscription = useCallback(
    (subscriptionId) =>
      state.subscriptions.find((subscription) => subscription.id === subscriptionId) ?? null,
    [state.subscriptions],
  )

  const getInvoice = useCallback(
    (invoiceId) => state.invoices.find((invoice) => invoice.id === invoiceId) ?? null,
    [state.invoices],
  )

  const getPaidAmount = useCallback(
    (invoiceId) =>
      state.payments
        .filter((payment) => payment.invoiceId === invoiceId)
        .reduce((total, payment) => total + Number(payment.amount || 0), 0),
    [state.payments],
  )

  const createQuotationTemplate = useCallback((payload) => {
    const template = {
      id: makeId('qt'),
      name: payload.name.trim(),
      planName: payload.planName,
      validityDays: Number(payload.validityDays) || 30,
      status: 'Active',
      updatedAt: today(),
      productLines: payload.productLines.map((line, index) => ({
        id: `${makeId('qtl')}-${index}`,
        productName: line.productName,
        quantity: Number(line.quantity) || 1,
        unitPrice: Number(line.unitPrice) || 0,
        taxRate: Number(line.taxRate) || 0,
        amount: (Number(line.quantity) || 1) * (Number(line.unitPrice) || 0),
      })),
    }

    setState((previous) => ({
      ...previous,
      quotationTemplates: [template, ...previous.quotationTemplates],
    }))

    return template
  }, [])

  const createSubscriptionFromTemplate = useCallback(
    (templateId, customerId) => {
      const template = state.quotationTemplates.find((item) => item.id === templateId)
      const customer = state.customers.find((item) => item.id === customerId)

      if (!template || !customer) {
        return { ok: false, message: 'Select a valid customer and quotation template.' }
      }

      const startDate = today()
      const subtotal = template.productLines.reduce(
        (total, line) => total + line.quantity * line.unitPrice,
        0,
      )
      const tax = template.productLines.reduce(
        (total, line) => total + (line.quantity * line.unitPrice * line.taxRate) / 100,
        0,
      )

      const created = {
        id: makeId('sub'),
        subscriptionNumber: makeSubscriptionNumber(state.subscriptions),
        customerId: customer.id,
        customerName: customer.fullName,
        companyName: customer.companyName,
        planName: template.planName,
        productName: template.productLines[0]?.productName ?? template.planName,
        status: 'Draft',
        startDate,
        endDate: addDays(startDate, template.validityDays),
        renewalDate: addDays(startDate, template.validityDays),
        price: subtotal,
        currency: 'USD',
        billingFrequency: template.planName.includes('Yearly') ? 'Yearly' : 'Monthly',
        quantity: 1,
        paymentTerms: 'Net 15',
        allowPause: true,
        allowRenew: true,
        allowEarlyClose: false,
        lineItems: template.productLines.map((line, index) => ({
          id: `${makeId('li')}-${index}`,
          productName: line.productName,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          taxAmount: (line.quantity * line.unitPrice * line.taxRate) / 100,
          amount: line.quantity * line.unitPrice * (1 + line.taxRate / 100),
        })),
        totals: { subtotal, tax, total: subtotal + tax },
        statusHistory: [
          {
            id: makeId('hist'),
            status: 'Draft',
            date: startDate,
            note: `Created from ${template.name} in the demo session.`,
          },
        ],
      }

      setState((previous) => ({
        ...previous,
        subscriptions: [created, ...previous.subscriptions],
      }))

      return {
        ok: true,
        message: `${created.subscriptionNumber} was created from the selected template.`,
      }
    },
    [state],
  )

  const advanceSubscriptionStatus = useCallback(
    (subscriptionId) => {
      const flow = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed']
      const subscription = state.subscriptions.find((item) => item.id === subscriptionId)

      if (!subscription) return { ok: false, message: 'Subscription not found.' }

      const currentIndex = flow.indexOf(subscription.status)
      if (currentIndex < 0 || currentIndex === flow.length - 1) {
        return {
          ok: false,
          message: `${subscription.subscriptionNumber} cannot move forward from ${subscription.status}.`,
        }
      }

      const nextStatus = flow[currentIndex + 1]
      setState((previous) => ({
        ...previous,
        subscriptions: previous.subscriptions.map((item) =>
          item.id === subscriptionId
            ? {
                ...item,
                status: nextStatus,
                statusHistory: [
                  ...item.statusHistory,
                  {
                    id: makeId('hist'),
                    status: nextStatus,
                    date: today(),
                    note: 'Updated in the demo session.',
                  },
                ],
              }
            : item,
        ),
      }))

      return {
        ok: true,
        message: `${subscription.subscriptionNumber} moved to ${nextStatus}.`,
      }
    },
    [state.subscriptions],
  )

  const generateInvoice = useCallback(
    (subscriptionId) => {
      const subscription = state.subscriptions.find((item) => item.id === subscriptionId)
      if (!subscription) return { ok: false, message: 'Subscription not found.' }

      const existing = state.invoices.some(
        (invoice) => invoice.subscriptionId === subscriptionId,
      )
      if (existing) {
        return {
          ok: false,
          message: `An invoice already exists for ${subscription.subscriptionNumber}.`,
        }
      }

      const invoiceNumber = `INV-2026-${2047 + state.invoices.length}`
      const invoice = {
        id: makeId('inv'),
        invoiceNumber,
        customerId: subscription.customerId,
        customerName: subscription.customerName,
        companyName: subscription.companyName,
        subscriptionId: subscription.id,
        issueDate: today(),
        dueDate: addDays(today(), 30),
        status: 'Draft',
        workflowStatus: 'Draft',
        currency: subscription.currency,
        lineItems: clone(subscription.lineItems),
        totals: clone(subscription.totals),
        notes: `Generated from ${subscription.subscriptionNumber}.`,
      }

      setState((previous) => ({ ...previous, invoices: [invoice, ...previous.invoices] }))

      return { ok: true, message: `${invoiceNumber} was generated as a draft.` }
    },
    [state.invoices, state.subscriptions],
  )

  const confirmInvoice = useCallback(
    (invoiceId) => {
      const invoice = state.invoices.find((item) => item.id === invoiceId)
      if (!invoice) return { ok: false, message: 'Invoice not found.' }

      if (invoice.workflowStatus !== 'Draft') {
        return {
          ok: false,
          message: `${invoice.invoiceNumber} is already ${invoice.workflowStatus}.`,
        }
      }

      setState((previous) => ({
        ...previous,
        invoices: previous.invoices.map((item) =>
          item.id === invoiceId
            ? {
                ...item,
                workflowStatus: 'Confirmed',
                status: item.status === 'Draft' ? 'Outstanding' : item.status,
              }
            : item,
        ),
      }))

      return {
        ok: true,
        message: `${invoice.invoiceNumber} is confirmed and ready to send.`,
      }
    },
    [state.invoices],
  )

  const cancelInvoice = useCallback(
    (invoiceId) => {
      const invoice = state.invoices.find((item) => item.id === invoiceId)
      if (!invoice) return { ok: false, message: 'Invoice not found.' }

      if (invoice.workflowStatus === 'Paid') {
        return { ok: false, message: `${invoice.invoiceNumber} is already paid.` }
      }

      setState((previous) => ({
        ...previous,
        invoices: previous.invoices.map((item) =>
          item.id === invoiceId
            ? { ...item, workflowStatus: 'Draft', status: 'Draft' }
            : item,
        ),
      }))

      return {
        ok: true,
        message: `${invoice.invoiceNumber} was cancelled in the demo session.`,
      }
    },
    [state.invoices],
  )

  const recordPayment = useCallback(
    (payload) => {
      const invoice = state.invoices.find((item) => item.id === payload.invoiceId)
      if (!invoice) return { ok: false, message: 'Invoice not found.' }

      const amount = Number(payload.amount)
      if (!amount || amount <= 0) {
        return { ok: false, message: 'Payment amount must be greater than zero.' }
      }

      const alreadyPaid = state.payments
        .filter((payment) => payment.invoiceId === invoice.id)
        .reduce((total, payment) => total + Number(payment.amount || 0), 0)

      if (alreadyPaid + amount > invoice.totals.total + 0.001) {
        return { ok: false, message: 'Payment exceeds the invoice balance.' }
      }

      const payment = {
        id: makeId('pay'),
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        method: payload.method,
        amount,
        currency: invoice.currency,
        date: payload.date || today(),
        note: payload.note?.trim() || 'Recorded in the demo session.',
      }

      const fullyPaid = alreadyPaid + amount >= invoice.totals.total - 0.001

      setState((previous) => ({
        ...previous,
        payments: [payment, ...previous.payments],
        invoices: previous.invoices.map((item) =>
          item.id === invoice.id && fullyPaid
            ? { ...item, status: 'Paid', workflowStatus: 'Paid' }
            : item,
        ),
      }))

      return {
        ok: true,
        message: fullyPaid
          ? `${invoice.invoiceNumber} is marked Paid in the demo session.`
          : `Payment recorded for ${invoice.invoiceNumber}. Balance remains open.`,
      }
    },
    [state.invoices, state.payments],
  )

  const value = useMemo(
    () => ({
      ...state,
      reload,
      getCustomer,
      getSubscription,
      getInvoice,
      getPaidAmount,
      createQuotationTemplate,
      createSubscriptionFromTemplate,
      advanceSubscriptionStatus,
      generateInvoice,
      confirmInvoice,
      cancelInvoice,
      recordPayment,
    }),
    [
      state,
      reload,
      getCustomer,
      getSubscription,
      getInvoice,
      getPaidAmount,
      createQuotationTemplate,
      createSubscriptionFromTemplate,
      advanceSubscriptionStatus,
      generateInvoice,
      confirmInvoice,
      cancelInvoice,
      recordPayment,
    ],
  )

  return (
    <StaffDemoDataContext.Provider value={value}>{children}</StaffDemoDataContext.Provider>
  )
}

export function useStaffDemoData() {
  const context = useContext(StaffDemoDataContext)
  if (!context) {
    throw new Error('useStaffDemoData must be used within a StaffDemoDataProvider.')
  }
  return context
}
