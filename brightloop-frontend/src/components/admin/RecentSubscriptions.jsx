import Panel from './Panel'
import SampleDataBadge from './SampleDataBadge'
import StatusBadge from './StatusBadge'
import { AdminEmptyState, AdminLoadingState } from './AdminState'
import { formatCurrency, formatDate, getInitials } from '../../lib/adminFormat'

const STATUS_TONES = {
  Active: 'success',
  Trialing: 'accent',
  'Past due': 'danger',
  Paused: 'neutral',
  Cancelled: 'neutral',
}

function SubscriptionRow({ subscription }) {
  return (
    <li className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#f8fafc]">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 bg-[#f8fafc] text-[11px] font-semibold text-[#146c94]">
        {getInitials(subscription.customer)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-slate-900">
          {subscription.customer}
        </p>
        <p className="mt-0.5 truncate text-[11.5px] text-slate-500">
          {subscription.plan} · {formatDate(subscription.startedAt)}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-[12.5px] font-semibold tabular-nums text-slate-900">
          {formatCurrency(subscription.amount, subscription.currency)}
        </p>
        <div className="mt-1 flex justify-end">
          <StatusBadge tone={STATUS_TONES[subscription.status] ?? 'neutral'}>
            {subscription.status}
          </StatusBadge>
        </div>
      </div>
    </li>
  )
}

export default function RecentSubscriptions({ subscriptions = [], loading = false, total }) {
  return (
    <Panel
      title="Recent subscriptions"
      description="Latest customer plans and their billing status"
      actions={<SampleDataBadge />}
      bodyClassName="p-0"
      footer={
        loading
          ? 'Loading sample subscriptions…'
          : `Showing ${subscriptions.length} of ${total ?? subscriptions.length} subscriptions · sample data`
      }
    >
      {loading ? (
        <AdminLoadingState label="Loading sample subscriptions…" />
      ) : subscriptions.length === 0 ? (
        <AdminEmptyState
          title="No subscriptions yet"
          description="Recent customer subscriptions will appear here after the first billing cycle."
        />
      ) : (
        <ul className="divide-y divide-[#f1f5f9]">
          {subscriptions.map((subscription) => (
            <SubscriptionRow key={subscription.id} subscription={subscription} />
          ))}
        </ul>
      )}
    </Panel>
  )
}
