import { createContext, useContext, useEffect, useState, useCallback, useRef, type PropsWithChildren } from 'react'
import { useAuth } from './auth-context'
import { createAuthUseCases } from '@/modules/authentication/application/use-cases'
import { createFirebaseAuthRepository } from '@/modules/authentication/infrastructure/firebase-auth.repository'
import { DEFAULT_USER_PREFERENCES, type UserPreferences } from '@/modules/authentication/domain/entities'

interface PreferencesContextValue {
  preferences: UserPreferences
  effectivePreferences: UserPreferences
  isLoading: boolean
  isPreviewing: boolean
  updatePreferences: (partial: Partial<UserPreferences>) => Promise<void>
  applyDraft: (draft: UserPreferences) => void
  saveDraftAndClear: () => Promise<void>
  clearDraft: () => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({ children }: PropsWithChildren) {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES)
  const [draftPreferences, setDraftPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const repository = createFirebaseAuthRepository()
  const authUseCases = createAuthUseCases(repository)

  const effectivePreferences = draftPreferences ?? preferences
  const isPreviewing = draftPreferences !== null

  useEffect(() => {
    if (!user) {
      setPreferences(DEFAULT_USER_PREFERENCES)
      setDraftPreferences(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    authUseCases.getUserPreferences(user.uid).then((data) => {
      if (data) {
        setPreferences(data)
      }
      setIsLoading(false)
    }).catch(() => {
      setIsLoading(false)
    })

    const unsub = authUseCases.subscribeToUserPreferences(
      user.uid,
      (data) => {
        if (data) {
          setPreferences(data)
        }
      },
      () => {},
    )

    return () => {
      unsub()
    }
  }, [user])

  const updatePreferences = useCallback(async (partial: Partial<UserPreferences>) => {
    if (!user) return

    const merged: UserPreferences = { ...preferences, ...partial, updatedAt: '' }

    setPreferences(merged)

    try {
      await authUseCases.saveUserPreferences(user.uid, merged)
    } catch {
      setPreferences(preferences)
      throw new Error('Não foi possível salvar as preferências.')
    }
  }, [user, preferences])

  const applyDraft = useCallback((draft: UserPreferences) => {
    setDraftPreferences(draft)
  }, [])

  const clearDraft = useCallback(() => {
    setDraftPreferences(null)
  }, [])

  const saveDraftAndClear = useCallback(async () => {
    if (!user || !draftPreferences) return

    const merged: UserPreferences = { ...draftPreferences, updatedAt: '' }

    setPreferences(merged)
    setDraftPreferences(null)

    try {
      await authUseCases.saveUserPreferences(user.uid, merged)
    } catch {
      setPreferences(preferences)
      setDraftPreferences(draftPreferences)
      throw new Error('Não foi possível salvar as preferências.')
    }
  }, [user, draftPreferences, preferences])

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        effectivePreferences,
        isLoading,
        isPreviewing,
        updatePreferences,
        applyDraft,
        saveDraftAndClear,
        clearDraft,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return ctx
}
