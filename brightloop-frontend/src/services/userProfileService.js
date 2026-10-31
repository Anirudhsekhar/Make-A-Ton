
const API_URL = import.meta.env.VITE_API_BASE_URL

export const PROFILE_STATUS = Object.freeze({
  READY: 'ready',
  PENDING: 'pending',
  NOT_FOUND: 'not-found',
  ERROR: 'error',
})

async function apiRequest(firebaseUser, endpoint, options = {}) {
  if (!API_URL) {
    throw new Error('Backend API URL is not configured.')
  }

  const token = await firebaseUser.getIdToken()

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (response.status === 404) {
    return { notFound: true }
  }

if (!response.ok) {
  const error = new Error(data.detail || 'Backend request failed.')
  error.status = response.status
  throw error
}

  return data
}

function normalizeProfile(data) {
  return {
    ...data,
    id: data.uid,
    firebaseUid: data.uid,
  }
}

function errorResult(error) {
  return {
    status: PROFILE_STATUS.ERROR,
    code: 'PROFILE_OPERATION_FAILED',
    message: error.message || 'Profile operation failed.',
  }
}

export async function createCustomerProfile({
  firebaseUser,
  fullName,
  businessType,
}) {
  try {
    const data = await apiRequest(firebaseUser, '/api/auth/profile', {
      method: 'POST',
      body: JSON.stringify({
        fullName,
        businessType,
      }),
    })

    return {
      status: PROFILE_STATUS.READY,
      profile: normalizeProfile(data.profile),
    }
  } catch (error) {
    return errorResult(error)
  }
}

export async function getVerifiedProfile(firebaseUser) {
  try {
    const data = await apiRequest(firebaseUser, '/api/auth/me')

    return {
      status: PROFILE_STATUS.READY,
      profile: normalizeProfile(data),
    }
  }   catch (error) {
    if (error.status === 404) {
      return { status: PROFILE_STATUS.NOT_FOUND }
    }

    return errorResult(error)
  }

    if (error.message?.includes('404')) {
      return { status: PROFILE_STATUS.NOT_FOUND }
    }

    return errorResult(error)
  }
}

export async function getOrCreateGoogleCustomerProfile({ firebaseUser }) {
  try {
    const data = await apiRequest(firebaseUser, '/api/auth/profile', {
      method: 'POST',
      body: JSON.stringify({
        fullName: firebaseUser.displayName || 'Brightloop Customer',
        businessType: 'other',
      }),
    })

    return {
      status: PROFILE_STATUS.READY,
      profile: normalizeProfile(data.profile),
    }
  } catch (error) {
    return errorResult(error)
  }
}

export async function syncAuthenticatedUser(firebaseUser) {
  // The Firebase token is verified on every protected API request.
  // No separate sync endpoint is currently required.
  return { status: PROFILE_STATUS.READY }
}
