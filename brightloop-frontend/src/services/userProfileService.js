export const PROFILE_STATUS = Object.freeze({
  READY: 'ready',
  PENDING: 'pending',
  NOT_FOUND: 'not-found',
  ERROR: 'error',
})

const PROFILE_INTEGRATION_MESSAGE =
  'Firebase sign-in succeeded, but Brightloop could not verify a trusted account profile yet. Dashboard access stays locked until the profile service is connected.'

const PROFILE_CREATE_MESSAGE =
  'Your Firebase account was created, but your customer profile is not ready yet. Account creation stays pending until the profile service confirms it.'

const PROFILE_SYNC_MESSAGE =
  'The authenticated user could not be synced with the Brightloop API yet.'

function errorResult(message) {
  return {
    status: PROFILE_STATUS.ERROR,
    code: 'PROFILE_OPERATION_FAILED',
    message,
  }
}

export async function createCustomerProfile({ firebaseUser, fullName, email, businessType }) {
  if (!firebaseUser?.uid || !fullName || !email || !businessType) {
    return errorResult('Missing account details required to create a customer profile.')
  }

  // TODO(profile-integration): Create the customer profile using the FastAPI
  // endpoint or Firebase data layer agreed with Thowfeek and Devananda. The
  // backend must assign role = customer; never accept a role from this payload.
  // Resolve with:
  // { status: PROFILE_STATUS.READY, profile: { id, firebaseUid, email, fullName, businessType, role } }
  // or { status: PROFILE_STATUS.ERROR, message }.
  return {
    status: PROFILE_STATUS.PENDING,
    code: 'PROFILE_CREATE_PENDING',
    message: PROFILE_CREATE_MESSAGE,
  }
}

export async function getVerifiedProfile(firebaseUser) {
  if (!firebaseUser?.uid) {
    return errorResult('No authenticated Firebase user was supplied for profile verification.')
  }

  // TODO(profile-integration): Retrieve the trusted profile for
  // firebaseUser.uid from the FastAPI backend or the server-managed Firebase
  // data agreed with Thowfeek and Devananda. The verified role must come from
  // that trusted source, never from localStorage, the role dropdown, or another
  // client-controlled value. Resolve with:
  // { status: PROFILE_STATUS.READY, profile: { id, firebaseUid, email, role } }
  // { status: PROFILE_STATUS.NOT_FOUND }
  // or { status: PROFILE_STATUS.ERROR, message }.
  return {
    status: PROFILE_STATUS.PENDING,
    code: 'PROFILE_VERIFICATION_PENDING',
    message: PROFILE_INTEGRATION_MESSAGE,
  }
}

export async function getOrCreateGoogleCustomerProfile({ firebaseUser }) {
  if (!firebaseUser?.uid) {
    return errorResult('No authenticated Google user was supplied for profile setup.')
  }

  // TODO(profile-integration): Look up the profile for firebaseUser.uid. If it
  // does not exist, create a customer profile through the trusted backend. The
  // backend must assign role = customer and never accept a role from the client.
  // A Google account that already belongs to an Admin or Internal Staff member
  // must resolve to that verified role instead.
  return {
    status: PROFILE_STATUS.PENDING,
    code: 'GOOGLE_PROFILE_PENDING',
    message: PROFILE_CREATE_MESSAGE,
  }
}

export async function syncAuthenticatedUser(firebaseUser) {
  if (!firebaseUser?.uid) {
    return errorResult('No authenticated Firebase user was supplied for API sync.')
  }

  // TODO(fastapi-integration): Sync the authenticated Firebase user with the
  // API contract agreed with Thowfeek (for example, exchanging the Firebase ID
  // token through the agreed endpoint). Permissions must still be read from the
  // verified profile response, not from this sync result or client storage.
  return {
    status: PROFILE_STATUS.PENDING,
    code: 'FASTAPI_SYNC_PENDING',
    message: PROFILE_SYNC_MESSAGE,
  }
}
