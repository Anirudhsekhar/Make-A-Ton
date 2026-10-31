import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  ReceiptText,
} from 'lucide-react'
import AdminButton from '../../components/admin/AdminButton'
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
  invoiceStatusTone,
  invoiceWorkflowTone,
} from '../../lib/customerFormat'

function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f1f5f9] py-2.5 last:border-0">
      <dt className="text-[12px] text-slate-500">{label}</dt>
      <dd className="text-right text-[12.5px] font-medium text-slate-900">{children}</dd>
    </div>
  )
}

export default function CustomerInvoiceDetail() {
  const { invoiceId } = useParams()
  const base = useCustomerBasePath()
  const {
    demo,
    status,
    error,
    invoices,
    getInvoice,
    downloadInvoice,
    reload,
  } = useCustomerPortal()
  const [feedback, setFeedback] = useState(null)
  const [downloading, setDownloading] = useState(false)

  const invoice = getInvoice(invoiceId)
  const loading = status === 'loading' && invoices.length === 0
  const backLink = (
    <Link
      to={`${base}/invoices`}
      className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-500 transition-colors hover:text-slate-900"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
      Back to invoices
    </Link>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        {backLink}
        <Panel bodyClassName="p-0">
          <AdminLoadingState label="Loading invoice details…" />
        </Panel>
      </div>
    )
  }

  if (status === 'error' && !invoice) {
    return (
      <div className="space-y-6">
        {backLink}
        <Panel bodyClassName="p-0">
          <AdminErrorState
            title="Invoice could not be loaded"
            description={error || 'The invoice detail service did not return a response.'}
            onRetry={reload}
          />
        </Panel>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        {backLink}
        <Panel bodyClassName="p-0">
          <AdminEmptyState
            title="Invoice not found"
            description="This invoice does not belong to your account or is no longer available."
            action={
              <Link
                to={`${base}/invoices`}
                className="mt-2 inline-flex h-9 items-center rounded border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-[#f8fafc]"
              >
                Return to invoices
              </Link>
            }
          />
        </Panel>
      </div>
    )
  }

  const handleDownload = async () => {
    setDownloading(true)
    setFeedback(null)
    const result = await downloadInvoice(invoice)
    setDownloading(false)
    setFeedback({ tone: result.ok ? 'success' : 'error', message: result.message })
  }

  return (
    <div className="space-y-6">
      {backLink}

      <AdminPageHeader
        eyebrow={`Invoice ${invoice.invoiceNumber}`}
        title={invoice.invoiceNumber}
        description={`Issued ${formatDate(invoice.issueDate)} · Due ${formatDate(invoice.dueDate)}`}
        actions={
          <>
            {demo && <SampleDataBadge className="hidden sm:inline-flex" />}
            <AdminButton
              variant="primary"
              icon={Download}
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading
                ? 'Preparing…'
                : demo
                  ? 'Download sample PDF'
                  : 'Download PDF'}
            </AdminButton>
          </>
        }
      />

      {feedback && (
        <div
          role={feedback.tone === 'success' ? 'status' : 'alert'}
          className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 ${
            feedback.tone === 'success'
              ? 'border-[#ccfbf1] bg-[#f0fdfa] text-slate-700'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {feedback.tone === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0f766e]" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
          )}
          <p className="min-w-0 flex-1 text-[12px] leading-relaxed">{feedback.message}</p>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[11px] font-semibold underline-offset-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Panel title="Invoice details" description="Billing dates and workflow state.">
          <dl className="grid gap-x-8 sm:grid-cols-2">
            <DetailRow label="Invoice number">{invoice.invoiceNumber}</DetailRow>
            <DetailRow label="Subscription">
              {invoice.subscriptionId ? (
                <Link
                  to={`${base}/subscriptions/${invoice.subscriptionId}`}
                  className="font-semibold text-[#00709f] hover:text-[#005374]"
                >
                  {invoice.subscriptionNumber}
                </Link>
              ) : (
                '—'
              )}
            </DetailRow>
            <DetailRow label="Issued">{formatDate(invoice.issueDate)}</DetailRow>
            <DetailRow label="Due">{formatDate(invoice.dueDate)}</DetailRow>
            <DetailRow label="Paid">{formatDate(invoice.paidDate)}</DetailRow>
            <DetailRow label="Customer status">
              <StatusBadge tone={invoiceStatusTone(invoice.status)}>{invoice.status}</StatusBadge>
            </DetailRow>
            <DetailRow label="Workflow state">
              <StatusBadge tone={invoiceWorkflowTone(invoice.workflowState)}>
                {invoice.workflowState}
              </StatusBadge>
            </DetailRow>
            <DetailRow label="Currency">{invoice.currency}</DetailRow>
          </dl>
        </Panel>

        <Panel title="Amount due" description="Totals recorded for this invoice.">
          <p className="font-display text-[34px] font-medium leading-none tracking-[-0.02em] text-slate-900 tabular-nums">
            {formatMoney(invoice.totals.total, invoice.currency)}
          </p>
          <dl className="mt-4 space-y-2 text-[12.5px]">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="font-medium text-slate-900 tabular-nums">
                {formatMoney(invoice.totals.subtotal, invoice.currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Discount</dt>
              <dd className="font-medium text-slate-900 tabular-nums">
                {formatMoney(invoice.totals.discount, invoice.currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Tax</dt>
              <dd className="font-medium text-slate-900 tabular-nums">
                {formatMoney(invoice.totals.tax, invoice.currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-[#f1f5f9] pt-2">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="font-semibold text-slate-900 tabular-nums">
                {formatMoney(invoice.totals.total, invoice.currency)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 rounded border border-slate-200 bg-[#f8fafc] px-3 py-2 text-[11px] leading-relaxed text-slate-500">
            Pay Now is not available in this release. Payment collection remains with the billing
            service.
          </p>
        </Panel>
      </div>

      <Panel
        title="Line items"
        description="Invoice quantities, taxes and line totals."
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
              {invoice.lineItems.map((item) => (
                <tr key={item.id} className="border-b border-[#f1f5f9] last:border-0">
                  <td className="px-4 py-3 text-[12.5px] text-slate-700">{item.description}</td>
                  <td className="px-4 py-3 text-right text-[12.5px] text-slate-600 tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-[12.5px] text-slate-600 tabular-nums">
                    {formatMoney(item.unitPrice, invoice.currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-[11.5px] text-slate-600 tabular-nums">
                    {item.taxRate}%
                    <span className="block text-slate-500">
                      {formatMoney(item.taxAmount, invoice.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[12.5px] font-semibold text-slate-900 tabular-nums">
                    {formatMoney(item.total, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Payment history"
        description="Payments recorded against this invoice."
        bodyClassName="p-0"
      >
        {invoice.payments.length === 0 ? (
          <AdminEmptyState
            icon={ReceiptText}
            title="No payments recorded"
            description="Payments will appear here once the invoice is settled."
          />
        ) : (
          <ul className="divide-y divide-[#f1f5f9]">
            {invoice.payments.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-slate-900">
                    {formatMoney(payment.amount, invoice.currency)}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-slate-500">
                    {payment.method} · {payment.reference}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11.5px] text-slate-500 tabular-nums">
                    {formatDate(payment.paidAt)}
                  </span>
                  <StatusBadge tone="success">{payment.status}</StatusBadge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <CustomerDemoNotice demo={demo}>
        This invoice, its payment history and the sample PDF are mock records. Production PDFs must
        come from the authenticated backend endpoint and must never be fabricated client-side.
      </CustomerDemoNotice>
    </div>
  )
}
