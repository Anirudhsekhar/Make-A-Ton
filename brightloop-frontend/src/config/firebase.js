import { getApps, initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const readEnv = (value) => (typeof value === 'string' ? value.trim() : '')

const rawConfig = {
  apiKey: readEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: readEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: readEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: readEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: readEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: readEnv(import.meta.env.VITE_FIREBASE_APP_ID),
}

export const firebaseEnvKeys = Object.freeze({
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
})

export const missingFirebaseConfig = Object.freeze(
  Object.entries(rawConfig)
    .filter(([, value]) => !value)
    .map(([key]) => firebaseEnvKeys[key]),
)

export const isFirebaseConfigured = missingFirebaseConfig.length === 0

let app = null
let auth = null
let googleProvider = null

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(rawConfig)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({ prompt: 'select_account' })
}

export { app, auth, googleProvider }
