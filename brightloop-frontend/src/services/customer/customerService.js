const API_URL = import.meta.env.VITE_API_BASE_URL

// TODO(customer-api): Confirm the final FastAPI paths and payloads with Thowfeek.
// Paths are deliberately not guessed. Set the corresponding VITE_CUSTOMER_*
// environment values when the contracts are agreed. Every request sends the
// Firebase ID token; the backend must verify the token, the customer role and
// ownership of the requested subscription/invoice.
const CUSTOMER_ENDPOINTS = Object.freeze({
  overview: import.meta.env.VITE_CUSTOMER_OVERVIEW_ENDPOINT || null,
  subscriptions: import.meta.env.VITE_CUSTOMER_SUBSCRIPTIONS_ENDPOINT || null,
  invoices: import.meta.env.VITE_CUSTOMER_INVOICES_ENDPOINT || null,
  profile: import.meta.env.VITE_CUSTOMER_PROFILE_ENDPOINT || '/api/auth/me',
  updateProfile: import.meta.env.VITE_CUSTOMER_UPDATE_PROFILE_ENDPOINT || null,
})

function integrationPending(label) {
  return new Error(
    `The customer ${label} endpoint has not been agreed with the FastAPI team yet. Demo mode remains available locally.`,
  )
}

async function apiRequest(firebaseUser, endpoint, { label, ...options } = {}) {
  if (!firebaseUser) {
    throw new Error('Sign in to load customer records.')
  }
  if (!API_URL) {
    throw new Error('Backend API URL is not configured.')
  }
  if (!endpoint) {
    throw integrationPending(label || 'data')
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

  if (!response.ok) {
    const error = new Error(
      data.detail || data.message || 'The customer request could not be completed.',
    )
    error.status = response.status
    throw error
  }

  return data
}

function asList(data, key) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.[key])) return data[key]
  if (Array.isArray(data?.items)) return data.items
  return []
}

function resourceEndpoint(id) {
  return `${CUSTOMER_ENDPOINTS.subscriptions}/${encodeURIComponent(id)}`
}

export async function fetchCustomerOverview(firebaseUser) {
  // TODO(customer-api): Return { activeSubscriptions, nextRenewal, outstandingAmount, recentInvoices }.
  return apiRequest(firebaseUser, CUSTOMER_ENDPOINTS.overview, { label: 'overview' })
}

export async function fetchCustomerSubscriptions(firebaseUser) {
  const data = await apiRequest(firebaseUser, CUSTOMER_ENDPOINTS.subscriptions, {
    label: 'subscriptions',
  })
  return asList(data, 'subscriptions')
}

export async function fetchCustomerSubscription(firebaseUser, subscriptionId) {
  return apiRequest(firebaseUser, resourceEndpoint(subscriptionId), { label: 'subscription detail' })
}

export async function requestCustomerSubscriptionAction(firebaseUser, subscriptionId, action) {
  // TODO(customer-api): Confirm the action verb and response contract. The backend
  // must re-check plan policy and customer ownership before applying the action.
  return apiRequest(firebaseUser, `${resourceEndpoint(subscriptionId)}/${action}`, {
    label: 'subscription action',
    method: 'POST',
    body: JSON.stringify({ action }),
  })
}

export async function fetchCustomerInvoices(firebaseUser) {
  const data = await apiRequest(firebaseUser, CUSTOMER_ENDPOINTS.invoices, {
    label: 'invoices',
  })
  return asList(data, 'invoices')
}

export async function fetchCustomerInvoice(firebaseUser, invoiceId) {
  return apiRequest(firebaseUser, `${CUSTOMER_ENDPOINTS.invoices}/${encodeURIComponent(invoiceId)}`, {
    label: 'invoice detail',
  })
}

export async function fetchCustomerInvoicePdf(firebaseUser, invoiceId) {
  if (!firebaseUser) throw new Error('Sign in to download invoices.')
  if (!API_URL) throw new Error('Backend API URL is not configured.')
  if (!CUSTOMER_ENDPOINTS.invoices) throw integrationPending('invoice PDF')

  const token = await firebaseUser.getIdToken()
  const response = await fetch(
    `${API_URL}${CUSTOMER_ENDPOINTS.invoices}/${encodeURIComponent(invoiceId)}/pdf`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  if (!response.ok) {
    throw new Error('The invoice PDF could not be downloaded from the backend.')
  }

  return response.blob()
}

export async function fetchCustomerProfile(firebaseUser) {
  return apiRequest(firebaseUser, CUSTOMER_ENDPOINTS.profile, { label: 'profile' })
}

export async function updateCustomerProfile(firebaseUser, payload) {
  // TODO(customer-api): Confirm the profile update method and field contract.
  return apiRequest(firebaseUser, CUSTOMER_ENDPOINTS.updateProfile, {
    label: 'profile update',
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
