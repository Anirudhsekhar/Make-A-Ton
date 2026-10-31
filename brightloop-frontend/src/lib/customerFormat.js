import { formatCurrency, formatDate } from './adminFormat'

export { formatCurrency, formatDate }

export function formatMoney(value, currency = 'USD') {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const SUBSCRIPTION_STATUS_TONES = {
  Active: 'success',
  Confirmed: 'accent',
  Quotation: 'warning',
  Draft: 'neutral',
  Paused: 'warning',
  Closed: 'neutral',
  'Cancellation requested': 'danger',
}

const INVOICE_STATUS_TONES = {
  Paid: 'success',
  Outstanding: 'warning',
  Overdue: 'danger',
  Draft: 'neutral',
}

const WORKFLOW_STATUS_TONES = {
  Draft: 'neutral',
  Confirmed: 'accent',
  Paid: 'success',
}

export function subscriptionStatusTone(status) {
  return SUBSCRIPTION_STATUS_TONES[status] ?? 'neutral'
}

export function invoiceStatusTone(status) {
  return INVOICE_STATUS_TONES[status] ?? 'neutral'
}

export function invoiceWorkflowTone(status) {
  return WORKFLOW_STATUS_TONES[status] ?? 'neutral'
}

export const SUBSCRIPTION_STATUS_OPTIONS = Object.freeze([
  'Draft',
  'Quotation',
  'Confirmed',
  'Active',
  'Paused',
  'Cancellation requested',
  'Closed',
])

export const INVOICE_STATUS_OPTIONS = Object.freeze([
  'Draft',
  'Outstanding',
  'Overdue',
  'Paid',
])

export function getPauseState(subscription) {
  if (!subscription) return { allowed: false, reason: 'Subscription not found.' }
  if (!subscription.allowPause) {
    return {
      allowed: false,
      reason: subscription.pauseReason || 'Pausing is disabled by this plan.',
    }
  }
  if (subscription.status !== 'Active') {
    return {
      allowed: false,
      reason: `Pause is only available while the subscription is Active. Current status: ${subscription.status}.`,
    }
  }
  return { allowed: true, reason: '' }
}

export function getRenewState(subscription) {
  if (!subscription) return { allowed: false, reason: 'Subscription not found.' }
  if (!subscription.allowRenew) {
    return {
      allowed: false,
      reason: subscription.renewReason || 'Renewal is disabled by this plan.',
    }
  }
  if (!['Active', 'Confirmed'].includes(subscription.status)) {
    return {
      allowed: false,
      reason: `Renewal is available for Active or Confirmed subscriptions. Current status: ${subscription.status}.`,
    }
  }
  return { allowed: true, reason: '' }
}

export function getCancelState(subscription) {
  if (!subscription) return { allowed: false, reason: 'Subscription not found.' }
  if (subscription.cancellationRequested || subscription.status === 'Cancellation requested') {
    return { allowed: false, reason: 'A cancellation request is already pending.' }
  }
  if (!subscription.allowCancel) {
    return {
      allowed: false,
      reason: subscription.cancelReason || 'Cancellation requests are disabled by this plan.',
    }
  }
  if (!['Active', 'Paused', 'Confirmed'].includes(subscription.status)) {
    return {
      allowed: false,
      reason: `Cancellation can be requested for Active, Paused or Confirmed subscriptions. Current status: ${subscription.status}.`,
    }
  }
  return { allowed: true, reason: '' }
}
