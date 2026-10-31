import SampleDataNotice from '../admin/SampleDataNotice'

export default function CustomerDemoNotice({ demo, children }) {
  if (!demo) return null

  return (
    <SampleDataNotice>
      {children ??
        'Demo mode only. This portal uses local mock records; pause, renew, cancellation, profile and PDF actions are simulated locally and nothing is saved.'}
    </SampleDataNotice>
  )
}
