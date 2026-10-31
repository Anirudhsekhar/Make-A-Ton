import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  PauseCircle,
  RotateCcw,
} from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
} from '../../components/admin/AdminState'
import Panel from '../../components/admin/Panel'
import SampleDataBadge from '../../components/admin/SampleDataBadge'
import StatusBadge from '../../components/admin/StatusBadge'
import CustomerDemoNotice from '../../components/customer/CustomerDemoNotice'
import { useCustomerPortal } from '../../context/CustomerPortalContext'
import { useCustomerBasePath } from '../../hooks/useCustomerBasePath'
import {
  formatDate,
  formatMoney,
  getCancelState,
  getPauseState,
  getRenewState,
  subscriptionStatusTone,
} from '../../lib/customerFormat'

function Feedback({ tone, children, onDismiss }) {
  const success = tone === 'success'
  return (
    <div
      role={success ? 'status' : 'alert'}
      className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 ${
        success
          ? 'border-[#ccfbf1] bg-[#f0fdfa] text-slate-700'
          : 'border-rose-200 bg-rose-50 text-rose-800'
      }`}
    >
      {success ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0f766e]" aria-hidden="true" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
      )}
      <p className="min-w-0 flex-1 text-[12px] leading-relaxed">{children}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-[11px] font-semibold underline-offset-2 hover:underline"
        >
          Dismiss
        </button>
      )}
    </div>
  )
}

function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f1f5f9] py-2.5 last:border-0">
      <dt className="text-[12px] text-slate-500">{label}</dt>
      <dd className="text-right text-[12.5px] font-medium text-slate-900">{children}</dd>
    </div>
  )
}

export default function CustomerSubscriptionDetail() {
  const { subscriptionId } = useParams()
  const base = useCustomerBasePath()
  const {
    demo,
    status,
    error,
    subscriptions,
    getSubscription,
    reload,
    pauseSubscription,
    renewSubscription,
    requestCancellation,
  } = useCustomerPortal()
  const [feedback, setFeedback] = useState(null)
  const [busyAction, setBusyAction] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)

  const subscription = getSubscription(subscriptionId)
  const loading = status === 'loading' && subscriptions.length === 0
  const backLink = (
    <Link
      to={`${base}/subscriptions`}
      className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-500 transition-colors hover:text-slate-900"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
      Back to subscriptions
    </Link>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        {backLink}
        <Panel bodyClassName="p-0">
          <AdminLoadingState label="Loading subscription details…" />
        </Panel>
      </div>
    )
  }

  if (status === 'error' && !subscription) {
    return (
      <div className="space-y-6">
        {backLink}
        <Panel bodyClassName="p-0">
          <AdminErrorState
            title="Subscription could not be loaded"
            description={error || 'The subscription detail service did not return a response.'}
            onRetry={reload}
          />
        </Panel>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        {backLink}
        <Panel bodyClassName="p-0">
          <AdminEmptyState
            title="Subscription not found"
            description="This subscription does not belong to your account or is no longer available."
            action={
              <Link
                to={`${base}/subscriptions`}
                className="mt-2 inline-flex h-9 items-center rounded border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-[#f8fafc]"
              >
                Return to subscriptions
              </Link>
            }
          />
        </Panel>
      </div>
    )
  }

  const pause = getPauseState(subscription)
  const renew = getRenewState(subscription)
  const cancel = getCancelState(subscription)

  const runAction = async (action, handler) => {
    setBusyAction(action)
    setFeedback(null)
    const result = await handler(subscription.id)
    setBusyAction('')
    setFeedback({ tone: result.ok ? 'success' : 'error', message: result.message })
  }

  const handleConfirmCancel = async () => {
    setConfirmCancel(false)
    await runAction('cancel', requestCancellation)
  }

  const actionCards = [
    {
      id: 'pause',
      label: 'Pause subscription',
      description: pause.allowed
        ? 'Pause billing while keeping the subscription on file.'
        : pause.reason,
      icon: PauseCircle,
      allowed: pause.allowed,
      button: (
        <AdminButton
          size="sm"
          icon={PauseCircle}
          disabled={!pause.allowed || busyAction !== ''}
          onClick={() => runAction('pause', pauseSubscription)}
        >
          {busyAction === 'pause' ? 'Pausing…' : 'Pause'}
        </AdminButton>
      ),
    },
    {
      id: 'renew',
      label: 'Renew subscription',
      description: renew.allowed
        ? `Extend the term by ${subscription.billingFrequency.toLowerCase()} billing.`
        : renew.reason,
      icon: RotateCcw,
      allowed: renew.allowed,
      button: (
        <AdminButton
          size="sm"
          icon={RotateCcw}
          disabled={!renew.allowed || busyAction !== ''}
          onClick={() => runAction('renew', renewSubscription)}
        >
          {busyAction === 'renew' ? 'Renewing…' : 'Renew'}
        </AdminButton>
      ),
    },
    {
      id: 'cancel',
      label: 'Request cancellation',
      description: cancel.allowed
        ? 'Submit a cancellation request for review by the billing team.'
        : cancel.reason,
      icon: Ban,
      allowed: cancel.allowed,
      button: (
        <AdminButton
          size="sm"
          variant="danger"
          icon={Ban}
          disabled={!cancel.allowed || busyAction !== ''}
          onClick={() => setConfirmCancel(true)}
        >
          {busyAction === 'cancel' ? 'Submitting…' : 'Request cancellation'}
        </AdminButton>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {backLink}

      <AdminPageHeader
        eyebrow={`Subscription ${subscription.subscriptionNumber}`}
        title={subscription.planName}
        description={`${subscription.productName} · ${subscription.billingFrequency} billing · Quantity ${subscription.quantity}`}
        actions={
          <>
            {demo && <SampleDataBadge className="hidden sm:inline-flex" />}
            <StatusBadge tone={subscriptionStatusTone(subscription.status)}>
              {subscription.status}
            </StatusBadge>
          </>
        }
      />

      {feedback && (
        <Feedback tone={feedback.tone} onDismiss={() => setFeedback(null)}>
          {feedback.message}
        </Feedback>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Panel title="Subscription details" description="Plan terms and key dates.">
          <dl className="grid gap-x-8 sm:grid-cols-2">
            <DetailRow label="Plan">{subscription.planName}</DetailRow>
            <DetailRow label="Product">{subscription.productName}</DetailRow>
            <DetailRow label="Billing frequency">{subscription.billingFrequency}</DetailRow>
            <DetailRow label="Quantity">{subscription.quantity}</DetailRow>
            <DetailRow label="Start date">{formatDate(subscription.startDate)}</DetailRow>
            <DetailRow label="End date">{formatDate(subscription.endDate)}</DetailRow>
            <DetailRow label="Renewal date">{formatDate(subscription.renewalDate)}</DetailRow>
            <DetailRow label="Expiry date">{formatDate(subscription.expiryDate)}</DetailRow>
          </dl>
        </Panel>

        <Panel title="Plan actions" description="Only actions permitted by the plan are enabled.">
          <div className="space-y-3">
            {actionCards.map((action) => {
              const Icon = action.icon
              return (
                <div
                  key={action.id}
                  className="rounded-lg border border-slate-200 bg-[#f8fafc] p-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border ${
                        action.allowed
                          ? 'border-[#bae6fd] bg-[#f0f9ff] text-[#0284c7]'
                          : 'border-slate-200 bg-white text-slate-400'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-slate-900">{action.label}</p>
                      <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex justify-end">{action.button}</div>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>

      <Panel
        title="Line items and totals"
        description="Quantities, taxes and totals as recorded for this subscription."
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#f1f5f9]">
                {['Description', 'Qty', 'Unit price', 'Tax', 'Line total'].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className={`px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-slate-500 ${
                      header === 'Description' ? 'text-left' : 'text-right'
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscription.lineItems.map((item) => (
                <tr key={item.id} className="border-b border-[#f1f5f9] last:border-0">
                  <td className="px-4 py-3 text-[12.5px] text-slate-700">{item.description}</td>
                  <td className="px-4 py-3 text-right text-[12.5px] text-slate-600 tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-[12.5px] text-slate-600 tabular-nums">
                    {formatMoney(item.unitPrice, subscription.currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-[11.5px] text-slate-600 tabular-nums">
                    {item.taxRate}%
                    <span className="block text-slate-500">
                      {formatMoney(item.taxAmount, subscription.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[12.5px] font-semibold text-slate-900 tabular-nums">
                    {formatMoney(item.total, subscription.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-[#f1f5f9] px-4 py-3">
          <dl className="w-full max-w-xs space-y-2 text-[12.5px]">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="font-medium text-slate-900 tabular-nums">
                {formatMoney(subscription.totals.subtotal, subscription.currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Discount</dt>
              <dd className="font-medium text-slate-900 tabular-nums">
                {formatMoney(subscription.totals.discount, subscription.currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Tax</dt>
              <dd className="font-medium text-slate-900 tabular-nums">
                {formatMoney(subscription.totals.tax, subscription.currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-[#f1f5f9] pt-2">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="font-semibold text-slate-900 tabular-nums">
                {formatMoney(subscription.totals.total, subscription.currency)}
              </dd>
            </div>
          </dl>
        </div>
      </Panel>

      <Panel title="Status history" description="Recorded lifecycle events for this subscription.">
        <ol className="space-y-3">
          {subscription.statusHistory.map((event) => (
            <li key={event.id} className="flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#146c94]" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={subscriptionStatusTone(event.status)}>
                    {event.status}
                  </StatusBadge>
                  <span className="text-[11px] text-slate-500 tabular-nums">
                    {formatDate(event.date)}
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{event.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </Panel>

      <CustomerDemoNotice demo={demo}>
        Action permissions in this demo are evaluated from the sample plan policy. Production
        ownership checks and plan enforcement must be validated by the backend for every request.
      </CustomerDemoNotice>

      <AdminConfirmDialog
        open={confirmCancel}
        title="Request cancellation"
        description={
          demo
            ? `Submit a cancellation request for ${subscription.subscriptionNumber}? In demo mode this only updates local sample data.`
            : `Submit a cancellation request for ${subscription.subscriptionNumber}? The billing team will review the request before the subscription closes.`
        }
        confirmLabel="Request cancellation"
        onConfirm={handleConfirmCancel}
        onClose={() => setConfirmCancel(false)}
      />
    </div>
  )
}
