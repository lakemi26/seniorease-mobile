import { getFirestore, type Firestore } from 'firebase/firestore'
import { getFirebaseApp } from './firebase.config'

let dbInstance: Firestore | null = null

export function getFirebaseFirestore(): Firestore {
  if (dbInstance) return dbInstance

  const app = getFirebaseApp()
  dbInstance = getFirestore(app)

  return dbInstance
}
