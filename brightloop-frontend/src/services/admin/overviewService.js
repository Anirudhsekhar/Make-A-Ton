import { OVERVIEW_DEMO_DATA } from '../../data/admin/overviewDemoData'

const DEMO_LATENCY_MS = 500

function abortError() {
  const error = new Error('The overview request was cancelled.')
  error.name = 'AbortError'
  return error
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError())
      return
    }

    const timer = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)

    const onAbort = () => {
      cleanup()
      reject(abortError())
    }

    const cleanup = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }

    signal?.addEventListener('abort', onAbort)
  })
}

export async function fetchAdminOverview({ signal } = {}) {
  await wait(DEMO_LATENCY_MS, signal)

  // TODO(admin-overview-integration): Replace this demo response with the
  // agreed FastAPI endpoint. Keep the returned shape stable so the overview
  // components do not need to change: { metrics, revenue, recentSubscriptions,
  // currency, lastUpdated }. Role authorization must remain server-enforced.
  return JSON.parse(JSON.stringify(OVERVIEW_DEMO_DATA))
}
