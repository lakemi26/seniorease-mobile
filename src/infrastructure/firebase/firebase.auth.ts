import { initializeAuth, getReactNativePersistence, getAuth, type Auth } from '@firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFirebaseApp } from './firebase.config'

let authInstance: Auth | null = null

export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance

  const app = getFirebaseApp()

  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  } catch {
    authInstance = getAuth(app)
  }

  return authInstance
}
