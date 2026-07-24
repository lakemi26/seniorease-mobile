import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseFirestore } from '@/infrastructure/firebase/firebase.firestore'
import type { IOnboardingRepository } from '../domain/repositories'
import type { OnboardingPreferences } from '../domain/entities'

export function createFirebaseOnboardingRepository(): IOnboardingRepository {
  function getDb() {
    return getFirebaseFirestore()
  }

  async function saveProgress(uid: string, step: number, preferences: OnboardingPreferences): Promise<void> {
    const db = getDb()
    const userRef = doc(db, 'users', uid)
    const prefsRef = doc(db, 'userPreferences', uid)

    await Promise.all([
      setDoc(userRef, {
        onboardingStep: step,
        updatedAt: serverTimestamp(),
      }, { merge: true }),
      setDoc(prefsRef, {
        ...preferences,
        updatedAt: serverTimestamp(),
      }, { merge: true }),
    ])
  }

  async function completeOnboarding(uid: string, preferences: OnboardingPreferences, userData?: { name: string; email: string }): Promise<void> {
    const db = getDb()
    const userRef = doc(db, 'users', uid)
    const prefsRef = doc(db, 'userPreferences', uid)

    const userUpdate: Record<string, unknown> = {
      firstAccessCompleted: true,
      onboardingStep: 6,
      updatedAt: serverTimestamp(),
    }
    void userData

    await Promise.all([
      setDoc(userRef, userUpdate, { merge: true }),
      setDoc(prefsRef, {
        ...preferences,
        updatedAt: serverTimestamp(),
      }, { merge: true }),
    ])
  }

  return {
    saveProgress,
    completeOnboarding,
  }
}
