import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  verifyBeforeUpdateEmail,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase'

export class AuthServiceError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'AuthServiceError'
    this.code = code
  }
}

const FIREBASE_ERROR_MESSAGES = {
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/wrong-password': 'The email or password is incorrect.',
  'auth/user-not-found': 'The email or password is incorrect.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Contact your administrator.',
  'auth/email-already-in-use': 'An account already exists with this email. Try signing in instead.',
  'auth/weak-password': 'Choose a stronger password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Google sign-in was cancelled.',
  'auth/popup-blocked': 'Your browser blocked the Google sign-in pop-up. Allow pop-ups and try again.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase yet.',
  'auth/unauthorized-domain':
    'This domain is not authorized for Firebase authentication. Add it in the Firebase console.',
  'auth/internal-error': 'Firebase could not complete the request. Please try again.',
  'auth/missing-password': 'Enter your current password to continue.',
  'auth/reauth-unavailable':
    'Reauthentication requires an email/password sign-in. Sign in again with your password to continue.',
  'auth/requires-recent-login': 'Please sign in again before changing your security details.',
}

const INTEGRATION_PENDING_MESSAGE =
  'Firebase authentication is not configured yet. Add the VITE_FIREBASE_* values to your .env file and restart the dev server.'

function requireFirebase() {
  if (!isFirebaseConfigured || !auth) {
    throw new AuthServiceError('integration-pending', INTEGRATION_PENDING_MESSAGE)
  }
}

export async function registerWithEmail({ email, password }) {
  requireFirebase()
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function loginWithEmail(email, password) {
  requireFirebase()
  return signInWithEmailAndPassword(auth, email, password)
}

export async function loginWithGoogle() {
  requireFirebase()
  if (!googleProvider) {
    throw new AuthServiceError('integration-pending', INTEGRATION_PENDING_MESSAGE)
  }
  return signInWithPopup(auth, googleProvider)
}

export async function requestPasswordReset(email) {
  requireFirebase()
  try {
    await sendPasswordResetEmail(auth, email)
    return { delivered: true }
  } catch (error) {
    if (error?.code === 'auth/user-not-found') {
      return { delivered: true }
    }
    throw error
  }
}

export function watchAuthState(onChange) {
  if (!auth) {
    onChange(null)
    return () => {}
  }
  return onAuthStateChanged(auth, onChange)
}

export async function signOutUser() {
  if (!auth) return
  await signOut(auth)
}

async function reauthenticateWithPassword(currentPassword) {
  requireFirebase()
  const user = auth.currentUser
  if (!user?.email) {
    throw new AuthServiceError(
      'auth/reauth-unavailable',
      'Reauthentication requires an email/password sign-in. Sign in again with your password to continue.',
    )
  }
  if (!currentPassword) {
    throw new AuthServiceError('auth/missing-password', 'Enter your current password to continue.')
  }
  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, credential)
  return user
}

export async function changePasswordWithReauth({ currentPassword, newPassword }) {
  try {
    const user = await reauthenticateWithPassword(currentPassword)
    await updatePassword(user, newPassword)
    return { ok: true, message: 'Your password was updated securely through Firebase.' }
  } catch (error) {
    return { ok: false, message: getAuthErrorMessage(error) }
  }
}

export async function changeEmailWithReauth({ currentPassword, newEmail }) {
  try {
    const user = await reauthenticateWithPassword(currentPassword)
    await verifyBeforeUpdateEmail(user, newEmail)
    return {
      ok: true,
      message:
        'A verification email was sent. Your Firebase sign-in email changes only after you verify it.',
    }
  } catch (error) {
    return { ok: false, message: getAuthErrorMessage(error) }
  }
}

export function getAuthErrorMessage(error) {
  if (error instanceof AuthServiceError) return error.message
  const code = error?.code ?? ''
  return FIREBASE_ERROR_MESSAGES[code] ?? 'Something went wrong. Please try again.'
}
