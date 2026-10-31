import { AlertCircle, CalendarClock, RefreshCw, Users, Wallet } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { AdminEmptyState, AdminErrorState } from '../../components/admin/AdminState'
import Panel from '../../components/admin/Panel'
import RecentSubscriptions from '../../components/admin/RecentSubscriptions'
import RevenueChart from '../../components/admin/RevenueChart'
import SampleDataBadge from '../../components/admin/SampleDataBadge'
import SampleDataNotice from '../../components/admin/SampleDataNotice'
import StatCard from '../../components/admin/StatCard'
import { useAdminOverview } from '../../hooks/useAdminOverview'
import { formatCurrency, formatNumber } from '../../lib/adminFormat'

const METRIC_ICONS = {
  customers: Users,
  subscriptions: CalendarClock,
  revenue: Wallet,
  outstanding: AlertCircle,
}

function formatMetricValue(metric) {
  if (metric.format === 'currency') {
    return formatCurrency(metric.value, metric.currency)
  }
  return formatNumber(metric.value)
}

export default function AdminOverview() {
  const { status, data, error, reload } = useAdminOverview()
  const metrics = data?.metrics ?? []
  const subscriptions = data?.recentSubscriptions ?? []
  const loading = status === 'loading'

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin overview"
        title="Overview"
        description="A calm view of customers, recurring revenue and subscription health. Every figure on this page is sample data until the billing APIs are connected."
        actions={
          <>
            <SampleDataBadge className="hidden sm:inline-flex" />
            <button
              type="button"
              onClick={reload}
              disabled={loading}
              aria-busy={loading}
              className="inline-flex h-9 items-center gap-1.5 rounded border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-55"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              Refresh
            </button>
          </>
        }
      />

      {status === 'error' ? (
        <Panel bodyClassName="p-0">
          <AdminErrorState
            title="Overview could not be loaded"
            description={error || 'The demo overview adapter did not return a response.'}
            onRetry={reload}
          />
        </Panel>
      ) : (
        <>
          <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }, (_, index) => <StatCard key={index} loading />)
              : metrics.map((metric) => (
                  <StatCard
                    key={metric.id}
                    label={metric.label}
                    value={formatMetricValue(metric)}
                    icon={METRIC_ICONS[metric.icon]}
                    tone={metric.tone}
                    change={metric.change}
                    changeLabel={metric.changeLabel}
                    hint={metric.hint}
                  />
                ))}
          </section>

          {status === 'success' && !data ? (
            <Panel bodyClassName="p-0">
              <AdminEmptyState
                title="No overview data yet"
                description="Metrics will appear here once the overview service is connected."
              />
            </Panel>
          ) : (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
              <RevenueChart revenue={data?.revenue} loading={loading} />
              <RecentSubscriptions
                subscriptions={subscriptions}
                loading={loading}
                total={metrics.find((metric) => metric.id === 'active-subscriptions')?.value}
              />
            </div>
          )}

          <SampleDataNotice>
            Overview metrics, the revenue chart and recent subscriptions are served by an isolated
            demo adapter. They are not live customer or financial records, and no admin action is
            persisted until the backend contracts are agreed.
          </SampleDataNotice>
        </>
      )}
    </div>
  )
}
