import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { isFirebaseConfigured } from '../config/firebase'
import { ROLES, ROLE_LABELS, isKnownRole } from '../config/roles'
import {
  getAuthErrorMessage,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  requestPasswordReset,
  signOutUser,
  watchAuthState,
} from '../services/authService'
import {
  PROFILE_STATUS,
  createCustomerProfile,
  getOrCreateGoogleCustomerProfile,
  getVerifiedProfile,
  syncAuthenticatedUser,
} from '../services/userProfileService'

const EMPTY_SESSION = Object.freeze({
  firebaseUser: null,
  profile: null,
  status: 'loading',
  message: '',
  code: '',
})

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState({ ...EMPTY_SESSION })
  const requestRef = useRef(0)

  const resolveSession = useCallback(
    async (user, { expectedRole = null, allowGoogleProfileCreation = false } = {}) => {
      if (!user) {
        setSession({ ...EMPTY_SESSION, status: 'unauthenticated' })
        return {
          ok: false,
          reason: 'unauthenticated',
          message: 'Sign in to continue to Brightloop.',
        }
      }

      const requestId = requestRef.current + 1
      requestRef.current = requestId
      setSession((previous) => ({
        ...previous,
        firebaseUser: user,
        status: 'resolving',
        message: '',
        code: '',
      }))

      let result
      try {
        result = await getVerifiedProfile(user)

        if (allowGoogleProfileCreation && result?.status === PROFILE_STATUS.NOT_FOUND) {
          result = await getOrCreateGoogleCustomerProfile({ firebaseUser: user })
        }

        if (result?.status === PROFILE_STATUS.READY) {
          if (!result.profile || !isKnownRole(result.profile.role)) {
            result = {
              status: PROFILE_STATUS.ERROR,
              code: 'PROFILE_ROLE_INVALID',
              message:
                'Your account profile does not contain a verified Brightloop role. Contact your administrator.',
            }
          } else {
            await syncAuthenticatedUser(user)
          }
        }
      } catch (error) {
        result = {
          status: PROFILE_STATUS.ERROR,
          code: 'PROFILE_LOOKUP_FAILED',
          message:
            error instanceof Error
              ? error.message
              : 'Brightloop could not verify your account profile.',
        }
      }

      if (requestRef.current !== requestId) {
        return {
          ok: false,
          reason: 'superseded',
          message: 'Your session changed while it was being verified.',
        }
      }

      if (result?.status === PROFILE_STATUS.READY) {
        const profile = result.profile

        if (expectedRole && profile.role !== expectedRole) {
          requestRef.current += 1
          await signOutUser().catch(() => {})
          setSession({ ...EMPTY_SESSION, status: 'unauthenticated' })
          return {
            ok: false,
            reason: 'role-mismatch',
            message: `This account is verified as ${
              ROLE_LABELS[profile.role] ?? profile.role
            }, not ${ROLE_LABELS[expectedRole] ?? expectedRole}. Select the correct role and try again.`,
          }
        }

        setSession({
          firebaseUser: user,
          profile,
          status: 'verified',
          message: '',
          code: '',
        })

        return { ok: true, role: profile.role, profile }
      }

      const pendingStatus = result?.status === PROFILE_STATUS.ERROR ? 'error' : 'pending'
      const message = result?.message ?? 'Brightloop could not verify your account profile.'

      setSession({
        firebaseUser: user,
        profile: null,
        status: pendingStatus,
        message,
        code: result?.code ?? '',
      })

      return {
        ok: false,
        reason: pendingStatus,
        message,
        code: result?.code ?? '',
      }
    },
    [],
  )

  useEffect(() => {
    let active = true

    const unsubscribe = watchAuthState((user) => {
      if (!active) return

      if (!user) {
        requestRef.current += 1
        setSession({ ...EMPTY_SESSION, status: 'unauthenticated' })
        return
      }

      resolveSession(user)
    })

    return () => {
      active = false
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [resolveSession])

  const signIn = useCallback(
    async ({ email, password, role }) => {
      if (!isKnownRole(role)) {
        return {
          ok: false,
          reason: 'validation',
          message: 'Select the role you use to access Brightloop.',
        }
      }

      let credential
      try {
        credential = await loginWithEmail(email, password)
      } catch (error) {
        return { ok: false, reason: 'auth', message: getAuthErrorMessage(error) }
      }

      return resolveSession(credential.user, { expectedRole: role })
    },
    [resolveSession],
  )

  const signUpCustomer = useCallback(
    async ({ fullName, email, password, businessType }) => {
      let credential
      try {
        credential = await registerWithEmail({ email, password })
      } catch (error) {
        return { ok: false, reason: 'auth', message: getAuthErrorMessage(error) }
      }

      let creation
      try {
        creation = await createCustomerProfile({
          firebaseUser: credential.user,
          fullName,
          email,
          businessType,
        })
      } catch (error) {
        await signOutUser().catch(() => {})
        requestRef.current += 1
        setSession({ ...EMPTY_SESSION, status: 'unauthenticated' })
        return {
          ok: false,
          reason: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Your customer profile could not be created.',
        }
      }

      if (creation?.status !== PROFILE_STATUS.READY) {
        const pendingStatus = creation?.status === PROFILE_STATUS.ERROR ? 'error' : 'pending'
        const message = creation?.message ?? 'Your customer profile could not be created.'

        setSession({
          firebaseUser: credential.user,
          profile: null,
          status: pendingStatus,
          message,
          code: creation?.code ?? '',
        })

        return {
          ok: false,
          reason: pendingStatus,
          message,
          code: creation?.code ?? '',
        }
      }

      return resolveSession(credential.user, { expectedRole: ROLES.CUSTOMER })
    },
    [resolveSession],
  )

  const signInWithGoogle = useCallback(
    async (role) => {
      if (!isKnownRole(role)) {
        return {
          ok: false,
          reason: 'validation',
          message: 'Select the role you use to access Brightloop.',
        }
      }

      let credential
      try {
        credential = await loginWithGoogle()
      } catch (error) {
        return { ok: false, reason: 'auth', message: getAuthErrorMessage(error) }
      }

      return resolveSession(credential.user, { expectedRole: role })
    },
    [resolveSession],
  )

  const signUpWithGoogle = useCallback(async () => {
    let credential
    try {
      credential = await loginWithGoogle()
    } catch (error) {
      return { ok: false, reason: 'auth', message: getAuthErrorMessage(error) }
    }

    return resolveSession(credential.user, {
      expectedRole: ROLES.CUSTOMER,
      allowGoogleProfileCreation: true,
    })
  }, [resolveSession])

  const resetPassword = useCallback(async (email) => {
    try {
      await requestPasswordReset(email)
      return {
        ok: true,
        message: 'If an account exists for this email, a password reset link is on its way.',
      }
    } catch (error) {
      return { ok: false, message: getAuthErrorMessage(error) }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOutUser()
      return { ok: true }
    } catch {
      return {
        ok: false,
        message: 'Firebase could not be reached, but the local session was cleared.',
      }
    } finally {
      requestRef.current += 1
      setSession({ ...EMPTY_SESSION, status: 'unauthenticated' })
    }
  }, [])

  const refreshProfile = useCallback(() => {
    if (!session.firebaseUser) {
      return Promise.resolve({
        ok: false,
        reason: 'unauthenticated',
        message: 'Sign in to continue to Brightloop.',
      })
    }
    return resolveSession(session.firebaseUser)
  }, [resolveSession, session.firebaseUser])

  const value = useMemo(
    () => ({
      ...session,
      role: session.profile?.role ?? null,
      isAuthenticated: session.status === 'verified',
      isFirebaseConfigured,
      signIn,
      signUpCustomer,
      signInWithGoogle,
      signUpWithGoogle,
      resetPassword,
      logout,
      refreshProfile,
    }),
    [
      session,
      signIn,
      signUpCustomer,
      signInWithGoogle,
      signUpWithGoogle,
      resetPassword,
      logout,
      refreshProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }
  return context
}
