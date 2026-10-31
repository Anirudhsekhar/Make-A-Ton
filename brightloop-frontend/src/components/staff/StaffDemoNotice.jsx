import SampleDataNotice from '../admin/SampleDataNotice'

export default function StaffDemoNotice({ children }) {
  return (
    <SampleDataNotice>
      {children ??
        'Demo mode only. This staff portal uses isolated local mock records. Actions are simulated in the browser and nothing is written to Firebase or FastAPI.'}
    </SampleDataNotice>
  )
}
