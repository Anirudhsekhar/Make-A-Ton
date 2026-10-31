import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import {
  CUSTOMER_DEMO_INVOICES,
  CUSTOMER_DEMO_PROFILE,
  CUSTOMER_DEMO_SUBSCRIPTIONS,
} from '../data/customer/customerDemoData'
import {
  fetchCustomerInvoicePdf,
  fetchCustomerInvoices,
  fetchCustomerSubscriptions,
  requestCustomerSubscriptionAction,
  updateCustomerProfile,
} from '../services/customer/customerService'
import { changeEmailWithReauth, changePasswordWithReauth } from '../services/authService'
import { createSampleInvoicePdf, triggerDownload } from '../lib/customerInvoicePdf'
import { getCancelState, getPauseState, getRenewState } from '../lib/customerFormat'

const CustomerPortalContext = createContext(null)

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return dateString
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function addBillingInterval(dateString, frequency) {
  const date = new Date(`${dateString}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return dateString

  if (frequency === 'Daily') date.setUTCDate(date.getUTCDate() + 1)
  else if (frequency === 'Weekly') date.setUTCDate(date.getUTCDate() + 7)
  else if (frequency === 'Quarterly') date.setUTCMonth(date.getUTCMonth() + 3)
  else if (frequency === 'Yearly') date.setUTCFullYear(date.getUTCFullYear() + 1)
  else date.setUTCMonth(date.getUTCMonth() + 1)

  return date.toISOString().slice(0, 10)
}

function nextRenewal(subscriptions) {
  const candidates = subscriptions
    .filter((subscription) => subscription.status === 'Active' && subscription.renewalDate)
    .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate))
  return candidates[0] ?? null
}

function buildOverview(subscriptions, invoices) {
  const active = subscriptions.filter((subscription) => subscription.status === 'Active')
  const outstandingInvoices = invoices.filter((invoice) =>
    ['Outstanding', 'Overdue'].includes(invoice.status),
  )
  const outstandingAmount = outstandingInvoices.reduce(
    (total, invoice) => total + (invoice.totals?.total ?? 0),
    0,
  )
  const recentInvoices = [...invoices]
    .sort((a, b) => String(b.issueDate).localeCompare(String(a.issueDate)))
    .slice(0, 4)

  return {
    activeSubscriptions: active.length,
    nextRenewal: nextRenewal(subscriptions),
    outstandingAmount,
    outstandingCount: outstandingInvoices.length,
    paidCount: invoices.filter((invoice) => invoice.status === 'Paid').length,
    overdueCount: invoices.filter((invoice) => invoice.status === 'Overdue').length,
    recentInvoices,
    currency: invoices[0]?.currency || 'USD',
  }
}

const INITIAL_STATE = {
  status: 'loading',
  error: '',
  profile: null,
  subscriptions: [],
  invoices: [],
}

export function CustomerPortalProvider({ demo = false, children }) {
  const { firebaseUser, profile: authProfile } = useAuth()
  const [state, setState] = useState(INITIAL_STATE)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!demo) return undefined

    let active = true
    setState({ ...INITIAL_STATE, status: 'loading' })

    const timer = window.setTimeout(() => {
      if (!active) return
      setState({
        status: 'success',
        error: '',
        profile: clone(CUSTOMER_DEMO_PROFILE),
        subscriptions: clone(CUSTOMER_DEMO_SUBSCRIPTIONS),
        invoices: clone(CUSTOMER_DEMO_INVOICES),
      })
    }, 320)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [demo, reloadKey])

  useEffect(() => {
    if (demo || !firebaseUser) return undefined

    let active = true
    setState((previous) => ({
      ...previous,
      status: 'loading',
      error: '',
      profile: previous.profile || authProfile,
    }))

    Promise.all([
      fetchCustomerSubscriptions(firebaseUser),
      fetchCustomerInvoices(firebaseUser),
    ])
      .then(([subscriptions, invoices]) => {
        if (!active) return
        setState({
          status: 'success',
          error: '',
          profile: authProfile,
          subscriptions,
          invoices,
        })
      })
      .catch((error) => {
        if (!active) return
        setState((previous) => ({
          ...previous,
          status: 'error',
          error:
            error instanceof Error
              ? error.message
              : 'Customer records could not be loaded.',
          profile: previous.profile || authProfile,
        }))
      })

    return () => {
      active = false
    }
  }, [demo, firebaseUser, authProfile, reloadKey])

  const reload = useCallback(() => {
    setReloadKey((current) => current + 1)
  }, [])

  const getSubscription = useCallback(
    (subscriptionId) =>
      state.subscriptions.find((subscription) => subscription.id === subscriptionId) ?? null,
    [state.subscriptions],
  )

  const getInvoice = useCallback(
    (invoiceId) => state.invoices.find((invoice) => invoice.id === invoiceId) ?? null,
    [state.invoices],
  )

  const pauseSubscription = useCallback(
    async (subscriptionId) => {
      const subscription = state.subscriptions.find((item) => item.id === subscriptionId)
      if (!subscription) return { ok: false, message: 'Subscription not found.' }

      if (!demo) {
        try {
          await requestCustomerSubscriptionAction(firebaseUser, subscriptionId, 'pause')
          reload()
          return { ok: true, message: 'Pause request submitted to the billing service.' }
        } catch (error) {
          return { ok: false, message: error.message }
        }
      }

      const permission = getPauseState(subscription)
      if (!permission.allowed) return { ok: false, message: permission.reason }

      setState((previous) => ({
        ...previous,
        subscriptions: previous.subscriptions.map((item) =>
          item.id === subscriptionId
            ? {
                ...item,
                status: 'Paused',
                statusHistory: [
                  ...item.statusHistory,
                  {
                    id: `hist-${Date.now()}`,
                    status: 'Paused',
                    date: new Date().toISOString().slice(0, 10),
                    note: 'Paused in the demo session.',
                  },
                ],
              }
            : item,
        ),
      }))

      return {
        ok: true,
        message: `${subscription.subscriptionNumber} is paused in the demo session.`,
      }
    },
    [demo, firebaseUser, reload, state.subscriptions],
  )

  const renewSubscription = useCallback(
    async (subscriptionId) => {
      const subscription = state.subscriptions.find((item) => item.id === subscriptionId)
      if (!subscription) return { ok: false, message: 'Subscription not found.' }

      if (!demo) {
        try {
          await requestCustomerSubscriptionAction(firebaseUser, subscriptionId, 'renew')
          reload()
          return { ok: true, message: 'Renewal request submitted to the billing service.' }
        } catch (error) {
          return { ok: false, message: error.message }
        }
      }

      const permission = getRenewState(subscription)
      if (!permission.allowed) return { ok: false, message: permission.reason }

      const baseDate = subscription.endDate || subscription.renewalDate
      const newEndDate = addBillingInterval(baseDate, subscription.billingFrequency)
      const newRenewalDate = addDays(newEndDate, 1)

      setState((previous) => ({
        ...previous,
        subscriptions: previous.subscriptions.map((item) =>
          item.id === subscriptionId
            ? {
                ...item,
                endDate: newEndDate,
                expiryDate: newEndDate,
                renewalDate: newRenewalDate,
                statusHistory: [
                  ...item.statusHistory,
                  {
                    id: `hist-${Date.now()}`,
                    status: item.status,
                    date: new Date().toISOString().slice(0, 10),
                    note: `Renewed in the demo session to ${newEndDate}.`,
                  },
                ],
              }
            : item,
        ),
      }))

      return {
        ok: true,
        message: `${subscription.subscriptionNumber} was renewed in the demo session through ${newEndDate}.`,
      }
    },
    [demo, firebaseUser, reload, state.subscriptions],
  )

  const requestCancellation = useCallback(
    async (subscriptionId) => {
      const subscription = state.subscriptions.find((item) => item.id === subscriptionId)
      if (!subscription) return { ok: false, message: 'Subscription not found.' }

      if (!demo) {
        try {
          await requestCustomerSubscriptionAction(firebaseUser, subscriptionId, 'cancel')
          reload()
          return { ok: true, message: 'Cancellation request submitted to the billing service.' }
        } catch (error) {
          return { ok: false, message: error.message }
        }
      }

      const permission = getCancelState(subscription)
      if (!permission.allowed) return { ok: false, message: permission.reason }

      setState((previous) => ({
        ...previous,
        subscriptions: previous.subscriptions.map((item) =>
          item.id === subscriptionId
            ? {
                ...item,
                status: 'Cancellation requested',
                cancellationRequested: true,
                statusHistory: [
                  ...item.statusHistory,
                  {
                    id: `hist-${Date.now()}`,
                    status: 'Cancellation requested',
                    date: new Date().toISOString().slice(0, 10),
                    note: 'Cancellation requested in the demo session.',
                  },
                ],
              }
            : item,
        ),
      }))

      return {
        ok: true,
        message: `Cancellation was requested for ${subscription.subscriptionNumber} in the demo session.`,
      }
    },
    [demo, firebaseUser, reload, state.subscriptions],
  )

  const saveProfile = useCallback(
    async (values) => {
      const payload = {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        businessType: values.businessType,
        phoneNumber: values.phoneNumber.trim(),
        companyName: values.companyName.trim(),
      }

      if (demo) {
        setState((previous) => ({
          ...previous,
          profile: { ...previous.profile, ...payload },
        }))
        return {
          ok: true,
          message: 'Profile changes were saved in the demo session. Nothing was persisted.',
        }
      }

      if (!firebaseUser) {
        return { ok: false, message: 'Sign in to update your profile.' }
      }

      let emailMessage = ''
      const currentEmail = state.profile?.email?.trim().toLowerCase() ?? ''
      if (payload.email.toLowerCase() !== currentEmail) {
        const emailResult = await changeEmailWithReauth({
          currentPassword: values.currentPassword,
          newEmail: payload.email,
        })
        if (!emailResult.ok) return emailResult
        emailMessage = emailResult.message
      }

      try {
        const updated = await updateCustomerProfile(firebaseUser, payload)
        const nextProfile = updated?.profile ?? updated ?? payload
        setState((previous) => ({
          ...previous,
          profile: { ...previous.profile, ...nextProfile },
        }))
        return {
          ok: true,
          message: emailMessage
            ? `${emailMessage} Profile details were submitted to the backend.`
            : 'Profile details were updated.',
        }
      } catch (error) {
        return { ok: false, message: error.message }
      }
    },
    [demo, firebaseUser, state.profile],
  )

  const changePassword = useCallback(
    async ({ currentPassword, newPassword }) => {
      if (demo) {
        return {
          ok: true,
          message:
            'Password change simulated in the demo session. No password was stored or sent anywhere.',
        }
      }

      if (!firebaseUser) {
        return { ok: false, message: 'Sign in to change your password.' }
      }

      return changePasswordWithReauth({ currentPassword, newPassword })
    },
    [demo, firebaseUser],
  )

  const downloadInvoice = useCallback(
    async (invoice) => {
      if (!invoice) return { ok: false, message: 'Invoice not found.' }

      if (demo) {
        const blob = createSampleInvoicePdf(invoice, state.profile)
        triggerDownload(blob, `${invoice.invoiceNumber}-sample.pdf`)
        return {
          ok: true,
          message: 'A sample invoice PDF was generated locally. No server PDF was fetched.',
        }
      }

      try {
        const blob = await fetchCustomerInvoicePdf(firebaseUser, invoice.id)
        triggerDownload(blob, `${invoice.invoiceNumber}.pdf`)
        return { ok: true, message: 'Invoice PDF downloaded from the backend.' }
      } catch (error) {
        return { ok: false, message: error.message }
      }
    },
    [demo, firebaseUser, state.profile],
  )

  const overview = useMemo(
    () => buildOverview(state.subscriptions, state.invoices),
    [state.subscriptions, state.invoices],
  )

  const value = useMemo(
    () => ({
      demo,
      status: state.status,
      error: state.error,
      profile: state.profile,
      subscriptions: state.subscriptions,
      invoices: state.invoices,
      overview,
      reload,
      getSubscription,
      getInvoice,
      pauseSubscription,
      renewSubscription,
      requestCancellation,
      saveProfile,
      changePassword,
      downloadInvoice,
    }),
    [
      demo,
      state.status,
      state.error,
      state.profile,
      state.subscriptions,
      state.invoices,
      overview,
      reload,
      getSubscription,
      getInvoice,
      pauseSubscription,
      renewSubscription,
      requestCancellation,
      saveProfile,
      changePassword,
      downloadInvoice,
    ],
  )

  return (
    <CustomerPortalContext.Provider value={value}>{children}</CustomerPortalContext.Provider>
  )
}

export function useCustomerPortal() {
  const context = useContext(CustomerPortalContext)
  if (!context) {
    throw new Error('useCustomerPortal must be used inside CustomerPortalProvider')
  }
  return context
}
