import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  deleteUser,
  type User,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore'
import { getFirebaseAuth } from '@/infrastructure/firebase/firebase.auth'
import { getFirebaseFirestore } from '@/infrastructure/firebase/firebase.firestore'
import type { IAuthRepository } from '../domain/repositories'
import type { UserProfile } from '../domain/entities'
import type { UserPreferences } from '../domain/entities'
import { DEFAULT_USER_PREFERENCES } from '../domain/entities'
import { mapUserProfile } from './mappers/user.mapper'

export function createFirebaseAuthRepository(): IAuthRepository {
  function getAuth() {
    return getFirebaseAuth()
  }

  function getDb() {
    return getFirebaseFirestore()
  }

  async function signIn(email: string, password: string, _rememberMe: boolean): Promise<User> {
    const auth = getAuth()
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
  }

  async function signUp(email: string, password: string): Promise<User> {
    const auth = getAuth()
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    return credential.user
  }

  async function signOut(): Promise<void> {
    return firebaseSignOut(getAuth())
  }

  async function sendPasswordReset(email: string): Promise<void> {
    return sendPasswordResetEmail(getAuth(), email)
  }

  async function updateFirebaseProfile(user: User, data: { displayName?: string }): Promise<void> {
    return firebaseUpdateProfile(user, data)
  }

  function getCurrentUser(): User | null {
    return getAuth().currentUser
  }

  function onAuthStateChangedHandler(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(getAuth(), callback)
  }

  async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const db = getDb()
    const docRef = doc(db, 'users', uid)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return null
    return mapUserProfile(snapshot.id, snapshot.data() as Record<string, unknown>)
  }

  function subscribeToUserProfile(
    uid: string,
    onData: (profile: UserProfile | null) => void,
    onError: (error: Error) => void,
  ): () => void {
    const db = getDb()
    const docRef = doc(db, 'users', uid)
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          onData(null)
          return
        }
        const profile = mapUserProfile(snapshot.id, snapshot.data() as Record<string, unknown>)
        onData(profile)
      },
      (error) => {
        onError(error)
      },
    )
  }

  async function updateUserName(uid: string, name: string): Promise<void> {
    const db = getDb()
    const docRef = doc(db, 'users', uid)
    await updateDoc(docRef, {
      name,
      updatedAt: serverTimestamp(),
    })
  }

  async function createUserProfile(
    uid: string,
    data: { name: string; email: string }
  ): Promise<void> {
    const db = getDb()
    const docRef = doc(db, 'users', uid)
    const profile: Record<string, unknown> = {
      name: data.name,
      email: data.email,
      firstAccessCompleted: false,
      onboardingStep: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    await setDoc(docRef, profile)
  }

  async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const db = getDb()
    const docRef = doc(db, 'users', uid)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
  }

  async function getUserPreferences(uid: string): Promise<UserPreferences | null> {
    const db = getDb()
    const docRef = doc(db, 'userPreferences', uid)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return null
    return snapshot.data() as UserPreferences
  }

  async function saveUserPreferences(uid: string, preferences: UserPreferences): Promise<void> {
    const db = getDb()
    const docRef = doc(db, 'userPreferences', uid)
    await setDoc(docRef, {
      ...preferences,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }

  function subscribeToUserPreferences(
    uid: string,
    onData: (preferences: UserPreferences | null) => void,
    onError: (error: Error) => void,
  ): () => void {
    const db = getDb()
    const docRef = doc(db, 'userPreferences', uid)
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          onData(null)
          return
        }
        onData(snapshot.data() as UserPreferences)
      },
      (error) => {
        onError(error)
      },
    )
  }

  async function resetUserPreferences(uid: string): Promise<void> {
    const db = getDb()
    const docRef = doc(db, 'userPreferences', uid)
    await setDoc(docRef, {
      ...DEFAULT_USER_PREFERENCES,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }

  async function deleteUserAccount(uid: string): Promise<void> {
    const db = getDb()
    const auth = getAuth()

    const batch = writeBatch(db)

    const activitiesRef = collection(db, 'activities')
    const activitiesQuery = query(activitiesRef, where('userId', '==', uid))
    const activitiesSnapshot = await getDocs(activitiesQuery)
    activitiesSnapshot.docs.forEach((activityDoc) => {
      batch.delete(activityDoc.ref)
    })

    const prefsRef = doc(db, 'userPreferences', uid)
    batch.delete(prefsRef)

    const userRef = doc(db, 'users', uid)
    batch.delete(userRef)

    await batch.commit()

    const currentUser = auth.currentUser
    if (currentUser) {
      await deleteUser(currentUser)
    }
  }

  return {
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updateFirebaseProfile,
    getCurrentUser,
    onAuthStateChanged: onAuthStateChangedHandler,
    getUserProfile,
    subscribeToUserProfile,
    createUserProfile,
    updateUserProfile,
    updateUserName,
    getUserPreferences,
    saveUserPreferences,
    subscribeToUserPreferences,
    resetUserPreferences,
    deleteUserAccount,
  }
}
