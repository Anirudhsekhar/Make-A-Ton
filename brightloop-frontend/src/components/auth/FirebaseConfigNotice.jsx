import { isFirebaseConfigured, missingFirebaseConfig } from '../../config/firebase'
import AuthNotice from './AuthNotice'

export default function FirebaseConfigNotice() {
  if (isFirebaseConfigured) return null

  return (
    <AuthNotice variant="warning" title="Firebase setup required">
      Add the missing {missingFirebaseConfig.length > 1 ? 'values' : 'value'}{' '}
      <span className="font-mono text-[10.5px] text-amber-200/80">
        {missingFirebaseConfig.join(', ')}
      </span>{' '}
      to <span className="font-mono text-[10.5px] text-amber-200/80">.env</span>, then restart the
      dev server.
    </AuthNotice>
  )
}
