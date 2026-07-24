import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

function loadConfig(): FirebaseConfig {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
  const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID

  const missing: string[] = []
  if (!apiKey) missing.push('EXPO_PUBLIC_FIREBASE_API_KEY')
  if (!authDomain) missing.push('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN')
  if (!projectId) missing.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID')
  if (!storageBucket) missing.push('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET')
  if (!messagingSenderId) missing.push('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID')
  if (!appId) missing.push('EXPO_PUBLIC_FIREBASE_APP_ID')

  if (missing.length > 0) {
    throw new Error(
      `Firebase configuracao incompleta. Variaveis faltando: ${missing.join(', ')}`
    )
  }

  return {
    apiKey: apiKey as string,
    authDomain: authDomain as string,
    projectId: projectId as string,
    storageBucket: storageBucket as string,
    messagingSenderId: messagingSenderId as string,
    appId: appId as string,
  }
}

let app: FirebaseApp | null = null

export function getFirebaseApp(): FirebaseApp {
  if (app) return app

  const config = loadConfig()

  if (getApps().length > 0) {
    app = getApp()
  } else {
    app = initializeApp(config)
  }

  return app
}
